import "./../models.d.ts";
import { JobEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { Id, IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class JobService {
  public static readonly GetJobs = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IJobService.JobDTO>> => {
    return request({
      url: JobEndpoint.GetJobs(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly RetryJob = (id: Id): Promise<IResp<IJobService.JobDTO>> => {
    return request({
      url: JobEndpoint.RetryJob(id),
      method: AxiosMethod.POST,
    });
  };

  public static readonly DeleteJob = (id: Id): Promise<any> => {
    return request({
      url: JobEndpoint.DeleteJob(id),
      method: AxiosMethod.DELETE,
    });
  };
}
