import { GeneralSettingsEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IResp } from "@shared/types/service";

export default class GeneralSettingsService {
  public static readonly GetGeneralSettings = (): Promise<
    IResp<ISettingService.GeneralSettingsDTO>
  > => {
    return request({
      url: GeneralSettingsEndpoint.GetGeneralSettings(),
      method: AxiosMethod.GET,
    });
  };

  public static readonly GetPublicGeneralSettings = (): Promise<
    IResp<ISettingService.GeneralSettingsDTO>
  > => {
    return request({
      url: GeneralSettingsEndpoint.GetPublicGeneralSettings(),
      method: AxiosMethod.GET,
    });
  };

  public static readonly UpdateGeneralSettings = (
    payload: ISettingService.UpdateGeneralSettingsDTO,
  ): Promise<IResp<ISettingService.GeneralSettingsDTO>> => {
    return request({
      url: GeneralSettingsEndpoint.UpdateGeneralSettings(),
      method: AxiosMethod.PUT,
      data: payload,
    });
  };
}
