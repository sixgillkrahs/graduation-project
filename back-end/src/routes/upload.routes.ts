import { UploadController } from "@/controllers/upload.controller";
import { UploadService } from "@/services/upload.service";
import { uploadSingle, uploadMultiple } from "@/middleware/uploadMiddleware";
import { Router } from "express";
import fs from "fs";

const UPLOAD_FOLDER = "uploads";

if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

const router = Router();
const uploadService = new UploadService();
const uploadController = new UploadController(uploadService);

// Legacy upload routes (local file system)
/**
 * @swagger
 * /upload/upload-large:
 *   post:
 *     summary: Legacy large-file upload endpoint
 *     description: Legacy placeholder endpoint for large-file uploads to the local filesystem.
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Large-file upload handled successfully
 */
router.post("/upload-large", uploadController.uploadFileLarge);

/**
 * @swagger
 * /upload/upload-large1:
 *   post:
 *     summary: Legacy large-file upload endpoint variant
 *     description: Experimental legacy endpoint for large-file uploads to the local filesystem.
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Large-file upload handled successfully
 */
router.post("/upload-large1", uploadController.uploadFileLarge1);

/**
 * @swagger
 * /upload/video:
 *   get:
 *     summary: Stream sample video asset
 *     description: Streams a sample video asset using HTTP range requests for testing media delivery.
 *     tags: [Upload]
 *     responses:
 *       206:
 *         description: Partial video content streamed successfully
 */
router.get("/video", uploadController.getVideo);

/**
 * @swagger
 * /upload/audio:
 *   get:
 *     summary: Stream sample audio asset
 *     description: Streams a sample audio asset using HTTP range requests for testing media delivery.
 *     tags: [Upload]
 *     responses:
 *       206:
 *         description: Partial audio content streamed successfully
 */
router.get("/audio", uploadController.getAudio);

/**
 * @swagger
 * /upload/upload-trunk:
 *   post:
 *     summary: Upload file chunks to local storage
 *     description: Receives chunked upload data, tracks the upload session, and appends file data to the local filesystem.
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Chunk processed successfully
 */
router.post("/upload-trunk", uploadController.uploadTrunkFile);

/**
 * @swagger
 * /upload/pause-upload/{sessionId}:
 *   put:
 *     summary: Pause a chunked upload session
 *     description: Marks an active chunked upload session as paused.
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upload paused successfully
 *       404:
 *         description: Upload session not found
 */
router.put("/pause-upload/:sessionId", uploadController.pauseUpload);

/**
 * @swagger
 * /upload/resume-upload/{sessionId}:
 *   put:
 *     summary: Resume a chunked upload session
 *     description: Marks a paused chunked upload session as resumed so the client can continue sending chunks.
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upload resumed successfully
 *       404:
 *         description: Upload session not found
 */
router.put("/resume-upload/:sessionId", uploadController.resumeUpload);

// Cloudinary upload routes
/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload a single image to Cloudinary
 *     description: Uploads one image file to Cloudinary and returns the hosted asset metadata.
 *     tags: [Upload]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: 'Cloudinary folder to store the image (default: "uploads")'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: Cloudinary URL of the uploaded image
 *                 publicId:
 *                   type: string
 *                   description: Cloudinary public_id for the image
 *                 originalName:
 *                   type: string
 *                 size:
 *                   type: number
 *                 mimetype:
 *                   type: string
 *       400:
 *         description: No file uploaded or invalid file type
 *       500:
 *         description: Cloudinary not configured or upload failed
 */
router.post("/image", uploadSingle("image"), uploadController.uploadImage);

/**
 * @swagger
 * /upload/images:
 *   post:
 *     summary: Upload multiple images to Cloudinary
 *     description: Uploads multiple image files to Cloudinary and returns the metadata for each stored asset.
 *     tags: [Upload]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: 'Cloudinary folder to store the images (default: "uploads")'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                       publicId:
 *                         type: string
 *                       originalName:
 *                         type: string
 *                       size:
 *                         type: number
 *                       mimetype:
 *                         type: string
 *       400:
 *         description: No files uploaded or invalid file types
 *       500:
 *         description: Cloudinary not configured or upload failed
 */
router.post(
  "/images",
  uploadMultiple("images", 10),
  uploadController.uploadImages,
);

/**
 * @swagger
 * /upload/image/{publicId}:
 *   delete:
 *     summary: Delete an image from Cloudinary
 *     description: Deletes a Cloudinary asset by its public identifier.
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public_id of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: Invalid public_id or deletion failed
 *       500:
 *         description: Cloudinary not configured
 */
router.delete("/image/:publicId", uploadController.deleteImage);

/**
 * @swagger
 * /upload/image/{publicId}:
 *   get:
 *     summary: Get image details from Cloudinary
 *     description: Retrieves metadata for a Cloudinary image asset by its public identifier.
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public_id of the image
 *     responses:
 *       200:
 *         description: Image details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicId:
 *                   type: string
 *                 url:
 *                   type: string
 *                 format:
 *                   type: string
 *                 width:
 *                   type: number
 *                 height:
 *                   type: number
 *                 bytes:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *       400:
 *         description: Invalid public_id
 *       500:
 *         description: Cloudinary not configured
 */
router.get("/image/:publicId", uploadController.getImageDetails);

export default router;
