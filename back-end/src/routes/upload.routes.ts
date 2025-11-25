import { UploadController } from "@/controllers/upload.controller";
import { UploadService } from "@/services/upload.service";
import { Router } from "express";
import fs from 'fs'

const UPLOAD_FOLDER = 'uploads';

if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

const router = Router();
const uploadService = new UploadService();
const uploadController = new UploadController(uploadService);


router.post("/upload-large", uploadController.uploadFileLarge);
router.post("/upload-large1", uploadController.uploadFileLarge1);
router.get("/video", uploadController.getVideo);
router.get("/audio", uploadController.getAudio);
router.post("/upload-trunk", uploadController.uploadTrunkFile);
router.put("/pause-upload/:sessionId", uploadController.pauseUpload);
router.put("/resume-upload/:sessionId", uploadController.resumeUpload);

export default router;

