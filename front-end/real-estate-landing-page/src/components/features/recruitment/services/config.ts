import { ServiceEndpoint } from "@/@types/service";

export const ExtractEndpoint: ServiceEndpoint = {
  extractID: () => "/uploader",
  registration: () => "/agents-registrations/registration",
  uploadImage: () => "/upload-single",
} as const;

export const ExtractQueryKey = {
  extractID: "extractID",
  registration: "registration",
  uploadImage: "uploadImage",
} as const;
