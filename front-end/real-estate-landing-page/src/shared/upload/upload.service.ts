import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { UploadEndpoint } from "./config.upload";
import { IResp } from "@/@types/service";

export default class UploadService {
  public static readonly uploadImages = (
    files: File[],
  ): Promise<IResp<IUploadService.IUploadResponse>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    return request({
      url: UploadEndpoint.uploadImages(),
      method: AxiosMethod.POST,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };
}
