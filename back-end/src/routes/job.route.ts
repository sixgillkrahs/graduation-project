import { JobController } from "@/controllers/job.controller";
import { authorize, requireAuth } from "@/middleware/authMiddleware";
import { Operation } from "@/models/permission.model";
import { JobService } from "@/services/job.service";
import { Router } from "express";

const router = Router();
const jobService = new JobService();
const jobController = new JobController(jobService);

router.use(requireAuth);

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs with pagination
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by job status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by job type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field (e.g. "createdAt:desc")
 *     responses:
 *       200:
 *         description: List of jobs
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get("/", authorize(), jobController.getJobs);

/**
 * @swagger
 * /jobs/{jobId}/retry:
 *   post:
 *     summary: Retry a failed job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to retry
 *     responses:
 *       200:
 *         description: Job retried
 *       400:
 *         description: Only failed jobs can be retried
 *       404:
 *         description: Job not found
 *       403:
 *         description: Forbidden
 */
router.post(
  "/:jobId/retry",
  authorize({
    operation: Operation.Update,
  }),
  jobController.retryJob,
);

/**
 * @swagger
 * /jobs/{jobId}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID to delete
 *     responses:
 *       200:
 *         description: Job deleted
 *       404:
 *         description: Job not found
 *       403:
 *         description: Forbidden
 */
router.delete("/:jobId", authorize(), jobController.deleteJob);

export default router;
