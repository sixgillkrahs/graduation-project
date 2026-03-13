import { LeadController } from "@/controllers/lead.controller";
import { optionalAuth, requireAuth } from "@/middleware/authMiddleware";
import { leadLimiter } from "@/middleware/rateLimiter";
import { validateRequest } from "@/middleware/validateRequest";
import { NoticeService } from "@/services/notice.service";
import { LeadService } from "@/services/lead.service";
import { PropertyService } from "@/services/property.service";
import { NotificationQueue } from "@/queues/notification.queue";
import {
  validateCreateLeadSchema,
  validateUpdateLeadStatusSchema,
} from "@/validators/lead.validator";
import { Router } from "express";

const router = Router();
const leadController = new LeadController(
  new LeadService(),
  new PropertyService(),
  new NotificationQueue(),
  new NoticeService(),
);

router.post(
  "/",
  leadLimiter,
  optionalAuth,
  validateRequest((lang) => validateCreateLeadSchema(lang)),
  leadController.createLead,
);

router.get("/agent", requireAuth, leadController.getAgentLeads);

router.patch(
  "/:id/status",
  requireAuth,
  validateRequest((lang) => validateUpdateLeadStatusSchema(lang)),
  leadController.updateLeadStatus,
);

export default router;
