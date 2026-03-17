import mongoDB from "@/config/database";
import { logger } from "@/config/logger";
import { Operation } from "@/models/permission.model";
import PermissionModel from "@/models/permission.model";
import "@/models/resource.model";
import RoleModel, { type IRole } from "@/models/role.model";
import mongoose from "mongoose";

type PermissionDocument = {
  _id: mongoose.Types.ObjectId;
  operation: Operation;
  resourceId?: {
    _id: mongoose.Types.ObjectId;
    path?: string;
  };
};

type PermissionSelector = {
  paths: string[];
  operations?: Operation[];
};

type RoleSeedDefinition = Omit<IRole, "permissionIds"> & {
  allPermissions?: boolean;
  permissionSelectors?: PermissionSelector[];
};

const parseArgs = (argv: string[]) => ({
  dryRun: argv.includes("--dry-run"),
});

const normalizePath = (path: string) => {
  const trimmedPath = path.trim();

  if (!trimmedPath) {
    return trimmedPath;
  }

  return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
};

const getPermissionKey = (path: string, operation: Operation) =>
  `${normalizePath(path)}:${operation}`;

const uniqueObjectIds = (values: mongoose.Types.ObjectId[]) => {
  const map = new Map(values.map((value) => [value.toString(), value]));
  return Array.from(map.values());
};

const selectPermissionIds = (
  selectors: PermissionSelector[] | undefined,
  permissionMap: Map<string, mongoose.Types.ObjectId>,
) => {
  if (!selectors?.length) {
    return [];
  }

  const permissionIds: mongoose.Types.ObjectId[] = [];

  for (const selector of selectors) {
    const operations =
      selector.operations && selector.operations.length > 0
        ? selector.operations
        : Object.values(Operation);

    for (const path of selector.paths) {
      for (const operation of operations) {
        const permissionId = permissionMap.get(getPermissionKey(path, operation));

        if (permissionId) {
          permissionIds.push(permissionId);
        }
      }
    }
  }

  return uniqueObjectIds(
    permissionIds,
  ) as unknown as mongoose.Schema.Types.ObjectId[];
};

const roleSeeds: RoleSeedDefinition[] = [
  {
    name: "User",
    code: "USER",
    description: "Default end-user role for public website accounts.",
    isActive: true,
    isDefault: true,
    isSystem: true,
    permissionSelectors: [],
  },
  {
    name: "Agent",
    code: "AGENT",
    description: "Broker role for approved agents on the platform.",
    isActive: true,
    isDefault: false,
    isSystem: true,
    permissionSelectors: [
      {
        paths: [
          "/api/agents",
          "/api/properties",
          "/api/reviews",
          "/api/leads",
          "/api/schedules",
          "/api/notices",
          "/api/chat",
          "/api/upload",
          "/api/payment",
        ],
        operations: [Operation.Read, Operation.Create, Operation.Update],
      },
      {
        paths: ["/api/properties", "/api/reviews", "/api/upload"],
        operations: [Operation.Delete],
      },
    ],
  },
  {
    name: "Administrator",
    code: "ADMIN",
    description: "Full system administration role with access to all permissions.",
    isActive: true,
    isDefault: false,
    isSystem: true,
    allPermissions: true,
  },
  {
    name: "Agent Manager",
    code: "AGENT_MANAGER",
    description: "Manages agent registrations, agents, leads, schedules, and users.",
    isActive: true,
    isDefault: false,
    isSystem: false,
    permissionSelectors: [
      {
        paths: [
          "/api/agents-registrations",
          "/api/agents",
          "/api/users",
          "/api/leads",
          "/api/schedules",
          "/api/notices",
        ],
        operations: [
          Operation.Read,
          Operation.Create,
          Operation.Update,
          Operation.Delete,
          Operation.Approve,
          Operation.Export,
        ],
      },
    ],
  },
  {
    name: "Content Moderator",
    code: "CONTENT_MODERATOR",
    description: "Moderates listings, reviews, reports, and related public content.",
    isActive: true,
    isDefault: false,
    isSystem: false,
    permissionSelectors: [
      {
        paths: ["/api/properties", "/api/reviews", "/api/reports"],
        operations: [
          Operation.Read,
          Operation.Update,
          Operation.Delete,
          Operation.Approve,
          Operation.Export,
        ],
      },
    ],
  },
];

const run = async () => {
  const options = parseArgs(process.argv.slice(2));

  logger.info("Starting role seed", options);

  await mongoDB.connect();

  try {
    const [permissions, existingRoles] = await Promise.all([
      PermissionModel.find({}, "_id operation resourceId")
        .populate("resourceId", "_id path")
        .lean<PermissionDocument[]>()
        .exec(),
      RoleModel.find({}, "code").lean().exec(),
    ]);

    const permissionMap = new Map<string, mongoose.Types.ObjectId>();

    for (const permission of permissions) {
      const path = permission.resourceId?.path;

      if (!path) {
        continue;
      }

      permissionMap.set(
        getPermissionKey(path, permission.operation),
        permission._id,
      );
    }

    const rolePayloads: IRole[] = roleSeeds.map((role) => ({
      name: role.name,
      code: role.code,
      description: role.description,
      isActive: role.isActive,
      isDefault: role.isDefault,
      isSystem: role.isSystem,
      permissionIds: role.allPermissions
        ? (permissions.map(
            (permission) => permission._id,
          ) as unknown as mongoose.Schema.Types.ObjectId[])
        : selectPermissionIds(role.permissionSelectors, permissionMap),
    }));

    const existingRoleCodes = new Set(existingRoles.map((role) => role.code));
    const wouldCreate = rolePayloads.filter((role) => !existingRoleCodes.has(role.code)).length;
    const wouldUpdate = rolePayloads.length - wouldCreate;

    if (options.dryRun) {
      logger.info("Role seed dry run completed", {
        roleCount: rolePayloads.length,
        permissionCount: permissions.length,
        wouldCreate,
        wouldUpdate,
        roles: rolePayloads.map((role) => ({
          code: role.code,
          permissionCount: role.permissionIds.length,
          isDefault: role.isDefault,
          isSystem: role.isSystem,
        })),
      });
      return;
    }

    const operations = rolePayloads.map((role) => ({
      updateOne: {
        filter: { code: role.code },
        update: {
          $set: {
            name: role.name,
            description: role.description,
            isActive: role.isActive,
            isDefault: role.isDefault,
            isSystem: role.isSystem,
            permissionIds: role.permissionIds,
          },
        },
        upsert: true,
      },
    }));

    const result = await RoleModel.bulkWrite(operations, {
      ordered: false,
    });

    const totalRoles = await RoleModel.countDocuments().exec();

    logger.info("Role seed completed", {
      roleCount: rolePayloads.length,
      permissionCount: permissions.length,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      totalRoles,
    });
  } finally {
    await mongoDB.disconnect();
  }
};

run().catch(async (error) => {
  logger.error("Role seed crashed", { error });

  try {
    await mongoDB.disconnect();
  } catch (disconnectError) {
    logger.error("Failed to disconnect after role seed crash", {
      error: disconnectError,
    });
  }

  process.exit(1);
});
