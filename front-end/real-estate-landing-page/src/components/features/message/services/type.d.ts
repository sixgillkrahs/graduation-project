namespace IConversationService {
  export interface ProfileDTO {
    _id: string;
    basicInfo: BasicInfo;
    businessInfo: BusinessInfo;
    imageInfo: ImageInfo;
    bankInfo?: BankInfo;
    status: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
  }
}
