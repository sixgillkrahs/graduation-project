import { ResourcesController } from "@/controllers/resources.controller";
import { validateRequest } from "@/middleware/validateRequest";
import { ResourcesService } from "@/services/resources.service";
import { createUpdateResourceSchema } from "@/validators/resource.validator";
import { Router } from "express";

const resourcesService = new ResourcesService();

const resourcesController = new ResourcesController(resourcesService);
const router = Router();

router.get("/", resourcesController.getResourcesPaginated);
router.get("/search", resourcesController.searchResources);
router.post("/", validateRequest((lang) => createUpdateResourceSchema(lang)), resourcesController.createResource);
router.get("/:id", resourcesController.getResourceById);
router.put("/:id", validateRequest((lang) => createUpdateResourceSchema(lang)), resourcesController.updateResource);
router.delete("/:id", resourcesController.deleteResource);


export default router;