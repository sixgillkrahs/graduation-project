import { SCHEDULE_STATUS, SCHEDULE_TYPE } from "@/models/schedule.model";

export interface IScheduleDTO {
  id?: string;
  agentId: string;
  userId: string;
  listingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  type: SCHEDULE_TYPE;
  status: SCHEDULE_STATUS;
  customerNote: string;
  agentNote: string;
  createdAt?: Date;
  updatedAt?: Date;
  title: string;
  color?: string;
}
