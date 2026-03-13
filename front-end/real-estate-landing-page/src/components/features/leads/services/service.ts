import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import {
  CreateLeadRequest,
  CreateLeadResponse,
  ILeadDto,
  UpdateLeadStatusRequest,
} from "./type";
import { LeadEndpoint } from "./config";

export default class LeadService {
  public static readonly create = (
    data: CreateLeadRequest,
  ): Promise<IResp<CreateLeadResponse>> => {
    return request({
      url: LeadEndpoint.create(),
      method: AxiosMethod.POST,
      data,
    });
  };

  public static readonly getAgentLeads = (): Promise<IResp<ILeadDto[]>> => {
    return request({
      url: LeadEndpoint.agent(),
      method: AxiosMethod.GET,
    });
  };

  public static readonly updateStatus = ({
    id,
    status,
  }: UpdateLeadStatusRequest): Promise<IResp<ILeadDto>> => {
    return request({
      url: LeadEndpoint.updateStatus(id),
      method: AxiosMethod.PATCH,
      data: { status },
    });
  };
}
