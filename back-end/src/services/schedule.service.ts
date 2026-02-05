import { logger } from "@/config/logger";
import { singleton } from "@/decorators/singleton";
import ScheduleModel, { ISchedule } from "@/models/schedule.model";

@singleton
export class ScheduleService {
  constructor() {}

  async createSchedule(data: ISchedule & { agentId: string }) {
    return await ScheduleModel.create(data);
  }
}
