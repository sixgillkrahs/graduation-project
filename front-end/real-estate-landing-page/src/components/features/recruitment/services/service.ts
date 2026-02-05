import { IResp } from "@/@types/service";
import { fetchAI } from "@/lib/axios/fetchAI";
import { AxiosMethod } from "@/lib/axios/method";
import { ExtractEndpoint } from "./config";

export default class ExtractService {
  public static readonly options = [
    { label: "Nam", value: "Nam" },
    { label: "Nữ", value: "Nữ" },
  ];

  public static readonly ExtractID = (
    file: FormData,
  ): Promise<IResp<string>> => {
    return fetchAI({
      url: ExtractEndpoint.extractID(),
      method: AxiosMethod.POST,
      data: file,
    });
  };

  public static readonly UploadImage = (
    file: FormData,
  ): Promise<IResp<string>> => {
    return fetchAI({
      url: ExtractEndpoint.uploadImage(),
      method: AxiosMethod.POST,
      data: file,
    });
  };

  public static readonly registration = (
    data: IExtractService.IRegistrationRequest,
  ): Promise<IResp<string>> => {
    return fetchAI({
      url: ExtractEndpoint.registration(),
      method: AxiosMethod.POST,
      data,
    });
  };
}
