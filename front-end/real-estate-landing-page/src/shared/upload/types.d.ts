namespace IUploadService {
  export interface IUploadResponse {
    count: number;
    files: {
      url: string;
      publicId: string;
      originalName: string;
      size: number;
      mimetype: string;
    }[];
  }
}
