import { singleton } from "@/decorators/singleton";
import ScheduleModel, {
  ISchedule,
  SCHEDULE_STATUS,
} from "@/models/schedule.model";

@singleton
export class ScheduleService {
  constructor() {}

  private parseTime(time: string) {
    const normalizedTime = time.trim().toUpperCase();
    const amPmMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

    if (amPmMatch) {
      let hours = Number(amPmMatch[1]);
      const minutes = Number(amPmMatch[2]);
      const period = amPmMatch[3];

      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      return { hours, minutes };
    }

    const [hours = "0", minutes = "0"] = normalizedTime.split(":");
    return { hours: Number(hours), minutes: Number(minutes) };
  }

  private getScheduleEndDate(schedule: Pick<ISchedule, "date" | "endTime">) {
    const { hours, minutes } = this.parseTime(schedule.endTime);
    const scheduleEndDate = new Date(schedule.date);

    scheduleEndDate.setHours(hours, minutes, 0, 0);

    return scheduleEndDate;
  }

  private formatTime(hours: number, minutes: number) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  addMinutesToTime(time: string, minutesToAdd: number) {
    const { hours, minutes } = this.parseTime(time);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + minutesToAdd);

    return this.formatTime(date.getHours(), date.getMinutes());
  }

  async expireConfirmedSchedules(agentId?: string) {
    const now = new Date();
    const filter: Record<string, unknown> = {
      status: SCHEDULE_STATUS.PENDING,
      date: { $lte: now },
    };

    if (agentId) {
      filter.agentId = agentId;
    }

    const expiredCandidates =
      await ScheduleModel.find(filter).select("_id date endTime");

    const expiredIds = expiredCandidates
      .filter((schedule) => this.getScheduleEndDate(schedule) < now)
      .map((schedule) => schedule._id);

    if (expiredIds.length === 0) {
      return 0;
    }

    const result = await ScheduleModel.updateMany(
      {
        _id: { $in: expiredIds },
        status: SCHEDULE_STATUS.PENDING,
      },
      { $set: { status: SCHEDULE_STATUS.EXPIRED } },
    );

    return result.modifiedCount;
  }

  async createSchedule(data: ISchedule & { agentId: string }) {
    return await ScheduleModel.create(data);
  }

  async getSchedules(filter: { agentId: string; start: Date; end: Date }) {
    return await ScheduleModel.find({
      agentId: filter.agentId,
      date: { $gte: filter.start, $lte: filter.end },
    })
      .sort({ date: 1 })
      .populate("listingId");
  }

  async getLeads(agentId: string) {
    return await ScheduleModel.find({
      agentId,
      status: { $in: [SCHEDULE_STATUS.CONFIRMED, SCHEDULE_STATUS.COMPLETED] },
    })
      .sort({ date: -1 })
      .populate("listingId");
  }

  async deleteSchedule(id: string) {
    return await ScheduleModel.findByIdAndDelete(id);
  }

  async updateSchedule(id: string, data: Partial<ISchedule>) {
    return await ScheduleModel.findByIdAndUpdate(id, data);
  }

  async getScheduleById(id: string) {
    return await ScheduleModel.findById(id).populate("listingId");
  }
}
