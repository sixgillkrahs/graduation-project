import { PropertyController } from "@/controllers/property.controller";
import { optionalAuth, requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { NoticeService } from "@/services/notice.service";
import { PropertyInteractionService } from "@/services/property-interaction.service";
import { PropertySaleService } from "@/services/property-sale.service";
import { PropertyService } from "@/services/property.service";
import { AgentService } from "@/services/agent.service";
import {
  aiSearchPropertySchema,
  createPropertySchema,
} from "@/validators/property.validator";
import { Router } from "express";
import { EmailQueue } from "@/queues/email.queue";
import { AgentLeaderboardQueue } from "@/queues/agent-leaderboard.queue";
import { cache } from "@/middleware/cacheMiddleware";

const router = Router();
const propertyService = new PropertyService();
const noticeService = new NoticeService();
const propertyInteractionService = new PropertyInteractionService();
const agentService = new AgentService();
const propertySaleService = new PropertySaleService();
const emailQueue = new EmailQueue();
const agentLeaderboardQueue = new AgentLeaderboardQueue();
const propertyController = new PropertyController(
  propertyService,
  noticeService,
  propertyInteractionService,
  agentService,
  propertySaleService,
  emailQueue,
  agentLeaderboardQueue,
);

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property listing
 *     description: Creates a new property listing owned by the authenticated user, including media, attributes, and sale context.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - demandType
 *               - propertyType
 *               - location
 *               - features
 *               - description
 *             properties:
 *               demandType:
 *                 type: string
 *                 enum: [SALE, RENT]
 *               propertyType:
 *                 type: string
 *                 enum: [APARTMENT, HOUSE, STREET_HOUSE, VILLA, LAND, OTHER]
 *               projectName:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   province:
 *                     type: string
 *                   district:
 *                     type: string
 *                   ward:
 *                     type: string
 *                   address:
 *                     type: string
 *                   hideAddress:
 *                     type: boolean
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       long:
 *                         type: number
 *               features:
 *                 type: object
 *                 properties:
 *                   area:
 *                     type: number
 *                   price:
 *                     type: number
 *                   priceUnit:
 *                     type: string
 *                     enum: [VND, MILLION, BILLION, MILLION_PER_M2]
 *                   bedrooms:
 *                     type: number
 *                   bathrooms:
 *                     type: number
 *                   floors:
 *                     type: number
 *                   direction:
 *                     type: string
 *                     enum: [EAST, WEST, SOUTH, NORTH, SOUTH_EAST, SOUTH_WEST, NORTH_EAST, NORTH_WEST]
 *                   furniture:
 *                     type: string
 *                     enum: [BASIC, FULL, EMPTY]
 *                   legalStatus:
 *                     type: string
 *                     enum: [RED_BOOK, PINK_BOOK, SALE_CONTRACT, WAITING]
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               media:
 *                 type: object
 *                 properties:
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                   thumbnail:
 *                     type: string
 *                   videoLink:
 *                     type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  requireAuth,
  validateRequest(createPropertySchema),
  propertyController.createProperty,
);

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Get all properties with pagination and filtering
 *     description: Returns a paginated property list for the authenticated user with admin-style filtering and sorting options.
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: demandType
 *         schema:
 *           type: string
 *           enum: [SALE, RENT]
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, STREET_HOUSE, VILLA, LAND, OTHER]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, PUBLISHED, REJECTED, EXPIRED, SOLD]
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 */
router.get("/", requireAuth, propertyController.getProperties);

/**
 * @swagger
 * /properties/me:
 *   get:
 *     summary: Get all properties owned by the current user
 *     description: Returns the property listings created by the currently authenticated user.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, PUBLISHED, REJECTED, EXPIRED, SOLD]
 *     responses:
 *       200:
 *         description: List of user's properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", requireAuth, propertyController.getMyProperties);

/**
 * @swagger
 * /properties/favorites:
 *   get:
 *     summary: Get all favorite properties of the current user
 *     description: Returns the properties that the currently authenticated user has marked as favorites.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of favorite properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       401:
 *         description: Unauthorized - User must be logged in
 */
router.get("/favorites", requireAuth, propertyController.getFavoriteProperties);

/**
 * @swagger
 * /properties/on-sale:
 *   get:
 *     summary: Get all properties on sale with pagination and filtering
 *     description: Returns the public on-sale property catalogue with pagination, filtering, and optional personalization.
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: demandType
 *         schema:
 *           type: string
 *           enum: [SALE, RENT]
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, STREET_HOUSE, VILLA, LAND, OTHER]
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 */
router.get(
  "/on-sale",
  optionalAuth,
  cache(),
  propertyController.getOnSaleProperties,
);

/**
 * @swagger
 * /properties/agent/{agentId}/on-sale:
 *   get:
 *     summary: Get published sale properties by agent
 *     description: Returns the published on-sale listings belonging to a specific agent.
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 9
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, STREET_HOUSE, VILLA, LAND, OTHER]
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search by title or location
 *     responses:
 *       200:
 *         description: List of published sale properties for the agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 */
router.get(
  "/agent/:agentId/on-sale",
  optionalAuth,
  propertyController.getAgentOnSaleProperties,
);

router.post(
  "/ai-search",
  optionalAuth,
  validateRequest(aiSearchPropertySchema),
  propertyController.aiSearchProperties,
);

router.post(
  "/ai-search/explain",
  optionalAuth,
  validateRequest(aiSearchPropertySchema),
  propertyController.aiSearchPropertiesWithExplanation,
);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get property details by ID
 *     description: Returns the authenticated property-detail view for a specific property identifier.
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 */
router.get("/:id", requireAuth, propertyController.getPropertyById);

/**
 * @swagger
 * /properties/{id}/recommended:
 *   get:
 *     summary: Get recommended properties based on a given property ID
 *     description: Returns recommendation results related to a specific property.
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *     responses:
 *       200:
 *         description: List of recommended properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 */
router.get(
  "/:id/recommended",
  optionalAuth,
  propertyController.getRecommendedProperties,
);

/**
 * @swagger
 * /properties/{id}/view:
 *   get:
 *     summary: Get property details by ID for landing page
 *     description: Returns the public landing-page property detail payload for a specific listing.
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 */
router.get(
  "/:id/view",
  optionalAuth,
  propertyController.getPropertyForLandingPage,
);

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Update property details
 *     description: Updates an existing property listing owned by the authenticated user.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               demandType:
 *                 type: string
 *               propertyType:
 *                 type: string
 *               projectName:
 *                 type: string
 *               location:
 *                 type: object
 *               features:
 *                 type: object
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               media:
 *                 type: object
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PENDING, PUBLISHED, REJECTED, EXPIRED, SOLD]
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not owner)
 *       404:
 *         description: Property not found
 */
router.put(
  "/:id",
  requireAuth,
  // invoke validator here if needed, e.g. validateRequest(updatePropertySchema)
  propertyController.updateProperty,
);

/**
 * @swagger
 * /properties/{id}/approve:
 *   patch:
 *     summary: Approve or Reject a property
 *     description: Updates a property's review status during moderation, typically to approve it for publishing.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, REJECTED]
 *     responses:
 *       200:
 *         description: Property status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.patch("/:id/approve", requireAuth, propertyController.approveProperty);

/**
 * @swagger
 * /properties/{id}/status:
 *   patch:
 *     summary: Update property status (for owner)
 *     description: Allows the property owner to update the listing status within the permitted owner workflow.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, SOLD, EXPIRED]
 *     responses:
 *       200:
 *         description: Property status updated
 */
router.patch(
  "/:id/status",
  requireAuth,
  propertyController.updatePropertyStatus,
);

/**
 * @swagger
 * /properties/{id}/reject:
 *   patch:
 *     summary: Reject a property
 *     description: Rejects a property during moderation and stores the rejection reason.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *       - in: body
 *         name: reason
 *         required: true
 *         schema:
 *           type: string
 *         description: Reason for rejection
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, REJECTED]
 *     responses:
 *       200:
 *         description: Property status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.patch("/:id/reject", requireAuth, propertyController.rejectProperty);

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property listing
 *     description: Deletes a property listing owned by the authenticated user.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not owner)
 *       404:
 *         description: Property not found
 */
router.delete("/:id", requireAuth, propertyController.deleteProperty);

/**
 * @swagger
 * /properties/status/pending:
 *   get:
 *     summary: Get all properties with pagination and filtering
 *     description: Returns the paginated list of properties that are currently pending moderation.
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: demandType
 *         schema:
 *           type: string
 *           enum: [SALE, RENT]
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, STREET_HOUSE, VILLA, LAND, OTHER]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, PUBLISHED, REJECTED, EXPIRED, SOLD]
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 */
router.get(
  "/status/pending",
  requireAuth,
  propertyController.getPendingProperties,
);

/**
 * @swagger
 * /properties/status/published:
 *   get:
 *     summary: Get all published properties with pagination and filtering
 *     description: Returns the paginated list of properties that have already been published.
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of published properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 */
router.get(
  "/status/published",
  requireAuth,
  propertyController.getPublishedProperties,
);

/**
 * @swagger
 * /properties/status/rejected:
 *   get:
 *     summary: Get all rejected properties with pagination and filtering
 *     description: Returns the paginated list of properties that were rejected during moderation.
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of rejected properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 */
router.get(
  "/status/rejected",
  requireAuth,
  propertyController.getRejectedProperties,
);

/**
 * @swagger
 * /properties/{id}/view:
 *   patch:
 *     summary: Increment view count of a property
 *     description: Records a property-view event and increments the listing's view counter.
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: View count incremented
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 */
router.patch(
  "/:id/view",
  optionalAuth,
  propertyController.incrementViewProperty,
);

/**
 * @swagger
 * /properties/{id}/interact:
 *   post:
 *     summary: Record user interaction (Lead)
 *     description: Records a lead or interaction event for a property, such as viewing a phone number or submitting contact intent.
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [VIEW_PHONE, CONTACT_FORM, SCHEDULE_REQUEST]
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Interaction recorded
 */
router.post(
  "/:id/interact",
  optionalAuth,
  propertyController.recordInteraction,
);

router.put(
  "/:id",
  requireAuth,
  validateRequest(createPropertySchema),
  propertyController.updateProperty,
);

export default router;
