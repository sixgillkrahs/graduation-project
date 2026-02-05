import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { CreateScheduleRequest } from "../dto/schedule.dto";
import { ScheduleEndpoint } from "./config";

export default class ScheduleService {
  public static readonly createSchedule = (
    data: CreateScheduleRequest,
  ): Promise<IResp<string>> => {
    return request({
      url: ScheduleEndpoint.createSchedule(),
      method: AxiosMethod.POST,
      data,
    });
  };
}
