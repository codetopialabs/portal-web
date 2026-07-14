export interface AdminActivityEntry {
  id: number;
  eventType: string;
  detail: string;
  ipAddress: string | null;
  userAgent: string;
  deviceName: string;
  createdAt: string;
  userId: string | null;
  username: string | null;
  userEmail: string;
  actorId: string | null;
  actorUsername: string | null;
  actorEmail: string;
}
