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

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Capture and manage buyer inquiries generated from listing detail pages
 * components:
 *   schemas:
 *     LeadListingSummary:
 *       type: object
 *       description: Minimal listing information embedded in CRM lead responses after populate("listingId")
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB identifier of the listing
 *           example: "6800f3d5d8b4f12b8f0a1001"
 *         id:
 *           type: string
 *           description: JSON-friendly identifier alias returned by the toJSON plugin
 *           example: "6800f3d5d8b4f12b8f0a1001"
 *         title:
 *           type: string
 *           description: Public title of the property listing
 *           example: "Sunrise City View 2BR apartment"
 *         media:
 *           type: object
 *           description: Representative listing media for CRM preview cards
 *           properties:
 *             thumbnail:
 *               type: string
 *               description: Cover image URL shown in CRM tables
 *               example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 *             images:
 *               type: array
 *               description: Additional gallery images if available
 *               items:
 *                 type: string
 *               example:
 *                 - "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 *         location:
 *           type: object
 *           description: Reduced address block used for quick lead context
 *           properties:
 *             address:
 *               type: string
 *               description: Human-readable property address
 *               example: "23 Nguyen Huu Tho, Nha Be, Ho Chi Minh City"
 *     Lead:
 *       type: object
 *       description: CRM lead created from listing detail interactions such as call, chat, or request
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB identifier of the lead
 *           example: "68010252cb8f3028c9d71001"
 *         id:
 *           type: string
 *           description: JSON-friendly identifier alias returned by the toJSON plugin
 *           example: "68010252cb8f3028c9d71001"
 *         agentId:
 *           type: string
 *           description: User id of the agent who owns the listing and receives the lead
 *           example: "67ff8c9dcb8f3028c9d70010"
 *         userId:
 *           type: string
 *           nullable: true
 *           description: Authenticated buyer user id when the lead was submitted by a signed-in user
 *           example: "67ff8c9dcb8f3028c9d70088"
 *         listingId:
 *           description: Listing reference, either as a raw id or a populated summary depending on the endpoint
 *           oneOf:
 *             - type: string
 *               example: "6800f3d5d8b4f12b8f0a1001"
 *             - $ref: "#/components/schemas/LeadListingSummary"
 *         customerName:
 *           type: string
 *           description: Buyer full name captured for agent follow-up
 *           example: "Tran Minh Anh"
 *         customerPhone:
 *           type: string
 *           description: Buyer phone number normalized and stored for CRM contact actions
 *           example: "0901234567"
 *         customerEmail:
 *           type: string
 *           description: Buyer email address if provided
 *           example: "buyer@example.com"
 *         intent:
 *           type: string
 *           description: Buyer's high-level purchase intent
 *           enum: [BUY_TO_LIVE, INVEST, RENT, CONSULTATION]
 *           example: "BUY_TO_LIVE"
 *         interestTopics:
 *           type: array
 *           description: Topics the buyer explicitly wants the agent to address
 *           items:
 *             type: string
 *             enum: [PRICE, LEGAL, LOCATION, NEGOTIATION, VIEWING, FURNITURE, PAYMENT]
 *           example: ["PRICE", "VIEWING"]
 *         budgetRange:
 *           type: string
 *           description: Free-form or preset budget bucket chosen by the buyer
 *           example: "FROM_2_TO_5_BILLION"
 *         preferredContactTime:
 *           type: string
 *           description: Preferred response timing selected by the buyer
 *           enum: [ASAP, TODAY, NEXT_24_HOURS, THIS_WEEKEND]
 *           example: "ASAP"
 *         preferredContactChannel:
 *           type: string
 *           description: Preferred channel for the agent to respond on
 *           enum: [PHONE, CHAT, ZALO, EMAIL]
 *           example: "PHONE"
 *         message:
 *           type: string
 *           description: Optional note written by the buyer with more context
 *           example: "I want to know whether the legal documents are ready."
 *         source:
 *           type: string
 *           description: Listing detail action that generated the lead
 *           enum: [PROPERTY_CALL, PROPERTY_CHAT, PROPERTY_REQUEST]
 *           example: "PROPERTY_REQUEST"
 *         status:
 *           type: string
 *           description: Current CRM pipeline status assigned by the agent
 *           enum: [NEW, CONTACTED, QUALIFIED, SCHEDULED, WON, LOST, SPAM_REJECTED]
 *           example: "NEW"
 *         lastSubmittedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the latest submission or refresh for the same buyer and listing
 *           example: "2026-03-16T09:30:00.000Z"
 *         submissionCount:
 *           type: integer
 *           description: Number of times the same lead was resubmitted within the deduplication window
 *           example: 1
 *         metadata:
 *           type: object
 *           description: Technical audit metadata captured at submission time
 *           properties:
 *             ipAddress:
 *               type: string
 *               description: Source IP used for throttling and moderation
 *               example: "::1"
 *             userAgent:
 *               type: string
 *               description: Request user-agent header
 *               example: "Mozilla/5.0"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the lead was first created
 *           example: "2026-03-16T09:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the lead document was last updated
 *           example: "2026-03-16T09:30:00.000Z"
 *     CreateLeadRequest:
 *       type: object
 *       description: Payload submitted from a property detail page to create or refresh a CRM lead
 *       required:
 *         - listingId
 *         - customerName
 *         - customerPhone
 *         - intent
 *         - interestTopics
 *         - budgetRange
 *         - preferredContactTime
 *         - preferredContactChannel
 *       properties:
 *         listingId:
 *           type: string
 *           description: Property listing identifier that the buyer is contacting about
 *           example: "6800f3d5d8b4f12b8f0a1001"
 *         customerName:
 *           type: string
 *           minLength: 2
 *           maxLength: 120
 *           description: Buyer full name shown to the agent in CRM
 *           example: "Tran Minh Anh"
 *         customerPhone:
 *           type: string
 *           minLength: 8
 *           maxLength: 20
 *           description: Buyer phone number used for direct follow-up
 *           example: "0901234567"
 *         customerEmail:
 *           type: string
 *           nullable: true
 *           description: Optional buyer email used for CRM and follow-up
 *           example: "buyer@example.com"
 *         intent:
 *           type: string
 *           description: Buyer purchase intent category
 *           enum: [BUY_TO_LIVE, INVEST, RENT, CONSULTATION]
 *           example: "BUY_TO_LIVE"
 *         interestTopics:
 *           type: array
 *           minItems: 1
 *           maxItems: 6
 *           description: Topics the buyer wants the agent to focus on
 *           items:
 *             type: string
 *             enum: [PRICE, LEGAL, LOCATION, NEGOTIATION, VIEWING, FURNITURE, PAYMENT]
 *           example: ["PRICE", "LEGAL"]
 *         budgetRange:
 *           type: string
 *           description: Budget segment selected by the buyer
 *           example: "FROM_2_TO_5_BILLION"
 *         preferredContactTime:
 *           type: string
 *           description: Preferred timing for agent follow-up
 *           enum: [ASAP, TODAY, NEXT_24_HOURS, THIS_WEEKEND]
 *           example: "TODAY"
 *         preferredContactChannel:
 *           type: string
 *           description: Preferred communication channel for the response
 *           enum: [PHONE, CHAT, ZALO, EMAIL]
 *           example: "PHONE"
 *         source:
 *           type: string
 *           description: Listing detail CTA that generated the lead; defaults to PROPERTY_REQUEST when omitted
 *           enum: [PROPERTY_CALL, PROPERTY_CHAT, PROPERTY_REQUEST]
 *           example: "PROPERTY_REQUEST"
 *         message:
 *           type: string
 *           maxLength: 1000
 *           description: Optional buyer note for the agent
 *           example: "Please call me back after 6PM."
 *         website:
 *           type: string
 *           maxLength: 120
 *           description: Honeypot field. Leave empty in legitimate requests.
 *           example: ""
 *     CreateLeadResult:
 *       type: object
 *       description: Result returned when a real lead is created or refreshed
 *       properties:
 *         leadId:
 *           type: string
 *           description: Identifier of the created or refreshed lead document
 *           example: "68010252cb8f3028c9d71001"
 *         status:
 *           type: string
 *           description: Current CRM status after processing the submission
 *           enum: [NEW, CONTACTED, QUALIFIED, SCHEDULED, WON, LOST, SPAM_REJECTED]
 *           example: "NEW"
 *         isDuplicate:
 *           type: boolean
 *           description: Indicates whether the submission refreshed an existing recent lead instead of creating a new one
 *           example: false
 *     IgnoredLeadResult:
 *       type: object
 *       description: Result returned when the honeypot field is filled and the submission is silently ignored
 *       properties:
 *         accepted:
 *           type: boolean
 *           description: Confirms the endpoint accepted the request without throwing an error
 *           example: true
 *         ignored:
 *           type: boolean
 *           description: Signals that the request was intentionally ignored as probable bot traffic
 *           example: true
 *     UpdateLeadStatusRequest:
 *       type: object
 *       description: Payload used by an agent to move a lead through the CRM pipeline
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           description: New pipeline status to assign to the lead
 *           enum: [NEW, CONTACTED, QUALIFIED, SCHEDULED, WON, LOST]
 *           example: "CONTACTED"
 *     ErrorResponse:
 *       type: object
 *       description: Standard error wrapper returned by the API
 *       properties:
 *         success:
 *           type: boolean
 *           description: Always false for error responses
 *           example: false
 *         message:
 *           type: string
 *           description: Human-readable error message
 *           example: "Property not found"
 *         code:
 *           type: string
 *           description: Application-specific error code when available
 *           example: "NOT_FOUND"
 */

/**
 * @swagger
 * /leads:
 *   post:
 *     summary: Create or refresh a buyer lead from a property detail interaction
 *     description: >
 *       Captures buyer intent from listing detail actions such as call, chat, or request-info.
 *       If the same buyer submits again for the same listing within the deduplication window,
 *       the existing lead is refreshed and `isDuplicate` becomes true. This endpoint accepts
 *       both authenticated and guest users.
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateLeadRequest"
 *     responses:
 *       200:
 *         description: Lead accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 data:
 *                   oneOf:
 *                     - $ref: "#/components/schemas/CreateLeadResult"
 *                     - $ref: "#/components/schemas/IgnoredLeadResult"
 *             examples:
 *               created:
 *                 summary: New lead created
 *                 value:
 *                   success: true
 *                   message: "Success"
 *                   data:
 *                     leadId: "68010252cb8f3028c9d71001"
 *                     status: "NEW"
 *                     isDuplicate: false
 *               duplicate:
 *                 summary: Existing lead refreshed
 *                 value:
 *                   success: true
 *                   message: "Success"
 *                   data:
 *                     leadId: "68010252cb8f3028c9d71001"
 *                     status: "NEW"
 *                     isDuplicate: true
 *               honeypot:
 *                 summary: Bot submission ignored
 *                 value:
 *                   success: true
 *                   message: "Success"
 *                   data:
 *                     accepted: true
 *                     ignored: true
 *       400:
 *         description: Invalid payload or listing has no agent owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       429:
 *         description: Too many inquiry attempts from the same IP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Too many inquiry requests, please try again later"
 */
router.post(
  "/",
  leadLimiter,
  optionalAuth,
  validateRequest((lang) => validateCreateLeadSchema(lang)),
  leadController.createLead,
);

/**
 * @swagger
 * /leads/agent:
 *   get:
 *     summary: Get all non-spam leads assigned to the authenticated agent
 *     description: >
 *       Returns CRM leads owned by the current agent, sorted by latest update first.
 *       The `listingId` field is populated with basic listing information so the frontend
 *       can render property context without making extra requests.
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent leads retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Lead"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 */
router.get("/agent", requireAuth, leadController.getAgentLeads);

/**
 * @swagger
 * /leads/{id}/status:
 *   patch:
 *     summary: Update the CRM status of a lead owned by the authenticated agent
 *     description: >
 *       Moves a lead to a new CRM pipeline status such as CONTACTED, QUALIFIED, or WON.
 *       Only leads owned by the authenticated agent can be updated.
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB identifier of the lead to update
 *         example: "68010252cb8f3028c9d71001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateLeadStatusRequest"
 *     responses:
 *       200:
 *         description: Lead status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 data:
 *                   $ref: "#/components/schemas/Lead"
 *       400:
 *         description: Invalid lead id or status value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       404:
 *         description: Lead not found for the authenticated agent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.patch(
  "/:id/status",
  requireAuth,
  validateRequest((lang) => validateUpdateLeadStatusSchema(lang)),
  leadController.updateLeadStatus,
);

export default router;
