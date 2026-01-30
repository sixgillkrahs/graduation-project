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
router.post("/upload-large", uploadController.uploadFileLarge);
router.post("/upload-large1", uploadController.uploadFileLarge1);
router.get("/video", uploadController.getVideo);
router.get("/audio", uploadController.getAudio);
router.post("/upload-trunk", uploadController.uploadTrunkFile);
router.put("/pause-upload/:sessionId", uploadController.pauseUpload);
router.put("/resume-upload/:sessionId", uploadController.resumeUpload);

// Cloudinary upload routes
/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload a single image to Cloudinary
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
