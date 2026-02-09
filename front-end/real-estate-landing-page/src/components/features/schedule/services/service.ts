import { IPaginationResp, IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import {
  CreateScheduleRequest,
  IScheduleDTO,
  SCHEDULE_STATUS,
  SCHEDULE_TYPE,
} from "../dto/schedule.dto";
import { ScheduleEndpoint } from "./config";

export default class ScheduleService {
  public static readonly SCHEDULE_TYPE_OPTIONS = [
    { label: "Viewing", value: SCHEDULE_TYPE.VIEWING },
    { label: "Meeting", value: SCHEDULE_TYPE.MEETING },
    { label: "Call", value: SCHEDULE_TYPE.CALL },
  ];

  public static readonly SCHEDULE_STATUS_OPTIONS = [
    { label: "Pending", value: SCHEDULE_STATUS.PENDING },
    { label: "Confirmed", value: SCHEDULE_STATUS.CONFIRMED },
    { label: "Cancelled", value: SCHEDULE_STATUS.CANCELLED },
    { label: "Completed", value: SCHEDULE_STATUS.COMPLETED },
  ];

  public static readonly EVENT_COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#6b7280",
  ];

  public static readonly createSchedule = (
    data: CreateScheduleRequest,
  ): Promise<IResp<string>> => {
    return request({
      url: ScheduleEndpoint.createSchedule(),
      method: AxiosMethod.POST,
      data,
    });
  };

  public static readonly getSchedulesMe = (
    params: any,
  ): Promise<IPaginationResp<IScheduleDTO>> => {
    return request({
      url: ScheduleEndpoint.getSchedule(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly deleteSchedule = (
    id: string,
  ): Promise<IResp<string>> => {
    return request({
      url: ScheduleEndpoint.deleteSchedule(id),
      method: AxiosMethod.DELETE,
    });
  };

  public static readonly updateSchedule = (
    id: string,
    data: CreateScheduleRequest,
  ): Promise<IResp<string>> => {
    return request({
      url: ScheduleEndpoint.updateSchedule(id),
      method: AxiosMethod.PUT,
      data,
    });
  };

  public static readonly getScheduleById = (
    id: string,
  ): Promise<IResp<IScheduleDTO>> => {
    return request({
      url: ScheduleEndpoint.getScheduleById(id),
      method: AxiosMethod.GET,
    });
  };
}
