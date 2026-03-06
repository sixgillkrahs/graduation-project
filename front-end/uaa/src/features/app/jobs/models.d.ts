declare namespace IJobService {
  interface JobDTO {
    id: string; // Used by frontend, derived from _id
    _id: string;
    type: "PROPERTY_EMBEDDING";
    payload: any;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    attempts: number;
    maxAttempts: number;
    error?: string;
    lastRunAt?: string;
    createdAt: string;
    updatedAt: string;
  }
}
