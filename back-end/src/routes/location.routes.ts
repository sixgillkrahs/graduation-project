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
 *     description: Returns location suggestions for autocomplete fields with optional geo-biasing and language selection.
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

/**
 * @swagger
 * /locations/provinces:
 *   get:
 *     summary: Get province options for location forms
 *     description: Returns the cached list of province options used in location pickers.
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: Province options returned successfully
 */
router.get("/provinces", cache({ duration: 3600 }), locationController.getProvinces);

/**
 * @swagger
 * /locations/local-units:
 *   get:
 *     summary: Get local administrative units for a province
 *     description: Returns the cached list of local administrative units for a given province code.
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: provinceCode
 *         required: true
 *         schema:
 *           type: integer
 *         description: Province code used to load dependent local units
 *     responses:
 *       200:
 *         description: Local administrative units returned successfully
 *       400:
 *         description: provinceCode is missing or invalid
 */
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
 *     description: Converts a latitude and longitude into a human-readable address or location label for the listing flow.
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
