import { AgentRegistrationEndpoint } from "./config";
import { AxiosMethod } from "@shared/axios/method";
import request from "@shared/axios/request";
import type { Id, IPaginationResp, IParamsPagination, IResp } from "@shared/types/service";

export default class AgentRegistrationService {
  public static readonly STATUS = [
    {
      value: "PENDING",
      label: "Chờ duyệt",
      color: "orange",
    },
    {
      value: "APPROVED",
      label: "Duyệt",
      color: "green",
    },
    {
      value: "REJECTED",
      label: "Từ chối",
      color: "red",
    },
  ];

  public static readonly VietNamProvide = [
    { value: "Ha Noi", label: "Hà Nội" },
    { value: "Ho Chi Minh", label: "TP. Hồ Chí Minh" },
    { value: "Hai Phong", label: "Hải Phòng" },
    { value: "Da Nang", label: "Đà Nẵng" },
    { value: "Can Tho", label: "Cần Thơ" },

    { value: "An Giang", label: "An Giang" },
    { value: "Ba Ria - Vung Tau", label: "Bà Rịa - Vũng Tàu" },
    { value: "Bac Giang", label: "Bắc Giang" },
    { value: "Bac Kan", label: "Bắc Kạn" },
    { value: "Bac Lieu", label: "Bạc Liêu" },
    { value: "Bac Ninh", label: "Bắc Ninh" },
    { value: "Ben Tre", label: "Bến Tre" },
    { value: "Binh Dinh", label: "Bình Định" },
    { value: "Binh Duong", label: "Bình Dương" },
    { value: "Binh Phuoc", label: "Bình Phước" },
    { value: "Binh Thuan", label: "Bình Thuận" },
    { value: "Ca Mau", label: "Cà Mau" },
    { value: "Cao Bang", label: "Cao Bằng" },
    { value: "Dak Lak", label: "Đắk Lắk" },
    { value: "Dak Nong", label: "Đắk Nông" },
    { value: "Dien Bien", label: "Điện Biên" },
    { value: "Dong Nai", label: "Đồng Nai" },
    { value: "Dong Thap", label: "Đồng Tháp" },
    { value: "Gia Lai", label: "Gia Lai" },
    { value: "Ha Giang", label: "Hà Giang" },
    { value: "Ha Nam", label: "Hà Nam" },
    { value: "Ha Tinh", label: "Hà Tĩnh" },
    { value: "Hai Duong", label: "Hải Dương" },
    { value: "Hau Giang", label: "Hậu Giang" },
    { value: "Hoa Binh", label: "Hòa Bình" },
    { value: "Hung Yen", label: "Hưng Yên" },
    { value: "Khanh Hoa", label: "Khánh Hòa" },
    { value: "Kien Giang", label: "Kiên Giang" },
    { value: "Kon Tum", label: "Kon Tum" },
    { value: "Lai Chau", label: "Lai Châu" },
    { value: "Lam Dong", label: "Lâm Đồng" },
    { value: "Lang Son", label: "Lạng Sơn" },
    { value: "Lao Cai", label: "Lào Cai" },
    { value: "Long An", label: "Long An" },
    { value: "Nam Dinh", label: "Nam Định" },
    { value: "Nghe An", label: "Nghệ An" },
    { value: "Ninh Binh", label: "Ninh Bình" },
    { value: "Ninh Thuan", label: "Ninh Thuận" },
    { value: "Phu Tho", label: "Phú Thọ" },
    { value: "Phu Yen", label: "Phú Yên" },
    { value: "Quang Binh", label: "Quảng Bình" },
    { value: "Quang Nam", label: "Quảng Nam" },
    { value: "Quang Ngai", label: "Quảng Ngãi" },
    { value: "Quang Ninh", label: "Quảng Ninh" },
    { value: "Quang Tri", label: "Quảng Trị" },
    { value: "Soc Trang", label: "Sóc Trăng" },
    { value: "Son La", label: "Sơn La" },
    { value: "Tay Ninh", label: "Tây Ninh" },
    { value: "Thai Binh", label: "Thái Bình" },
    { value: "Thai Nguyen", label: "Thái Nguyên" },
    { value: "Thanh Hoa", label: "Thanh Hóa" },
    { value: "Thua Thien Hue", label: "Thừa Thiên Huế" },
    { value: "Tien Giang", label: "Tiền Giang" },
    { value: "Tra Vinh", label: "Trà Vinh" },
    { value: "Tuyen Quang", label: "Tuyên Quang" },
    { value: "Vinh Long", label: "Vĩnh Long" },
    { value: "Vinh Phuc", label: "Vĩnh Phúc" },
    { value: "Yen Bai", label: "Yên Bái" },
  ];

  public static readonly GetAgentsRegistrations = (
    params: IParamsPagination,
  ): Promise<IPaginationResp<IAgentRegistrationService.AgentRegistration>> => {
    return request({
      url: AgentRegistrationEndpoint.GetAgentsRegistrations(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly GetAgentsRegistration = (
    id: Id,
  ): Promise<IResp<IAgentRegistrationService.AgentRegistration>> => {
    return request({
      url: AgentRegistrationEndpoint.GetAgentsRegistration(id),
      method: AxiosMethod.GET,
    });
  };

  public static readonly RejectAgentsRegistration = (
    id: Id,
    data: {
      reason?: string;
    },
  ): Promise<IResp<void>> => {
    return request({
      url: AgentRegistrationEndpoint.RejectAgentsRegistration(id),
      method: AxiosMethod.PATCH,
      data: data,
    });
  };

  public static readonly AcceptAgentsRegistration = (id: Id): Promise<IResp<void>> => {
    return request({
      url: AgentRegistrationEndpoint.AcceptAgentsRegistration(id),
      method: AxiosMethod.PATCH,
    });
  };
}
