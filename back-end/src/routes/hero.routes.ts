import { Router } from "express";
import { HeroController } from "@/controllers/hero.controller";
import { HeroService } from "@/services/hero.service";
import { requireAuth } from "@/middleware/authMiddleware";

const router = Router();
const metricsService = new HeroService();
const monitoringController = new HeroController(metricsService);

/**
 * @swagger
 * tags:
 *   name: Hero
 *   description: System monitoring and health check endpoints
 */

// /**
//  * @swagger
//  * /hero/create:
//  *   post:
//  *     summary: Get system metrics
//  *     tags: [Monitoring]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Prometheus metrics in text format
//  *         content:
//  *           text/plain:
//  *             schema:
//  *               type: string
//  *       401:
//  *         description: Unauthorized
//  */
// router.post("/create", monitoringController.createHero);

export default router;