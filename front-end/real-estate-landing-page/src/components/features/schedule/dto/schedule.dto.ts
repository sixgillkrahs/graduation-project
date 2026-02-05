export interface IScheduleDTO {
  id?: string;
  agentId: string;
  userId: string;
  listingId: string;
  customerName: string;
  customerPhone: string;
  title: string;
  customerEmail: string;
  startTime: Date;
  endTime: Date;
  location: string;
  type: SCHEDULE_TYPE;
  status: SCHEDULE_STATUS;
  customerNote: string;
  agentNote: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum SCHEDULE_TYPE {
  VIEWING = "VIEWING",
  MEETING = "MEETING",
  CALL = "CALL",
}

export enum SCHEDULE_STATUS {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface CreateScheduleRequest {
  userId?: string;
  listingId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type: SCHEDULE_TYPE;
  status: SCHEDULE_STATUS;
  customerNote: string;
  agentNote: string;
}
