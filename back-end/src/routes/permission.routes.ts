import { Router } from "express";
import { PermissionController } from "@/controllers/permission.controller";
import { PermissionService } from "@/services/permission.service";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import {
  createPermissionSchema,
  deletePermissionSchema,
  getPermissionByIdSchema,
  updatePermissionSchema,
  updatePermissionStatusSchema,
} from "@/validators/permission.validator";
import { ResourcesService } from "@/services/resources.service";

const router = Router();
const permissionService = new PermissionService();
const resourcesService = new ResourcesService();
const permissionController = new PermissionController(
  permissionService,
  resourcesService,
);

// router.use(requireAuth);

/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         resource:
 *           type: string
 *           format: uuid
 *         operation:
 *           type: enum
 *           enum: [read, write, delete, approve, export]
 *         isActive:
 *           type: boolean
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
 *                 $ref: '#/components/schemas/Permission'
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
 *     ResponsePermission:
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
 *           $ref: '#/components/schemas/Permission'
 */

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
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
 *         description: Number of items to skip
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term for filtering results
 *       - in: query
 *         name: sortField
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
 *         description: A list of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 */
router.get("/", permissionController.getPermissions);

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     summary: Get permission by id
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Permission id
 *     responses:
 *       200:
 *         description: A permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponsePermission'
 */
router.get(
  "/:id",
  validateRequest((lang) => getPermissionByIdSchema(lang)),
  permissionController.getPermissionById,
);

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
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
 *                 - resourceId
 *                 - operationId
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 resourceId:
 *                   type: string
 *                 operation:
 *                   type: enum
 *                   enum: [read, write, delete, approve, export]
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponsePermission'
 */
router.post(
  "/",
  validateRequest((lang) => createPermissionSchema(lang)),
  permissionController.createPermission,
);

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     summary: Update permission by id
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Permission id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *               type: object
 *               required:
 *                 - name
 *                 - resourceId
 *                 - operationId
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 resourceId:
 *                   type: string
 *                 operationId:
 *                   type: string
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *         content:
 *          application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponsePermission'
 */
router.put(
  "/:id",
  validateRequest((lang) => updatePermissionSchema(lang)),
  permissionController.updatePermission,
);

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Delete permission by id
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Permission id
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 */
router.delete(
  "/:id",
  validateRequest((lang) => deletePermissionSchema(lang)),
  permissionController.deletePermission,
);

/**
 * @swagger
 * /permissions/{id}:
 *   patch:
 *     summary: Update permission status by id
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Permission id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *               type: object
 *               required:
 *                 - isActive
 *               properties:
 *                 isActive:
 *                   type: boolean
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *         content:
 *          application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponsePermission'
 */
router.patch(
  "/:id",
  validateRequest((lang) => updatePermissionStatusSchema(lang)),
  permissionController.updatePermissionStatus,
);

export default router;
