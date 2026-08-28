import { db } from "./database";
import type { FamilyMemberRecord, FamilyPhotoRecord } from "@/types";
import { syncService } from "@/services/syncService";

export const familyDb = {
  async saveFamilyMember(member: FamilyMemberRecord, triggerSync = true): Promise<void> {
    await db.familyMembers.put(member);
    if (triggerSync) {
      await syncService.enqueue(
        "FAMILY_MEMBER",
        member.id,
        "UPSERT",
        member.patientId,
        member
      );
    }
  },

  async deleteFamilyMember(id: string): Promise<void> {
    const member = await db.familyMembers.get(id);
    if (!member) return;

    await db.familyMembers.delete(id);
    
    // Also delete associated photo if it exists
    if (member.photoId) {
      await db.familyPhotos.delete(member.photoId);
    }

    await syncService.enqueue(
      "FAMILY_MEMBER",
      id,
      "DELETE",
      member.patientId,
      { id }
    );
  },

  async listFamilyMembers(patientId: string): Promise<FamilyMemberRecord[]> {
    return await db.familyMembers
      .where("patientId")
      .equals(patientId)
      .toArray();
  },

  async getActiveFamilyMembers(patientId: string): Promise<FamilyMemberRecord[]> {
    return await db.familyMembers
      .where("patientId")
      .equals(patientId)
      .filter((m) => m.active)
      .toArray();
  },

  async saveFamilyPhoto(photo: FamilyPhotoRecord, _triggerSync = true): Promise<void> {
    await db.familyPhotos.put(photo);
    
    // We don't use the standard sync queue for photos since they are binary blobs
    // Instead, the API client will handle the multipart upload, or we could create
    // a separate sync mechanism for files if needed. For now, photo upload is
    // assumed to happen directly via API when online.
  },

  async getFamilyPhoto(id: string): Promise<FamilyPhotoRecord | undefined> {
    return await db.familyPhotos.get(id);
  },

  async getPhotoUrl(photoId: string | undefined): Promise<string | undefined> {
    if (!photoId) return undefined;
    const photo = await this.getFamilyPhoto(photoId);
    if (!photo) return undefined;
    
    // Create an object URL from the blob
    return URL.createObjectURL(photo.blob);
  }
};
