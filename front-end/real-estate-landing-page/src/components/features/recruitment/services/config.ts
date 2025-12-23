import { ServiceEndpoint } from "@/@types/service";

export const ExtractEndpoint: ServiceEndpoint = {
  extractID: () => "/uploader",
} as const;

export const ExtractQueryKey = {
  extractID: "extractID",
} as const;
