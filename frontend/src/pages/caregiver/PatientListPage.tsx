import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { caregiverApi, type PatientSummary } from "@/services/api";
import { authApi } from "@/services/api/auth";
import { useTranslation } from "@/hooks/useTranslation";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";

export function PatientListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add Patient Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatientId, setNewPatientId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    const caregiverId = authApi.getCaregiverId();
    if (!caregiverId) return;
    const res = await caregiverApi.getPatients(caregiverId);
    if (!res.ok) {
      setError(res.error || t("caregiver.errorFetchingPatients"));
    } else {
      setPatients(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchPatients();
  }, [t]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientId.trim()) return;
    
    setIsAssigning(true);
    const caregiverId = authApi.getCaregiverId();
    if (!caregiverId) return;
    const res = await caregiverApi.assignPatient(caregiverId, newPatientId.trim());
    setIsAssigning(false);
    
    if (res.ok) {
      setIsModalOpen(false);
      setNewPatientId("");
      void fetchPatients(); // Refresh list
    } else {
      alert("Failed to assign patient. Ensure the patient ID exists.");
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("caregiver.patientsTitle")}</h1>
          <p className="text-sm text-elder-muted">{t("caregiver.patientsDescription")}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-elder-primary text-white px-4 py-2 rounded-xl font-semibold shadow-sm hover:bg-elder-primary/90 transition-colors"
        >
          + Add Patient
        </button>
      </div>
      
      {patients.length === 0 ? (
        <EmptyState title={t("caregiver.noPatientsAssigned")} />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-elder-muted">
              <tr>
                <th className="px-6 py-4 font-medium">{t("caregiver.patientName")}</th>
                <th className="px-6 py-4 font-medium">{t("caregiver.patientStatus")}</th>
                <th className="px-6 py-4 font-medium">{t("caregiver.lastActive")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((p) => (
                <tr 
                  key={p.id} 
                  className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => navigate(`/caregiver/patients/${p.id}`)}
                >
                  <td className="px-6 py-4 font-bold text-elder-ink">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      p.status === "stable" ? "bg-green-100 text-green-800" :
                      p.status === "needs_attention" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {p.status === "stable" ? "Stable" : p.status === "needs_attention" ? "Needs Attention" : "Critical"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-elder-muted font-medium">
                    {new Date(p.lastActive).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-patient-title"
          >
            <h2 id="add-patient-title" className="text-2xl font-bold mb-4">Add a Patient</h2>
            <p className="text-sm text-elder-muted mb-6">Enter the patient's unique device or assignment ID to link them to your caregiver account.</p>
            
            <form onSubmit={handleAddPatient} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="patientId">Patient ID</label>
                <input 
                  id="patientId"
                  type="text" 
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-elder-primary outline-none"
                  placeholder="e.g., demo-patient-local"
                  required
                  autoFocus
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
                  disabled={isAssigning || !newPatientId.trim()}
                  className="flex-1 py-3 bg-elder-primary text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {isAssigning ? "Assigning..." : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
