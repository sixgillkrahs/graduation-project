export const ScheduleEndpoint = {
  getSchedule: () => "/schedules/me",
  getAvailability: () => "/schedules/availability",
  createSchedule: () => "/schedules",
  requestSchedule: () => "/schedules/request",
  updateSchedule: (id: string) => `/schedules/${id}`,
  deleteSchedule: (id: string) => `/schedules/${id}`,
  getScheduleById: (id: string) => `/schedules/${id}`,
  getLeads: () => "/schedules/leads",
} as const;

export const ScheduleQueryKey = {
  getAvailability: "getAvailability",
  getSchedules: "getSchedules",
  getScheduleById: "getScheduleById",
  getLeads: "getLeads",
} as const;
