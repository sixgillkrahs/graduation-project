import { logger } from "@/config/logger";
import { singleton } from "@/decorators/singleton";
import ScheduleModel, { ISchedule } from "@/models/schedule.model";

@singleton
export class ScheduleService {
  constructor() {}

  async createSchedule(data: ISchedule & { agentId: string }) {
    return await ScheduleModel.create(data);
  }

  async getSchedules(filter: { agentId: string; start: Date; end: Date }) {
    return await ScheduleModel.find({
      agentId: filter.agentId,
      date: { $gte: filter.start, $lte: filter.end },
    }).sort({ date: 1 });
  }

  async deleteSchedule(id: string) {
    return await ScheduleModel.findByIdAndDelete(id);
  }

  async updateSchedule(id: string, data: Partial<ISchedule>) {
    return await ScheduleModel.findByIdAndUpdate(id, data);
  }

  async getScheduleById(id: string) {
    return await ScheduleModel.findById(id);
  }
}
