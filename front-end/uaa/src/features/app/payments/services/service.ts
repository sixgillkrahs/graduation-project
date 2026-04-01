import "../models.d.ts";
import { PaymentEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class PaymentService {
  public static readonly GetUpgradeTransactions = (
    params: IParamsPagination & {
      status?: string;
      planDurationMonths?: number;
      query?: string;
    },
  ): Promise<IPaginationResp<IPaymentService.UpgradeTransaction>> => {
    return request({
      url: PaymentEndpoint.getUpgradeTransactions(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly GetUpgradeSummary = (): Promise<
    IResp<IPaymentService.UpgradeTransactionSummary>
  > => {
    return request({
      url: PaymentEndpoint.getUpgradeSummary(),
      method: AxiosMethod.GET,
    });
  };
}
