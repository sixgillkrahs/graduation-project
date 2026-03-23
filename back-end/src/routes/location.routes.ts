import { LocationController } from "@/controllers/location.controller";
import { cache } from "@/middleware/cacheMiddleware";
import { LocationService } from "@/services/location.service";
import { Router } from "express";

const router = Router();
const locationService = new LocationService();
const locationController = new LocationController(locationService);

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Location search and reverse geocoding endpoints
 */

/**
 * @swagger
 * /locations/search:
 *   get:
 *     summary: Search locations for listing forms
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location suggestions
 */
router.get("/search", cache({ duration: 300 }), locationController.search);
router.get("/provinces", cache({ duration: 3600 }), locationController.getProvinces);
router.get(
  "/local-units",
  cache({ duration: 3600 }),
  locationController.getLocalUnits,
);

/**
 * @swagger
 * /locations/reverse:
 *   get:
 *     summary: Reverse geocode a coordinate for listing forms
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reverse geocoding result
 */
router.get("/reverse", cache({ duration: 300 }), locationController.reverse);

export default router;
