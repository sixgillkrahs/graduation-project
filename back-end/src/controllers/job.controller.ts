import { BaseController } from "./base.controller";
import { NextFunction, Request, Response } from "express";
import { JobService } from "@/services/job.service";

export class JobController extends BaseController {
  constructor(private jobService: JobService) {
    super();
  }

  getJobs = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt:desc",
        status,
        type,
      } = req.query;
      const filter: any = {};
      if (status) filter.status = status;
      if (type) filter.type = type;

      const options = {
        page: Number(page),
        limit: Number(limit),
        sortBy: String(sortBy),
      };

      return this.jobService.getJobs(options, filter);
    });
  };

  retryJob = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { jobId } = req.params;
      return this.jobService.retryJob(jobId);
    });
  };

  deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      const { jobId } = req.params;
      await this.jobService.deleteJob(jobId);
      return { success: true };
    });
  };
}
