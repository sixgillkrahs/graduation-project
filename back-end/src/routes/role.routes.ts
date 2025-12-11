import { RoleController } from "@/controllers/role.controller";
import { RoleService } from "@/services/role.service";
import { PermissionService } from "@/services/permission.service";
import { Router } from "express";
import { validateRequest } from "@/middleware/validateRequest";
import {
  createUpdateRoleSchema,
  deleteRoleSchema,
  updateRoleSchema,
} from "@/validators/role.validator";

const roleService = new RoleService();
const permissionService = new PermissionService();

const roleController = new RoleController(roleService, permissionService);
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 *         isDefault:
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
 *                 $ref: '#/components/schemas/Role'
 *             totalPages:
 *               type: integer
 *               description: Total number of roles
 *             totalResults:
 *               type: integer
 *               description: Total number of roles
 *             page:
 *               type: integer
 *               description: Current page number
 *             limit:
 *               type: integer
 *               description: Number of items per page
 *           description: List of roles
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
 *           $ref: '#/components/schemas/Role'
 */

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
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
 *                 - permissions
 *               properties:
 *                 name:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *                 description:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 isDefault:
 *                   type: boolean
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */
router.post(
  "/",
  validateRequest((lang) => createUpdateRoleSchema(lang)),
  roleController.createRole,
);

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles paginated
 *     tags: [Roles]
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
 *         description: Field to sort roles by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ResponsePaginated'
 */
router.get("/", roleController.getRoles);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The role ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *               type: object
 *               required:
 *                 - name
 *                 - permissions
 *               properties:
 *                 name:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *                 description:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 isDefault:
 *                   type: boolean
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */
router.put(
  "/:id",
  validateRequest((lang) => updateRoleSchema(lang)),
  roleController.updateRole,
);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The role ID to delete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *               type: object
 *               required:
 *                 - name
 *                 - permissions
 *               properties:
 *                 name:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uuid
 *                 description:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 isDefault:
 *                   type: boolean
 *     responses:
 *       204:
 *         description: Role deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */
router.delete(
  "/:id",
  validateRequest((lang) => deleteRoleSchema(lang)),
  roleController.deleteRole,
);

/**
 * @swagger
 * /roles/{id}/status:
 *   patch:
 *     summary: Change role status
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The role ID to change status
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
 *       204:
 *         description: Role status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */
router.patch("/:id/status", roleController.changeStatus);

/**
 * @swagger
 * /roles/{id}/default-status:
 *   patch:
 *     summary: Change role default status
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The role ID to change default status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *               type: object
 *               required:
 *                 - isDefault
 *               properties:
 *                 isDefault:
 *                   type: boolean
 *     responses:
 *       204:
 *         description: Role default status changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 */
router.patch("/:id/default-status", roleController.changeDefaultStatus);

export default router;
