export interface INoticeDto {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  type: "SYSTEM" | "PROPERTY" | "ACCOUNT" | "SCHEDULE";
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}
