import { useEffect, useState, useRef } from "react";
import { caregiverApi, familyApi, type PatientSummary } from "@/services/api";
import { authApi } from "@/services/api/auth";
import { useTranslation } from "@/hooks/useTranslation";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { familyDb } from "@/db/familyMembers";
import type { FamilyMemberRecord, RelationshipCode } from "@/types";

const RELATIONSHIPS: RelationshipCode[] = [
  "MOTHER", "FATHER", "GRANDMOTHER", "GRANDFATHER",
  "BROTHER", "SISTER", "SON", "DAUGHTER",
  "GRANDSON", "GRANDDAUGHTER", "UNCLE", "AUNT",
  "COUSIN", "SPOUSE", "OTHER"
];

export function CaregiverFamilyPage() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMemberRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<RelationshipCode>("OTHER");
  const [nickname, setNickname] = useState("");
  const [active, setActive] = useState(true);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load patients on mount
  useEffect(() => {
    let cancelled = false;
    async function loadPatients() {
      const caregiverId = authApi.getCaregiverId();
      if (!caregiverId) return;

      const res = await caregiverApi.getPatients(caregiverId);
      if (cancelled) return;

      if (!res.ok) {
        setError(res.error || "Failed to load patients");
      } else {
        setPatients(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedPatientId(res.data[0].id);
        }
      }
      setLoading(false);
    }
    void loadPatients();
    return () => { cancelled = true; };
  }, []);

  // Load family members when patient changes
  useEffect(() => {
    if (!selectedPatientId) return;
    
    let cancelled = false;
    async function loadMembers() {
      // First try to load from backend if online
      const res = await familyApi.getFamilyMembers(selectedPatientId!);
      if (cancelled) return;
      
      if (res.ok && res.data) {
        // Sync to local offline db
        for (const member of res.data) {
          // Check if photo exists and we don't have it locally (simplified sync)
          if (member.photoId) {
            const hasPhoto = await familyDb.getFamilyPhoto(member.photoId);
            if (!hasPhoto) {
              try {
                const photoRes = await fetch(familyApi.getPhotoUrl(member.id));
                if (photoRes.ok) {
                  const blob = await photoRes.blob();
                  await familyDb.saveFamilyPhoto({
                    id: member.photoId,
                    familyMemberId: member.id,
                    blob,
                    mimeType: blob.type,
                    createdAt: new Date().toISOString()
                  }, false);
                }
              } catch (e) {
                console.error("Failed to fetch photo during sync", e);
              }
            }
          }
          await familyDb.saveFamilyMember(member, false);
        }
      }
      
      // Always display from local db
      const localMembers = await familyDb.listFamilyMembers(selectedPatientId!);
      if (!cancelled) {
        setMembers(localMembers);
      }
    }
    
    void loadMembers();
    return () => { cancelled = true; };
  }, [selectedPatientId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large. Please select an image under 2MB.");
      return;
    }
    
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreviewUrl(url);
  };

  const openAddModal = () => {
    setEditId(null);
    setName("");
    setRelation("OTHER");
    setNickname("");
    setActive(true);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = async (member: FamilyMemberRecord) => {
    setEditId(member.id);
    setName(member.name);
    setRelation(member.relation);
    setNickname(member.nickname || "");
    setActive(member.active);
    setPhotoFile(null);
    
    if (member.photoId) {
      const url = await familyDb.getPhotoUrl(member.photoId);
      setPhotoPreviewUrl(url || null);
    } else {
      setPhotoPreviewUrl(null);
    }
    
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    
    setIsSubmitting(true);
    
    try {
      let currentMember: FamilyMemberRecord;
      
      if (editId) {
        // Update
        const res = await familyApi.updateFamilyMember(editId, {
          name, relation, nickname, active
        });
        if (!res.ok || !res.data) throw new Error(res.error || "Update failed");
        currentMember = res.data;
      } else {
        // Create
        if (!photoFile) throw new Error("Photo is required for new family members");
        
        const res = await familyApi.createFamilyMember({
          patientId: selectedPatientId,
          name, relation, nickname, active
        });
        if (!res.ok || !res.data) throw new Error(res.error || "Create failed");
        currentMember = res.data;
      }
      
      // Handle photo upload
      if (photoFile) {
        const uploadRes = await familyApi.uploadPhoto(currentMember.id, photoFile);
        if (!uploadRes.ok || !uploadRes.data) throw new Error("Photo upload failed");
        
        currentMember.photoId = uploadRes.data.photoId;
        
        // Save photo to local offline db immediately
        await familyDb.saveFamilyPhoto({
          id: currentMember.photoId,
          familyMemberId: currentMember.id,
          blob: photoFile,
          mimeType: photoFile.type,
          createdAt: new Date().toISOString()
        }, false);
      }
      
      // Save member to local db
      await familyDb.saveFamilyMember(currentMember, false);
      
      // Refresh list
      const localMembers = await familyDb.listFamilyMembers(selectedPatientId);
      setMembers(localMembers);
      
      setIsModalOpen(false);
    } catch (err) {
      alert(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this family member?")) return;
    
    await familyApi.deleteFamilyMember(id);
    await familyDb.deleteFamilyMember(id);
    
    if (selectedPatientId) {
      const localMembers = await familyDb.listFamilyMembers(selectedPatientId);
      setMembers(localMembers);
    }
  };

  const handleToggleActive = async (member: FamilyMemberRecord) => {
    try {
      const res = await familyApi.updateFamilyMember(member.id, { active: !member.active });
      if (res.ok && res.data) {
        await familyDb.saveFamilyMember(res.data, false);
        if (selectedPatientId) {
          const localMembers = await familyDb.listFamilyMembers(selectedPatientId);
          setMembers(localMembers);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("nav.family")}</h1>
          <p className="text-sm text-elder-muted">Manage family members for recognition games.</p>
        </div>
        <button 
          onClick={openAddModal}
          disabled={!selectedPatientId}
          className="bg-elder-primary text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-50"
        >
          + Add Member
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <label className="font-semibold whitespace-nowrap">Select Patient:</label>
        <select 
          value={selectedPatientId || ""} 
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="flex-1 p-2 border-2 border-gray-200 rounded-xl outline-none focus:border-elder-primary"
        >
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      
      {members.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-elder-muted mb-4">No family members added yet.</p>
          <button 
            onClick={openAddModal}
            className="text-elder-primary font-semibold hover:underline"
          >
            Add the first family member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => (
            <div key={m.id} className={`bg-white rounded-2xl shadow-sm border p-4 flex flex-col ${!m.active ? 'opacity-60 border-dashed' : 'border-gray-100'}`}>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {m.photoId ? (
                    <img src={familyApi.getPhotoUrl(m.id)} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{m.name}</h3>
                  <p className="text-sm text-elder-primary font-medium">{t(`relation.${m.relation}`)}</p>
                  {m.nickname && <p className="text-sm text-elder-muted truncate">"{m.nickname}"</p>}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <button 
                  onClick={() => handleToggleActive(m)}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${m.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  {m.active ? 'Active' : 'Inactive'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(m)} className="text-sm text-blue-600 font-semibold hover:underline">Edit</button>
                  <button onClick={() => handleDelete(m.id)} className="text-sm text-red-600 font-semibold hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl my-8">
            <h2 className="text-2xl font-bold mb-6">{editId ? "Edit Family Member" : "Add Family Member"}</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-2 mb-2">
                <div 
                  className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreviewUrl ? (
                    <img src={photoPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-gray-500 font-medium text-center px-2">Tap to upload photo</span>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                {!editId && !photoFile && <p className="text-xs text-red-500 mt-1">Photo is required</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-elder-primary outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Relationship</label>
                <select 
                  value={relation}
                  onChange={(e) => setRelation(e.target.value as RelationshipCode)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-elder-primary outline-none"
                  required
                >
                  {RELATIONSHIPS.map(r => (
                    <option key={r} value={r}>{t(`relation.${r}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Nickname (Optional)</label>
                <input 
                  type="text" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-elder-primary outline-none"
                  placeholder="e.g. Grandma Mary"
                />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-elder-ink font-semibold rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || (!editId && !photoFile)}
                  className="flex-1 py-3 bg-elder-primary text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
