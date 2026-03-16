import { singleton } from "@/decorators/singleton";
import AuthModel from "@/models/auth.model";
import AgentModel, { AgentStatusEnum } from "@/models/agent.model";
import PropertyModel, { PropertyStatusEnum } from "@/models/property.model";
import ReportModel, {
  ReportReasonEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
} from "@/models/report.model";
import RoleModel from "@/models/role.model";
import UserModel from "@/models/user.model";

type CreateOrUpdateReportPayload = {
  reporterUserId: string;
  targetType: ReportTargetTypeEnum;
  targetId: string;
  reason: ReportReasonEnum;
  details?: string;
};

@singleton
export class ReportService {
  async getAdminUserIds() {
    const adminRole = await RoleModel.findOne({ code: "ADMIN" })
      .select("_id")
      .lean()
      .exec();

    if (!adminRole?._id) {
      return [];
    }

    const adminAuths = await AuthModel.find({
      roleId: adminRole._id,
    })
      .select("userId")
      .lean()
      .exec();

    return adminAuths
      .map((item) => item.userId?.toString())
      .filter((item): item is string => Boolean(item));
  }

  private async ensureTargetExists(
    targetType: ReportTargetTypeEnum,
    targetId: string,
  ) {
    if (targetType === ReportTargetTypeEnum.LISTING) {
      const property = await PropertyModel.findOne({
        _id: targetId,
        status: PropertyStatusEnum.PUBLISHED,
      })
        .select("_id")
        .lean()
        .exec();

      return Boolean(property);
    }

    const [agent, user] = await Promise.all([
      AgentModel.findOne({
        userId: targetId,
        status: AgentStatusEnum.APPROVED,
      })
        .select("_id")
        .lean()
        .exec(),
      UserModel.findOne({
        _id: targetId,
        isDeleted: false,
        isActive: true,
      })
        .select("_id")
        .lean()
        .exec(),
    ]);

    return Boolean(agent && user);
  }

  async createOrUpdateReport(payload: CreateOrUpdateReportPayload) {
    const targetExists = await this.ensureTargetExists(
      payload.targetType,
      payload.targetId,
    );

    if (!targetExists) {
      return null;
    }

    const trimmedDetails = payload.details?.trim() || "";

    return await ReportModel.findOneAndUpdate(
      {
        reporterUserId: payload.reporterUserId,
        targetType: payload.targetType,
        targetId: payload.targetId,
      },
      {
        $set: {
          reason: payload.reason,
          details: trimmedDetails,
          status: ReportStatusEnum.OPEN,
          reportedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    )
      .lean()
      .exec();
  }
}
