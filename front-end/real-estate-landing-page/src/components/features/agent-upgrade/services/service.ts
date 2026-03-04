import request from "@/lib/axios/request";
import { AxiosMethod } from "@/lib/axios/method";
import { PaymentEndpoint } from "./config";

export default class PaymentService {
  public static readonly createVNPayUrl = (data: {
    amount: number;
    language: string;
  }): Promise<any> => {
    return request({
      url: PaymentEndpoint.VNPay(),
      method: AxiosMethod.POST,
      data,
    });
  };

  public static readonly createMoMoUrl = (data: {
    amount: number;
  }): Promise<any> => {
    return request({
      url: PaymentEndpoint.MoMo(),
      method: AxiosMethod.POST,
      data,
    });
  };

  public static readonly downgrade = (): Promise<any> => {
    return request({
      url: PaymentEndpoint.Downgrade(),
      method: AxiosMethod.POST,
    });
  };
}
