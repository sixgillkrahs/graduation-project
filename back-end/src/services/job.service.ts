import { singleton } from "@/decorators/singleton";
import JobModel, { JobStatusEnum, JobTypeEnum } from "@/models/job.model";
import { PropertyService } from "./property.service";
import { QdrantService } from "./qdrant.service";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";

@singleton
export class JobService {
  private propertyService: PropertyService;
  private qdrantService: QdrantService;

  constructor() {
    this.propertyService = new PropertyService();
    this.qdrantService = new QdrantService();
  }

  getJobs = async (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any> = {},
    select?: string,
  ) => {
    return await (JobModel as any).paginate?.(options, filter, select);
  };

  createJob = async (jobData: any) => {
    return await JobModel.create(jobData);
  };

  retryJob = async (jobId: string) => {
    const job = await JobModel.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", 404, ErrorCode.NOT_FOUND);
    }

    if (job.status !== JobStatusEnum.FAILED) {
      throw new AppError(
        "Only failed jobs can be retried",
        400,
        ErrorCode.INVALID_REQUEST,
      );
    }

    job.status = JobStatusEnum.PROCESSING;
    job.attempts += 1;
    job.lastRunAt = new Date();
    await job.save();

    try {
      if (job.type === JobTypeEnum.PROPERTY_EMBEDDING) {
        const { propertyId } = job.payload;
        if (!propertyId) {
          throw new Error("Missing propertyId in payload");
        }

        const property = await this.propertyService.getPropertyById(propertyId) as any;
        if (!property) {
          throw new Error("Property not found");
        }

        // Retry: chạy embedding trực tiếp (không enqueue) để await kết quả và cập nhật status đúng
        const textData = `${property.title}. ${property.description}. Located in ${property.location?.ward}, ${property.location?.district}, ${property.location?.province}. Features: ${property.features?.bedrooms} bedrooms, ${property.features?.bathrooms} bathrooms. Type: ${property.propertyType}. Setup: ${property.features?.furniture}. Direction: ${property.features?.direction}.`;
        const payload = {
          propertyId: property._id.toString(),
          price: property.features?.price,
          type: property.propertyType,
          district: property.location?.district,
          province: property.location?.province,
        };
        await this.qdrantService.upsertPropertyEmbedding(
          property._id.toString(),
          textData,
          payload,
        );
      } else {
        throw new Error("Unsupported job type");
      }

      job.status = JobStatusEnum.COMPLETED;
      job.error = undefined;
      await job.save();

      return job;
    } catch (error: any) {
      job.status = JobStatusEnum.FAILED;
      job.error = error.message || "Unknown error occurred during retry";
      await job.save();
      throw new AppError(
        job.error || "Unknown error",
        400,
        ErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  };

  deleteJob = async (jobId: string) => {
    const job = await JobModel.findByIdAndDelete(jobId);
    if (!job) {
      throw new AppError("Job not found", 404, ErrorCode.NOT_FOUND);
    }
    return job;
  };
}
