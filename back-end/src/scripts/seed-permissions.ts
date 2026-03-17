import mongoDB from "@/config/database";
import { logger } from "@/config/logger";
import { Operation, type IPermission } from "@/models/permission.model";
import PermissionModel from "@/models/permission.model";
import ResourceModel, { type ILocalizedName, type IResource } from "@/models/resource.model";
import mongoose from "mongoose";

type ResourceDocument = IResource & {
  _id: mongoose.Types.ObjectId;
};

const parseArgs = (argv: string[]) => ({
  dryRun: argv.includes("--dry-run"),
});

const buildPermissionKey = (resourceId: string, operation: Operation) =>
  `${resourceId}:${operation}`;

const buildPermissionName = (resource: ResourceDocument, operation: Operation) => {
  const operationLabelMap: Record<Operation, ILocalizedName> = {
    [Operation.Read]: { en: "View", vi: "Xem" },
    [Operation.Create]: { en: "Create", vi: "Tạo" },
    [Operation.Update]: { en: "Update", vi: "Cập nhật" },
    [Operation.Delete]: { en: "Delete", vi: "Xóa" },
    [Operation.Approve]: { en: "Approve", vi: "Phê duyệt" },
    [Operation.Export]: { en: "Export", vi: "Xuất" },
  };

  return {
    en: `${operationLabelMap[operation].en} ${resource.name.en}`,
    vi: `${operationLabelMap[operation].vi} ${resource.name.vi}`,
  };
};

const getOperationsForPath = (path: string): Operation[] => {
  switch (path) {
    case "/api/auth":
      return [Operation.Read, Operation.Create, Operation.Update];
    case "/api/upload":
      return [Operation.Read, Operation.Create, Operation.Delete];
    case "/api/payment":
      return [Operation.Read, Operation.Create];
    case "/api/monitoring":
      return [Operation.Read, Operation.Export];
    case "/api/agents-registrations":
      return [
        Operation.Read,
        Operation.Create,
        Operation.Update,
        Operation.Delete,
        Operation.Approve,
        Operation.Export,
      ];
    case "/api/agents":
    case "/api/properties":
    case "/api/reviews":
      return [
        Operation.Read,
        Operation.Create,
        Operation.Update,
        Operation.Delete,
        Operation.Approve,
        Operation.Export,
      ];
    case "/api/reports":
      return [
        Operation.Read,
        Operation.Update,
        Operation.Delete,
        Operation.Approve,
        Operation.Export,
      ];
    default:
      return [
        Operation.Read,
        Operation.Create,
        Operation.Update,
        Operation.Delete,
      ];
  }
};

const buildPermissionDescription = (
  resource: ResourceDocument,
  operation: Operation,
) => {
  const operationDescriptionMap: Record<Operation, string> = {
    [Operation.Read]: "view",
    [Operation.Create]: "create",
    [Operation.Update]: "update",
    [Operation.Delete]: "delete",
    [Operation.Approve]: "approve",
    [Operation.Export]: "export",
  };

  return `Allows users to ${operationDescriptionMap[operation]} ${resource.name.en.toLowerCase()}.`;
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));

  logger.info("Starting permission seed", options);

  await mongoDB.connect();

  try {
    const [resources, existingPermissions] = await Promise.all([
      ResourceModel.find().sort({ path: 1 }).exec(),
      PermissionModel.find({}, "resourceId operation").lean().exec(),
    ]);

    const existingPermissionKeys = new Set(
      existingPermissions.map((permission) =>
        buildPermissionKey(
          permission.resourceId.toString(),
          permission.operation as Operation,
        ),
      ),
    );

    const permissionPayloads: IPermission[] = resources.flatMap((resource) =>
      getOperationsForPath(resource.path).map((operation) => ({
        name: buildPermissionName(resource as ResourceDocument, operation),
        description: buildPermissionDescription(
          resource as ResourceDocument,
          operation,
        ),
        resourceId: resource._id as unknown as mongoose.Schema.Types.ObjectId,
        operation,
        isActive: true,
      })),
    );

    const wouldCreate = permissionPayloads.filter(
      (permission) =>
        !existingPermissionKeys.has(
          buildPermissionKey(permission.resourceId.toString(), permission.operation),
        ),
    ).length;

    const wouldUpdate = permissionPayloads.length - wouldCreate;

    if (options.dryRun) {
      logger.info("Permission seed dry run completed", {
        resourceCount: resources.length,
        permissionCount: permissionPayloads.length,
        wouldCreate,
        wouldUpdate,
      });
      return;
    }

    const operations = permissionPayloads.map((permission) => ({
      updateOne: {
        filter: {
          resourceId: permission.resourceId,
          operation: permission.operation,
        },
        update: {
          $set: {
            name: permission.name,
            description: permission.description,
            isActive: permission.isActive,
          },
        },
        upsert: true,
      },
    }));

    const result = await PermissionModel.bulkWrite(operations, {
      ordered: false,
    });

    const totalPermissions = await PermissionModel.countDocuments().exec();

    logger.info("Permission seed completed", {
      resourceCount: resources.length,
      permissionCount: permissionPayloads.length,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      totalPermissions,
    });
  } finally {
    await mongoDB.disconnect();
  }
};

run().catch(async (error) => {
  logger.error("Permission seed crashed", { error });

  try {
    await mongoDB.disconnect();
  } catch (disconnectError) {
    logger.error("Failed to disconnect after permission seed crash", {
      error: disconnectError,
    });
  }

  process.exit(1);
});
