import { ServiceEndpoint } from "@/@types/service";

export const ExtractEndpoint: ServiceEndpoint = {
  extractID: () => "/uploader",
  registration: () => "/agents/registration",
} as const;

export const ExtractQueryKey = {
  extractID: "extractID",
  registration: "registration",
} as const;
