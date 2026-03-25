import mongoDB from "@/config/database";
import { logger } from "@/config/logger";
import AuthModel from "@/models/auth.model";
import RoleModel from "@/models/role.model";
import UserModel from "@/models/user.model";
import bcrypt from "bcrypt";

type SeedAdminOptions = {
  username: string;
  email: string;
  password: string;
  fullName: string;
};

const DEFAULT_OPTIONS: SeedAdminOptions = {
  username: process.env.ADMIN_USERNAME || "admin@gmail.com",
  email: process.env.ADMIN_EMAIL || "admin@gmail.com",
  password: process.env.ADMIN_PASSWORD || "Admin@123456",
  fullName: process.env.ADMIN_FULL_NAME || "System Administrator",
};

const readOptionValue = (arg: string) => {
  const option = process.argv.find((entry) => entry.startsWith(`${arg}=`));
  return option ? option.slice(arg.length + 1) : undefined;
};

const parseOptions = (): SeedAdminOptions => ({
  username: readOptionValue("--username") || DEFAULT_OPTIONS.username,
  email: readOptionValue("--email") || DEFAULT_OPTIONS.email,
  password: readOptionValue("--password") || DEFAULT_OPTIONS.password,
  fullName: readOptionValue("--fullName") || DEFAULT_OPTIONS.fullName,
});

const run = async () => {
  const options = parseOptions();

  logger.info("Starting admin seed", {
    username: options.username,
    email: options.email,
    fullName: options.fullName,
  });

  await mongoDB.connect();

  try {
    const adminRole = await RoleModel.findOne({ code: "ADMIN" }).exec();

    if (!adminRole?._id) {
      throw new Error(
        'ADMIN role not found. Run resource, permission, and role seeds first.',
      );
    }

    let user = await UserModel.findOne({ email: options.email }).exec();

    if (!user) {
      user = await UserModel.create({
        email: options.email,
        fullName: options.fullName,
        phone: "",
        prefixPhone: "+84",
        address: "",
        avatarUrl:
          "https://res.cloudinary.com/dr1akv5p4/image/upload/v1769763068/default-avatar_rolye6.jpg",
        isActive: true,
        isDeleted: false,
      });
    } else {
      user.fullName = options.fullName;
      user.isActive = true;
      user.isDeleted = false;
      await user.save();
    }

    const hashedPassword = await bcrypt.hash(options.password, 10);

    let auth = await AuthModel.findOne({
      $or: [{ username: options.username }, { userId: user._id }],
    }).exec();

    if (!auth) {
      auth = await AuthModel.create({
        username: options.username,
        password: hashedPassword,
        userId: user._id as any,
        roleId: adminRole._id as any,
        passwordHistories: [
          {
            password: hashedPassword,
            createdAt: new Date(),
          },
        ],
      });
    } else {
      auth.username = options.username;
      auth.password = hashedPassword;
      auth.userId = user._id as any;
      auth.roleId = adminRole._id as any;
      auth.passwordHistories = [
        {
          password: hashedPassword,
          createdAt: new Date(),
        },
      ];
      await auth.save();
    }

    logger.info("Admin seed completed", {
      userId: user._id.toString(),
      authId: auth._id.toString(),
      username: options.username,
      email: options.email,
      roleCode: adminRole.code,
    });
  } finally {
    await mongoDB.disconnect();
  }
};

run().catch(async (error) => {
  logger.error("Admin seed crashed", { error });

  try {
    await mongoDB.disconnect();
  } catch (disconnectError) {
    logger.error("Failed to disconnect after admin seed crash", {
      error: disconnectError,
    });
  }

  process.exit(1);
});
