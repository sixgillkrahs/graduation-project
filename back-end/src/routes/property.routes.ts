import { PropertyController } from "@/controllers/property.controller";
import { optionalAuth, requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { NoticeService } from "@/services/notice.service";
import { PropertyService } from "@/services/property.service";
import { createPropertySchema } from "@/validators/property.validator";
import { Router } from "express";

const router = Router();
const propertyService = new PropertyService();
const noticeService = new NoticeService();
const propertyController = new PropertyController(
  propertyService,
  noticeService,
);

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property listing
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
router.get("/", propertyController.getProperties);

/**
 * @swagger
 * /properties/me:
 *   get:
 *     summary: Get all properties owned by the current user
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
 * /properties/on-sale:
 *   get:
 *     summary: Get all properties on sale with pagination and filtering
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
router.get("/on-sale", propertyController.getOnSaleProperties);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get property details by ID
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
router.get("/:id", optionalAuth, propertyController.getPropertyById);

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Update property details
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
 * /properties/{id}/reject:
 *   patch:
 *     summary: Reject a property
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
router.patch("/:id/reject", requireAuth, propertyController.rejectProperty);

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property listing
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
 * /properties/{id}/view:
 *   patch:
 *     summary: Increment view count of a property
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

export default router;
