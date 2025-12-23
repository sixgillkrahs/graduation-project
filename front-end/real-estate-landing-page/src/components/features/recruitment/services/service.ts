import { IResp } from "@/@types/service";
import { fetchAI } from "@/lib/axios/fetchAI";
import { AxiosMethod } from "@/lib/axios/method";
import { ExtractEndpoint } from "./config";

export default class ExtractService {
  public static readonly ExtractID = (
    file: FormData
  ): Promise<IResp<string>> => {
    return fetchAI({
      url: ExtractEndpoint.extractID(),
      method: AxiosMethod.POST,
      data: file,
    });
  };
}
