import mongoDB from "@/config/database";
import { logger } from "@/config/logger";
import { Operation } from "@/models/permission.model";
import PermissionModel from "@/models/permission.model";
import ResourceModel from "@/models/resource.model";

const resourceNameMap: Record<string, { en: string; vi: string }> = {
  "/api/auth": { en: "Authentication", vi: "Xác thực" },
  "/api/users": { en: "Users", vi: "Người dùng" },
  "/api/roles": { en: "Roles", vi: "Vai trò" },
  "/api/permissions": { en: "Permissions", vi: "Quyền" },
  "/api/resources": { en: "Resources", vi: "Tài nguyên" },
  "/api/agents-registrations": { en: "Agent Registrations", vi: "Đăng ký môi giới" },
  "/api/agents": { en: "Agents", vi: "Môi giới" },
  "/api/properties": { en: "Properties", vi: "Bất động sản" },
  "/api/reviews": { en: "Reviews", vi: "Đánh giá" },
  "/api/reports": { en: "Reports", vi: "Báo cáo" },
  "/api/jobs": { en: "Jobs", vi: "Công việc" },
  "/api/leads": { en: "Leads", vi: "Khách hàng tiềm năng" },
  "/api/landlords": { en: "Landlords", vi: "Chủ nhà" },
  "/api/schedules": { en: "Schedules", vi: "Lịch hẹn" },
  "/api/notices": { en: "Notices", vi: "Thông báo" },
  "/api/chat": { en: "Chat", vi: "Trò chuyện" },
  "/api/upload": { en: "Uploads", vi: "Tải tệp" },
  "/api/payment": { en: "Payments", vi: "Thanh toán" },
  "/api/monitoring": { en: "Monitoring", vi: "Giám sát" },
};

const operationNameMap: Record<Operation, { en: string; vi: string }> = {
  [Operation.Read]: { en: "View", vi: "Xem" },
  [Operation.Create]: { en: "Create", vi: "Tạo" },
  [Operation.Update]: { en: "Update", vi: "Cập nhật" },
  [Operation.Delete]: { en: "Delete", vi: "Xóa" },
  [Operation.Approve]: { en: "Approve", vi: "Phê duyệt" },
  [Operation.Export]: { en: "Export", vi: "Xuất" },
};

const parseArgs = (argv: string[]) => ({
  dryRun: argv.includes("--dry-run"),
});

const run = async () => {
  const options = parseArgs(process.argv.slice(2));

  logger.info("Starting access control name migration");

  await mongoDB.connect();

  try {
    const resources = await ResourceModel.find().lean().exec();

    let migratedResources = 0;

    for (const resource of resources) {
      if (typeof resource.name !== "string") {
        continue;
      }

      const localizedName = resourceNameMap[resource.path] || {
        en: resource.name,
        vi: resource.name,
      };

      if (!options.dryRun) {
        await ResourceModel.updateOne(
          { _id: resource._id },
          {
            $set: {
              name: localizedName,
            },
          },
        ).exec();
      }

      migratedResources += 1;
    }

    const resourceMap = new Map(
      (await ResourceModel.find().lean().exec()).map((resource) => [
        resource._id.toString(),
        resource,
      ]),
    );

    const permissions = await PermissionModel.find().lean().exec();

    let migratedPermissions = 0;

    for (const permission of permissions) {
      if (typeof permission.name !== "string") {
        continue;
      }

      const resource = resourceMap.get(permission.resourceId.toString());
      const resourceName =
        resource?.name && typeof resource.name !== "string"
          ? resource.name
          : { en: permission.name, vi: permission.name };
      const operationName = operationNameMap[permission.operation as Operation];

      const localizedName = operationName
        ? {
            en: `${operationName.en} ${resourceName.en}`,
            vi: `${operationName.vi} ${resourceName.vi}`,
          }
        : {
            en: permission.name,
            vi: permission.name,
          };

      if (!options.dryRun) {
        await PermissionModel.updateOne(
          { _id: permission._id },
          {
            $set: {
              name: localizedName,
            },
          },
        ).exec();
      }

      migratedPermissions += 1;
    }

    logger.info(
      options.dryRun
        ? "Access control name migration dry run completed"
        : "Access control name migration completed",
      {
      migratedResources,
      migratedPermissions,
      },
    );
  } finally {
    await mongoDB.disconnect();
  }
};

run().catch(async (error) => {
  logger.error("Access control name migration crashed", { error });

  try {
    await mongoDB.disconnect();
  } catch (disconnectError) {
    logger.error("Failed to disconnect after access control migration crash", {
      error: disconnectError,
    });
  }

  process.exit(1);
});
