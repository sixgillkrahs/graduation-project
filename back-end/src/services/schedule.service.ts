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

  async createSchedule(data: ISchedule & { agentId: string }) {
    return await ScheduleModel.create(data);
  }

  async getSchedules(filter: { agentId: string; start: Date; end: Date }) {
    const now = new Date();
    const expiredCandidates = await ScheduleModel.find({
      agentId: filter.agentId,
      status: SCHEDULE_STATUS.PENDING,
      date: { $lte: now },
    })
      .select("_id date endTime status")
      .lean();

    const expiredSchedules = expiredCandidates.filter(
      (schedule) =>
        schedule.status === SCHEDULE_STATUS.PENDING &&
        this.getScheduleEndDate(schedule) < now,
    );

    if (expiredSchedules.length > 0) {
      const expiredIds = expiredSchedules.map((schedule) => schedule._id);

      await ScheduleModel.updateMany(
        {
          _id: { $in: expiredIds },
          status: SCHEDULE_STATUS.CONFIRMED,
        },
        { $set: { status: SCHEDULE_STATUS.EXPIRED } },
      );

      expiredSchedules.forEach((schedule) => {
        schedule.status = SCHEDULE_STATUS.EXPIRED;
      });
    }

    const schedules = await ScheduleModel.find({
      agentId: filter.agentId,
      date: { $gte: filter.start, $lte: filter.end },
    }).sort({ date: 1 });

    const expiredIdSet = new Set(
      expiredSchedules.map((schedule) => String(schedule._id)),
    );
    schedules.forEach((schedule) => {
      if (expiredIdSet.has(String(schedule._id))) {
        schedule.status = SCHEDULE_STATUS.EXPIRED;
      }
    });

    return schedules;
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
