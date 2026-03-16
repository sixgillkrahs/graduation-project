import { singleton } from "@/decorators/singleton";
import ScheduleModel, {
  ISchedule,
  SCHEDULE_STATUS,
} from "@/models/schedule.model";
import { PropertyService } from "./property.service";

const PUBLIC_VIEWING_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

@singleton
export class ScheduleService {
  constructor(private propertyService: PropertyService = new PropertyService()) {}

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

  private getMinutesFromTime(time: string) {
    const { hours, minutes } = this.parseTime(time);
    return hours * 60 + minutes;
  }

  private hasTimeOverlap(
    timeRange: Pick<ISchedule, "startTime" | "endTime">,
    schedule: Pick<ISchedule, "startTime" | "endTime">,
  ) {
    const rangeStart = this.getMinutesFromTime(timeRange.startTime);
    const rangeEnd = this.getMinutesFromTime(timeRange.endTime);
    const scheduleStart = this.getMinutesFromTime(schedule.startTime);
    const scheduleEnd = this.getMinutesFromTime(schedule.endTime);

    return rangeStart < scheduleEnd && scheduleStart < rangeEnd;
  }

  private getDayRange(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
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

  async getSchedules(filter: {
    agentId?: string;
    userId?: string;
    start: Date;
    end: Date;
  }) {
    return await ScheduleModel.find({
      ...(filter.agentId ? { agentId: filter.agentId } : {}),
      ...(filter.userId ? { userId: filter.userId } : {}),
      date: { $gte: filter.start, $lte: filter.end },
    })
      .sort({ date: 1 })
      .populate("listingId");
  }

  async hasScheduleConflict(filter: {
    agentId: string;
    date: Date;
    startTime: string;
    endTime: string;
    statuses: SCHEDULE_STATUS[];
    userId?: string;
    excludeScheduleId?: string;
  }) {
    const { start, end } = this.getDayRange(filter.date);
    const schedules = await ScheduleModel.find({
      agentId: filter.agentId,
      ...(filter.userId ? { userId: filter.userId } : {}),
      ...(filter.excludeScheduleId
        ? { _id: { $ne: filter.excludeScheduleId } }
        : {}),
      date: { $gte: start, $lte: end },
      status: { $in: filter.statuses },
    })
      .select("startTime endTime")
      .lean()
      .exec();

    return schedules.some((schedule) =>
      this.hasTimeOverlap(
        { startTime: filter.startTime, endTime: filter.endTime },
        schedule,
      ),
    );
  }

  async getPublicAvailability(listingId: string, date: Date) {
    const property = await this.propertyService.getPropertyById(listingId, "userId");
    if (!property) {
      return null;
    }

    const agentId =
      (property as any).userId?._id?.toString?.() ||
      (property as any).userId?.toString?.();

    if (!agentId) {
      return null;
    }

    const { start, end } = this.getDayRange(date);

    const schedules = await ScheduleModel.find({
      agentId,
      date: { $gte: start, $lte: end },
      // Pending viewing requests can coexist until the agent accepts one.
      status: SCHEDULE_STATUS.CONFIRMED,
    })
      .select("startTime endTime status type listingId")
      .lean()
      .exec();

    const slots = PUBLIC_VIEWING_SLOTS.map((slot) => {
      const slotEnd = this.addMinutesToTime(slot, 60);
      const conflictingSchedules = schedules.filter((schedule) => {
        return this.hasTimeOverlap(
          { startTime: slot, endTime: slotEnd },
          schedule,
        );
      });

      return {
        slot,
        endTime: slotEnd,
        isAvailable: conflictingSchedules.length === 0,
        conflictCount: conflictingSchedules.length,
      };
    });

    const availableCount = slots.filter((slot) => slot.isAvailable).length;

    return {
      listingId,
      date: start.toISOString(),
      totalSlots: PUBLIC_VIEWING_SLOTS.length,
      availableCount,
      slots,
    };
  }

  async getLeads(agentId: string) {
    return await ScheduleModel.find({
      agentId,
      listingId: { $exists: true, $ne: null },
    })
      .sort({ updatedAt: -1, date: -1 })
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
