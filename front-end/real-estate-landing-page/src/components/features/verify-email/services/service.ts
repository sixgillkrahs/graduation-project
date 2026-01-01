import { IResp } from "@/@types/service";
import { fetchAI } from "@/lib/axios/fetchAI";
import { AxiosMethod } from "@/lib/axios/method";
import { VerifyEmailEndpoint } from "./config";
import { ParamValue } from "next/dist/server/request/params";
import request from "@/lib/axios/request";

export default class VerifyEmailService {
  public static readonly verifyEmail = (
    token: ParamValue
  ): Promise<IResp<string>> => {
    return request({
      url: VerifyEmailEndpoint.verifyEmail(token),
      method: AxiosMethod.GET,
    });
  };

}
