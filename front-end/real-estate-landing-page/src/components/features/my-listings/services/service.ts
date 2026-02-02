import { IPaginationResp, IParamsPagination, IResp } from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import { PropertyEndpoint } from "./config";
import { IPropertyDto } from "../dto/property.dto";
import { ListingFormData } from "../dto/listingformdata.dto";

export default class PropertyService {
  public static readonly Provinces = [
    { label: "Hồ Chí Minh", value: "Ho Chi Minh City" },
    { label: "Hà Nội", value: "Hanoi" },
    { label: "Đà Nẵng", value: "Da Nang" },
    { label: "Bình Dương", value: "Binh Duong" },
    { label: "Đồng Nai", value: "Dong Nai" },
    { label: "Khánh Hòa", value: "Khanh Hoa" },
    { label: "Hải Phòng", value: "Haiphong" },
    { label: "Cần Thơ", value: "Can Tho" },
    { label: "Bà Rịa - Vũng Tàu", value: "Ba Ria - Vung Tau" },
    { label: "An Giang", value: "An Giang" },
    { label: "Bắc Giang", value: "Bac Giang" },
    { label: "Bắc Kạn", value: "Bac Kan" },
    { label: "Bạc Liêu", value: "Bac Lieu" },
    { label: "Bắc Ninh", value: "Bac Ninh" },
    { label: "Bến Tre", value: "Ben Tre" },
    { label: "Bình Định", value: "Binh Dinh" },
    { label: "Bình Phước", value: "Binh Phuoc" },
    { label: "Bình Thuận", value: "Binh Thuan" },
    { label: "Cà Mau", value: "Ca Mau" },
    { label: "Cao Bằng", value: "Cao Bang" },
    { label: "Đắk Lắk", value: "Dak Lak" },
    { label: "Đắk Nông", value: "Dak Nong" },
    { label: "Điện Biên", value: "Dien Bien" },
    { label: "Đồng Tháp", value: "Dong Thap" },
    { label: "Gia Lai", value: "Gia Lai" },
    { label: "Hà Giang", value: "Ha Giang" },
    { label: "Hà Nam", value: "Ha Nam" },
    { label: "Hà Tĩnh", value: "Ha Tinh" },
    { label: "Hải Dương", value: "Hai Duong" },
    { label: "Hậu Giang", value: "Hau Giang" },
    { label: "Hòa Bình", value: "Hoa Binh" },
    { label: "Hưng Yên", value: "Hung Yen" },
    { label: "Kiên Giang", value: "Kien Giang" },
    { label: "Kon Tum", value: "Kon Tum" },
    { label: "Lai Châu", value: "Lai Chau" },
    { label: "Lâm Đồng", value: "Lam Dong" },
    { label: "Lạng Sơn", value: "Lang Son" },
    { label: "Lào Cai", value: "Lao Cai" },
    { label: "Long An", value: "Long An" },
    { label: "Nam Định", value: "Nam Dinh" },
    { label: "Nghệ An", value: "Nghe An" },
    { label: "Ninh Bình", value: "Ninh Binh" },
    { label: "Ninh Thuận", value: "Ninh Thuan" },
    { label: "Phú Thọ", value: "Phu Tho" },
    { label: "Phú Yên", value: "Phu Yen" },
    { label: "Quảng Bình", value: "Quang Binh" },
    { label: "Quảng Nam", value: "Quang Nam" },
    { label: "Quảng Ngãi", value: "Quang Ngai" },
    { label: "Quảng Ninh", value: "Quang Ninh" },
    { label: "Quảng Trị", value: "Quang Tri" },
    { label: "Sóc Trăng", value: "Soc Trang" },
    { label: "Sơn La", value: "Son La" },
    { label: "Tây Ninh", value: "Tay Ninh" },
    { label: "Thái Bình", value: "Thai Binh" },
    { label: "Thái Nguyên", value: "Thai Nguyen" },
    { label: "Thanh Hóa", value: "Thanh Hoa" },
    { label: "Thừa Thiên Huế", value: "Thua Thien Hue" },
    { label: "Tiền Giang", value: "Tien Giang" },
    { label: "Trà Vinh", value: "Tra Vinh" },
    { label: "Tuyên Quang", value: "Tuyen Quang" },
    { label: "Vĩnh Long", value: "Vinh Long" },
    { label: "Vĩnh Phúc", value: "Vinh Phuc" },
    { label: "Yên Bái", value: "Yen Bai" },
  ];

  public static readonly Wards = [
    // Common Numbered Wards
    { label: "Phường 1", value: "Ward 1" },
    { label: "Phường 2", value: "Ward 2" },
    { label: "Phường 3", value: "Ward 3" },
    { label: "Phường 4", value: "Ward 4" },
    { label: "Phường 5", value: "Ward 5" },
    { label: "Phường 6", value: "Ward 6" },
    { label: "Phường 7", value: "Ward 7" },
    { label: "Phường 8", value: "Ward 8" },
    { label: "Phường 9", value: "Ward 9" },
    { label: "Phường 10", value: "Ward 10" },
    { label: "Phường 11", value: "Ward 11" },
    { label: "Phường 12", value: "Ward 12" },
    { label: "Phường 13", value: "Ward 13" },
    { label: "Phường 14", value: "Ward 14" },
    { label: "Phường 15", value: "Ward 15" },

    // Famous Named Wards (HCMC)
    { label: "Phường Bến Nghé", value: "Ben Nghe Ward" },
    { label: "Phường Bến Thành", value: "Ben Thanh Ward" },
    { label: "Phường Đa Kao", value: "Da Kao Ward" },
    { label: "Phường Tân Định", value: "Tan Dinh Ward" },
    { label: "Phường Thảo Điền", value: "Thao Dien Ward" },
    { label: "Phường An Phú", value: "An Phu Ward" },

    // Famous Named Wards (Hanoi)
    { label: "Phường Tràng Tiền", value: "Trang Tien Ward" },
    { label: "Phường Hàng Bài", value: "Hang Bai Ward" },
    { label: "Phường Lý Thái Tổ", value: "Ly Thai To Ward" },
    { label: "Phường Phan Chu Trinh", value: "Phan Chu Trinh Ward" },
    { label: "Phường Cửa Nam", value: "Cua Nam Ward" },
    { label: "Phường Điện Biên", value: "Dien Bien Ward" },
    { label: "Phường Kim Mã", value: "Kim Ma Ward" },
    { label: "Phường Giảng Võ", value: "Giang Vo Ward" },
    { label: "Phường Thành Công", value: "Thanh Cong Ward" },
    { label: "Phường Láng Hạ", value: "Lang Ha Ward" },
    { label: "Phường Yên Hòa", value: "Yen Hoa Ward" },
    { label: "Phường Phú Diễn", value: "Phu Dien Ward" },
  ];

  public static readonly defaultFormValues: ListingFormData = {
    // Step 1
    demandType: "SALE",
    propertyType: "APARTMENT",
    projectName: "",
    description: "",
    title: "",
    // Step 2
    province: "",

    ward: "",
    address: "",
    latitude: null,
    longitude: null,

    // Step 3
    area: "",
    price: "",
    bedrooms: 1,
    bathrooms: 1,
    direction: "",
    legalStatus: "",
    furniture: "",

    // Step 4
    images: [],
    thumbnail: "",
    videoLink: "",
    virtualTourUrls: [],
  };

  public static readonly stepFields = {
    step1: [
      "demandType",
      "propertyType",
      "projectName",
      "description",
      "title",
    ] as const,
    step2: ["province", "ward", "address", "latitude", "longitude"] as const,
    step3: [
      "area",
      "price",
      "bedrooms",
      "bathrooms",
      "direction",
      "legalStatus",
      "furniture",
    ] as const,
    step4: ["images", "thumbnail", "videoLink", "virtualTourUrls"] as const,
  };

  public static readonly getProperties = (
    params?: IParamsPagination,
  ): Promise<IPaginationResp<IPropertyDto>> => {
    return request({
      url: PropertyEndpoint.getProperties(),
      method: AxiosMethod.GET,
      params,
    });
  };

  public static readonly createProperty = (
    body: ListingFormData,
  ): Promise<IResp<IPropertyDto>> => {
    return request({
      url: PropertyEndpoint.createProperty(),
      method: AxiosMethod.POST,
      data: body,
    });
  };
}
