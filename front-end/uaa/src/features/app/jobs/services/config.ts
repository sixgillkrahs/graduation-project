import type { Id } from "@shared/types/service";

export const JobQueryKey = {
  getJobs: "jobs/getJobs",
  getJob: "jobs/getJob",
};

export const JobEndpoint = {
  GetJobs: () => "/jobs",
  GetJob: (id: Id) => `/jobs/${id}`,
  RetryJob: (id: Id) => `/jobs/${id}/retry`,
  DeleteJob: (id: Id) => `/jobs/${id}`,
};
