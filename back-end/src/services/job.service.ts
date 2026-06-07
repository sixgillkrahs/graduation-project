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
        const { propertyId, operation = "UPSERT" } = job.payload;
        if (!propertyId) {
          throw new Error("Missing propertyId in payload");
        }

        if (operation === "DELETE") {
          await this.qdrantService.deletePropertyEmbedding(propertyId);
        } else {
          const property = await this.propertyService.getPropertyById(
            propertyId,
          ) as any;
          if (!property) {
            throw new Error("Property not found");
          }

          // Retry: chạy embedding trực tiếp (không enqueue) để await kết quả và cập nhật status đúng
          const textData = [
            property.title,
            property.projectName
              ? `Project: ${property.projectName}`
              : undefined,
            property.description,
            property.demandType
              ? `Demand type: ${property.demandType}`
              : undefined,
            property.propertyType
              ? `Property type: ${property.propertyType}`
              : undefined,
            property.location?.address
              ? `Address: ${property.location.address}`
              : undefined,
            [
              property.location?.ward,
              property.location?.district,
              property.location?.province,
            ]
              .filter(Boolean)
              .join(", "),
            Number.isFinite(property.features?.area)
              ? `Area: ${property.features.area} m2`
              : undefined,
            Number.isFinite(property.features?.price)
              ? `Price: ${property.features.price} ${property.features?.currency || ""} ${property.features?.priceUnit || ""}`.trim()
              : undefined,
            Number.isFinite(property.features?.bedrooms)
              ? `Bedrooms: ${property.features.bedrooms}`
              : undefined,
            Number.isFinite(property.features?.bathrooms)
              ? `Bathrooms: ${property.features.bathrooms}`
              : undefined,
            property.features?.furniture
              ? `Furniture: ${property.features.furniture}`
              : undefined,
            property.features?.direction
              ? `Direction: ${property.features.direction}`
              : undefined,
            property.features?.legalStatus
              ? `Legal status: ${property.features.legalStatus}`
              : undefined,
            Array.isArray(property.amenities) && property.amenities.length > 0
              ? `Amenities: ${property.amenities.join(", ")}`
              : undefined,
          ]
            .map((value) => (typeof value === "string" ? value.trim() : ""))
            .filter(Boolean)
            .join(". ");

          const payload = {
            propertyId: property._id.toString(),
            status: property.status,
            demandType: property.demandType,
            type: property.propertyType,
            province: property.location?.province,
            district: property.location?.district,
            ward: property.location?.ward,
            price: property.features?.price,
            area: property.features?.area,
            bedrooms: property.features?.bedrooms,
            bathrooms: property.features?.bathrooms,
            amenities: property.amenities || [],
          };
          await this.qdrantService.upsertPropertyEmbedding(
            property._id.toString(),
            textData,
            payload,
          );
        }
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
