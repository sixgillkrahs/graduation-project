export const ScheduleEndpoint = {
  getSchedule: () => "/schedules/me",
  createSchedule: () => "/schedules",
  updateSchedule: (id: string) => `/schedules/${id}`,
  deleteSchedule: (id: string) => `/schedules/${id}`,
  getScheduleById: (id: string) => `/schedules/${id}`,
} as const;

export const ScheduleQueryKey = {
  getSchedules: "getSchedules",
  getScheduleById: "getScheduleById",
} as const;
