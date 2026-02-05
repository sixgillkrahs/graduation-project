import { IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { EditProfileEndpoint } from "./config";

export default class EditProfileService {
  public static readonly editProfile = (
    data: IEditProfileService.IFormData,
  ): Promise<IResp<void>> => {
    return request({
      url: EditProfileEndpoint.editProfile(),
      method: AxiosMethod.PATCH,
      data,
    });
  };
}
