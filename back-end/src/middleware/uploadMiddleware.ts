import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary, isCloudinaryConfigured } from "@/config/cloudinary";
import { Request } from "express";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

/**
 * Cloudinary storage configuration for multer
 */
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    // Determine the folder based on the route or request
    const folder = (req.query.folder as string) || "uploads";

    // Get the file extension
    const fileExtension = file.originalname.split(".").pop()?.toLowerCase();

    // Determine resource type based on file mimetype
    let resourceType: "image" | "video" | "raw" | "auto" = "auto";
    if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
    } else if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    }

    return {
      folder: folder,
      resource_type: resourceType,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm", "pdf"],
      transformation:
        resourceType === "image"
          ? [{ quality: "auto:good", fetch_format: "auto" }]
          : undefined,
    };
  },
});

/**
 * File filter to validate uploaded files
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed image mime types
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  // Allowed video mime types
  const allowedVideoTypes = ["video/mp4", "video/webm"];

  // Allowed document types
  const allowedDocTypes = ["application/pdf"];

  const allAllowedTypes = [
    ...allowedImageTypes,
    ...allowedVideoTypes,
    ...allowedDocTypes,
  ];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type: ${file.mimetype}. Allowed types: ${allAllowedTypes.join(", ")}`,
        400,
        ErrorCode.VALIDATION_ERROR
      )
    );
  }
};

/**
 * Multer upload middleware configured with Cloudinary storage
 */
const upload = multer({
  storage: cloudinaryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files per request
  },
});

/**
 * Memory storage for cases when Cloudinary is not configured
 * This stores files in memory as Buffer objects
 */
const memoryStorage = multer.memoryStorage();

const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files per request
  },
});

/**
 * Get the appropriate upload middleware based on Cloudinary configuration
 */
export const getUploadMiddleware = () => {
  if (isCloudinaryConfigured()) {
    return upload;
  }
  console.warn(
    "Cloudinary is not configured. Using memory storage. Files will not be persisted."
  );
  return uploadMemory;
};

/**
 * Export different upload configurations
 */
export const uploadSingle = (fieldName: string = "image") =>
  getUploadMiddleware().single(fieldName);

export const uploadMultiple = (fieldName: string = "images", maxCount: number = 10) =>
  getUploadMiddleware().array(fieldName, maxCount);

export const uploadFields = (fields: multer.Field[]) =>
  getUploadMiddleware().fields(fields);

export { upload, uploadMemory };
