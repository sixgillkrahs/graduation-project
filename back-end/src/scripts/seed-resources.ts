import mongoDB from "@/config/database";
import { logger } from "@/config/logger";
import ResourceModel, { type IResource } from "@/models/resource.model";

const resources: IResource[] = [
  {
    name: { en: "Authentication", vi: "Xác thực" },
    path: "/api/auth",
    description: "Authentication, session, password, and passkey endpoints.",
  },
  {
    name: { en: "Users", vi: "Người dùng" },
    path: "/api/users",
    description: "User management endpoints.",
  },
  {
    name: { en: "Roles", vi: "Vai trò" },
    path: "/api/roles",
    description: "Role management endpoints.",
  },
  {
    name: { en: "Permissions", vi: "Quyền" },
    path: "/api/permissions",
    description: "Permission management endpoints.",
  },
  {
    name: { en: "Resources", vi: "Tài nguyên" },
    path: "/api/resources",
    description: "System resource catalog endpoints.",
  },
  {
    name: { en: "Agent Registrations", vi: "Đăng ký môi giới" },
    path: "/api/agents-registrations",
    description: "Agent application and approval workflow endpoints.",
  },
  {
    name: { en: "Agents", vi: "Môi giới" },
    path: "/api/agents",
    description: "Agent profile and management endpoints.",
  },
  {
    name: { en: "Properties", vi: "Bất động sản" },
    path: "/api/properties",
    description: "Property listing and moderation endpoints.",
  },
  {
    name: { en: "Reviews", vi: "Đánh giá" },
    path: "/api/reviews",
    description: "Review management and moderation endpoints.",
  },
  {
    name: { en: "Reports", vi: "Báo cáo" },
    path: "/api/reports",
    description: "Report inbox and abuse report endpoints.",
  },
  {
    name: { en: "Jobs", vi: "Công việc" },
    path: "/api/jobs",
    description: "Job posting and recruitment endpoints.",
  },
  {
    name: { en: "Leads", vi: "Khách hàng tiềm năng" },
    path: "/api/leads",
    description: "Lead management endpoints.",
  },
  {
    name: { en: "Landlords", vi: "Chủ nhà" },
    path: "/api/landlords",
    description: "Landlord management endpoints.",
  },
  {
    name: { en: "Schedules", vi: "Lịch hẹn" },
    path: "/api/schedules",
    description: "Appointment and schedule management endpoints.",
  },
  {
    name: { en: "Notices", vi: "Thông báo" },
    path: "/api/notices",
    description: "Notification and notice endpoints.",
  },
  {
    name: { en: "Chat", vi: "Trò chuyện" },
    path: "/api/chat",
    description: "Conversation and messaging endpoints.",
  },
  {
    name: { en: "Uploads", vi: "Tải tệp" },
    path: "/api/upload",
    description: "File and image upload endpoints.",
  },
  {
    name: { en: "Payments", vi: "Thanh toán" },
    path: "/api/payment",
    description: "Payment gateway and transaction initiation endpoints.",
  },
  {
    name: { en: "Monitoring", vi: "Giám sát" },
    path: "/api/monitoring",
    description: "Healthcheck, metrics, and monitoring endpoints.",
  },
];

const run = async () => {
  logger.info("Starting resource seed", { count: resources.length });

  await mongoDB.connect();

  try {
    const operations = resources.map((resource) => ({
      updateOne: {
        filter: { path: resource.path },
        update: {
          $set: {
            name: resource.name,
            description: resource.description,
            path: resource.path,
          },
        },
        upsert: true,
      },
    }));

    const result = await ResourceModel.bulkWrite(operations, {
      ordered: false,
    });

    const totalResources = await ResourceModel.countDocuments().exec();

    logger.info("Resource seed completed", {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      totalResources,
    });
  } finally {
    await mongoDB.disconnect();
  }
};

run().catch(async (error) => {
  logger.error("Resource seed crashed", { error });

  try {
    await mongoDB.disconnect();
  } catch (disconnectError) {
    logger.error("Failed to disconnect after resource seed crash", {
      error: disconnectError,
    });
  }

  process.exit(1);
});
