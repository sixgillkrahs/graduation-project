export const ROUTES = {
  // Main
  HOME: "/",
  PROPERTIES: "/properties",
  PROPERTY_DETAIL: (id: string) => `/properties/${id}` as const,
  LIST: "/list",

  // Auth
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_EMAIL: (token: string) => `/verify-email/${token}` as const,

  // Profile
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
  SETTINGS: "/settings",

  // Work
  BECOME_AGENT: "/work/become-agent",
  RECRUITMENT: "/work/become-agent/recruitment",

  // Agent
  AGENT_DASHBOARD: "/agent/dashboard",
  AGENT_LISTINGS: "/agent/listings",
  AGENT_LISTINGS_ADD: "/agent/listings/add",
  AGENT_LANDLORD: "/agent/landlord",
  AGENT_LANDLORD_DETAIL: (id: string) => `/agent/landlord/${id}` as const,
  AGENT_MESSAGES: "/agent/messages",
  AGENT_MESSAGE_DETAIL: (id: string) => `/agent/messages/${id}` as const,
  AGENT_SCHEDULE: "/agent/schedule",
  AGENT_CRM: "/agent/crm",
  AGENT_PROFILE: "/agent/profile",

  // Misc
  POLICY: "/policy",
} as const;
