import { Router } from "express";
import { PermissionController } from "@/controllers/permission.controller";
import { PermissionService } from "@/services/permission.service";
import { requireAuth } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { createPermissionSchema, deletePermissionSchema, getPermissionByIdSchema, updatePermissionSchema } from "@/validators/permission.validator";
import { OperationService } from "@/services/operation.service";
import { ResourcesService } from "@/services/resources.service";

const router = Router();
const permissionService = new PermissionService();
const operationService = new OperationService();
const resourcesService = new ResourcesService();
const permissionController = new PermissionController(permissionService, operationService, resourcesService);

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
 *         resourceId:
 *           type: string
 *         operationId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */


/**
 * @swagger
 * /permissions/pagination:
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
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of items to skip
 *       - in: query
 *         name: search
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
router.get("/pagination", permissionController.getPermissions);

// /**
//  * @swagger
//  * /permissions/{id}:
//  *   get:
//  *     summary: Get permission by id
//  *     tags: [Permissions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Permission id
//  *     responses:
//  *       200:
//  *         description: A permission
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/Permission'
//  */
// router.get("/:id", validateRequest((lang) => getPermissionByIdSchema(lang)), permissionController.getPermissionById);

// /**
//  * @swagger
//  * /permissions:
//  *   post:
//  *     summary: Create a new permission
//  *     tags: [Permissions]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *          schema:
//  *               type: object
//  *               required:
//  *                 - name
//  *                 - description
//  *                 - resourceId
//  *                 - operationId
//  *               properties:
//  *                 name:
//  *                   type: string
//  *                 description:
//  *                   type: string
//  *                 resourceId:
//  *                   type: string
//  *                 operationId:
//  *                   type: string
//  *     responses:
//  *       201:
//  *         description: Permission created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: string
//  *                 name:
//  *                   type: string
//  *                 description:
//  *                   type: string
//  *                 resourceId:
//  *                   type: string
//  *                 operationId:
//  *                   type: string
//  */
// router.post("/", validateRequest((lang) => createPermissionSchema(lang)), permissionController.createPermission);

// /**
//  * @swagger
//  * /permissions/{id}:
//  *   put:
//  *     summary: Update permission by id
//  *     tags: [Permissions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Permission id
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *          schema:
//  *               type: object
//  *               required:
//  *                 - name
//  *                 - description
//  *                 - resourceId
//  *                 - operationId
//  *               properties:
//  *                 name:
//  *                   type: string
//  *                 description:
//  *                   type: string
//  *                 resourceId:
//  *                   type: string
//  *                 operationId:
//  *                   type: string
//  *     responses:
//  *       200:
//  *         description: Permission updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: string
//  *                 name:
//  *                   type: string
//  *                 description:
//  *                   type: string
//  *                 resourceId:
//  *                   type: string
//  *                 operationId:
//  *                   type: string
//  */
// router.put("/:id", validateRequest((lang) => updatePermissionSchema(lang)), permissionController.updatePermission);

// /**
//  * @swagger
//  * /permissions/{id}:
//  *   delete:
//  *     summary: Delete permission by id
//  *     tags: [Permissions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Permission id
//  *     responses:
//  *       200:
//  *         description: Permission deleted successfully
//  */
// router.delete("/:id", validateRequest((lang) => deletePermissionSchema(lang)), permissionController.deletePermission);

export default router;