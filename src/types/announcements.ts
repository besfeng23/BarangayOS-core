import { Timestamp } from 'firebase/firestore';

export namespace AnnouncementsTypes {

  export type AnnouncementStatus = "draft" | "pending" | "published" | "archived";
  export type AnnouncementPriority = "info" | "urgent" | "emergency";
  export type AnnouncementCategory = "Emergency" | "Health" | "Events" | "Services" | "Ordinances" | "Jobs" | "LostFound" | "Utilities";
  export type AudienceScopeType = "all" | "purok" | "sector" | "staff";

  export interface Announcement {
    id: string;
    title: string;
    body: string;
    summary?: string;
    category: AnnouncementCategory;
    priority: AnnouncementPriority;
    status: AnnouncementStatus;
    audience: {
      scopeType: AudienceScopeType;
      scopeValues: string[];
    };
    publishAt?: Timestamp;
    expiresAt?: Timestamp;
    pinnedUntil?: Timestamp;
    authorId: string;
    authorName: string;
    authorRole: string;
    attachmentCount: number;
    attachments: {
      type: 'image' | 'video' | 'pdf' | 'file';
      url: string;
      name: string;
      size: number;
    }[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  export interface ReadReceipt {
    userId: string;
    readAt: Timestamp;
    acknowledgedAt?: Timestamp;
  }

  export interface AuditTrailEntry {
    action: 'created' | 'edited' | 'submitted' | 'approved' | 'rejected' | 'published' | 'archived' | 'pinned';
    byUserId: string;
    byName: string;
    at: Timestamp;
    notes?: string;
  }
}
