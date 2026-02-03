import { LandlordController } from "@/controllers/landlord.controller";
import { requireAuth } from "@/middleware/authMiddleware";
import { LandlordService } from "@/services/landlord.service";
import { Router } from "express";

const router = Router();

const landlordService = new LandlordService();

const landlordController = new LandlordController(landlordService);

/**
 * @swagger
 * /landlords:
 *   get:
 *     summary: Get list of landlords
 *     tags: [Landlord]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of landlords
 */
router.get("/", requireAuth, landlordController.getLandlords);

/**
 * @swagger
 * /landlords:
 *   post:
 *     summary: Create a new landlord
 *     tags: [Landlord]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phoneNumber
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Landlord created
 */
router.post("/", requireAuth, landlordController.createLandlord);

/**
 * @swagger
 * /landlords/{id}:
 *   get:
 *     summary: Get landlord details
 *     tags: [Landlord]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Landlord details
 */
router.get("/:id", requireAuth, landlordController.getLandlord);

/**
 * @swagger
 * /landlords/{id}:
 *   put:
 *     summary: Update landlord
 *     tags: [Landlord]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Landlord updated
 */
router.put("/:id", requireAuth, landlordController.updateLandlord);

/**
 * @swagger
 * /landlords/{id}:
 *   delete:
 *     summary: Delete landlord
 *     tags: [Landlord]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Landlord deleted
 */
router.delete("/:id", requireAuth, landlordController.deleteLandlord);

export default router;
