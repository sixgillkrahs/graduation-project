export const ExtractEndpoint = {
  extractID: () => "/uploader",
  registration: () => "/agents-registrations/registration",
  uploadImage: () => "/upload-single",
} as const;

export const ExtractQueryKey = {
  extractID: "extractID",
  registration: "registration",
  uploadImage: "uploadImage",
} as const;
