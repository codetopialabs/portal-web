export interface AdminActivityEntry {
  id: number;
  eventType: string;
  detail: string;
  ipAddress: string | null;
  userAgent: string;
  deviceName: string;
  createdAt: string;
}
