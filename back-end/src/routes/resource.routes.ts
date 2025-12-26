import { ResourcesController } from "@/controllers/resources.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { ResourcesService } from "@/services/resources.service";
import { createUpdateResourceSchema } from "@/validators/resource.validator";
import { Router } from "express";

const resourcesService = new ResourcesService();

const resourcesController = new ResourcesController(resourcesService);
const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ResponsePaginated:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           properties:
 *             results:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 *             totalPages:
 *               type: integer
 *               description: Total number of resources
 *             totalResults:
 *               type: integer
 *               description: Total number of resources
 *             page:
 *               type: integer
 *               description: Current page number
 *             limit:
 *               type: integer
 *               description: Number of items per page
 *           description: List of resources
 *     Response:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful
 *         message:
 *           type: string
 *           description: Success message
 *         data:
 *           type: object
 *           $ref: '#/components/schemas/Resource'
 */

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources paginated
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ResponsePaginated'
 */
router.get("/", resourcesController.getResourcesPaginated);

/**
 * @swagger
 * /resources/search:
 *   get:
 *     summary: Search resources by name or description
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term for filtering results
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ResponsePaginated'
 */
router.get("/search", resourcesController.searchResources);

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *               type: object
 *               required:
 *                 - name
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */
router.post(
  "/",
  validateRequest((lang) => createUpdateResourceSchema(lang)),
  resourcesController.createResource,
);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get resource by id
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Resource id
 *     responses:
 *       200:
 *         description: A resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */
router.get("/:id", resourcesController.getResourceById);

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     summary: Update resource by id
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Resource id to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *               type: object
 *               required:
 *                 - name
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */
router.put(
  "/:id",
  validateRequest((lang) => createUpdateResourceSchema(lang)),
  resourcesController.updateResource,
);

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete resource by id
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Resource id to delete
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */
router.delete("/:id", resourcesController.deleteResource);

export default router;
