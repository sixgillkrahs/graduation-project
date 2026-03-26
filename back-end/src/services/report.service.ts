import { singleton } from "@/decorators/singleton";
import AuthModel from "@/models/auth.model";
import AgentModel, { AgentStatusEnum } from "@/models/agent.model";
import NoticeModel, { NoticeTypeEnum } from "@/models/notice.model";
import PropertyModel, { PropertyStatusEnum } from "@/models/property.model";
import ReportModel, {
  ReportReasonEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
} from "@/models/report.model";
import RoleModel from "@/models/role.model";
import UserModel from "@/models/user.model";
import { getAccountLockState } from "@/utils/accountLock";

type CreateOrUpdateReportPayload = {
  reporterUserId: string;
  targetType: ReportTargetTypeEnum;
  targetId: string;
  reason: ReportReasonEnum;
  details?: string;
};

type ResolveReportPayload = {
  reportId: string;
  resolvedBy: string;
  status: ReportStatusEnum.CONFIRMED | ReportStatusEnum.DISMISSED;
  adminNote?: string;
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
          adminNote: "",
          resolvedAt: null,
          resolvedBy: null,
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

  async getReportById(id: string) {
    return await ReportModel.findById(id).lean().exec();
  }

  async getReportDetail(id: string) {
    const report = await ReportModel.findById(id).lean().exec();

    if (!report) {
      return null;
    }

    const [reporter, resolver] = await Promise.all([
      UserModel.findById(report.reporterUserId)
        .select("_id fullName email phone")
        .lean()
        .exec(),
      report.resolvedBy
        ? UserModel.findById(report.resolvedBy)
            .select("_id fullName email")
            .lean()
            .exec()
        : Promise.resolve(null),
    ]);

    if (report.targetType === ReportTargetTypeEnum.LISTING) {
      const property = await PropertyModel.findById(report.targetId)
        .select(
          "_id title projectName status rejectReason adminNote createdAt updatedAt location userId features media",
        )
        .lean()
        .exec();

      const owner =
        property?.userId && typeof property.userId !== "string"
          ? await UserModel.findById(property.userId)
              .select("_id fullName email phone")
              .lean()
              .exec()
          : null;

      return {
        ...report,
        reporter,
        resolver,
        target: property
          ? {
              kind: ReportTargetTypeEnum.LISTING,
              id: property._id?.toString?.() || String(report.targetId),
              title: property.title || property.projectName || "Listing",
              projectName: property.projectName || "",
              status: property.status,
              rejectReason: property.rejectReason || "",
              adminNote: property.adminNote || "",
              createdAt: property.createdAt,
              updatedAt: property.updatedAt,
              location: property.location,
              owner,
              media: property.media,
              features: property.features,
            }
          : null,
      };
    }

    const [agent, user] = await Promise.all([
      AgentModel.findOne({
        userId: report.targetId,
      })
        .select(
          "_id userId status createdAt updatedAt basicInfo businessInfo note reasonReject planInfo",
        )
        .lean()
        .exec(),
      UserModel.findById(report.targetId)
        .select("_id fullName email phone isActive lockInfo avatarUrl")
        .lean()
        .exec(),
    ]);

    const lockState = getAccountLockState(user?.lockInfo);

    return {
      ...report,
      reporter,
      resolver,
      target:
        agent && user
          ? {
              kind: ReportTargetTypeEnum.AGENT,
              id: user._id?.toString?.() || String(report.targetId),
              registrationId: agent._id?.toString?.(),
              status: agent.status,
              createdAt: agent.createdAt,
              updatedAt: agent.updatedAt,
              basicInfo: agent.basicInfo,
              businessInfo: agent.businessInfo,
              note: agent.note || "",
              reasonReject: agent.reasonReject || "",
              planInfo: agent.planInfo,
              user: {
                id: user._id?.toString?.(),
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                isActive: user.isActive,
                avatarUrl: user.avatarUrl || "",
              },
              accountLock: lockState.isLocked
                ? {
                    lockType: user.lockInfo?.lockType,
                    reason: user.lockInfo?.reason || null,
                    lockedAt: user.lockInfo?.lockedAt,
                    lockedUntil: user.lockInfo?.lockedUntil ?? null,
                  }
                : null,
            }
          : null,
    };
  }

  async resolveReport(payload: ResolveReportPayload) {
    const trimmedNote = payload.adminNote?.trim() || "";
    const resolvedAt = new Date();

    const report = await ReportModel.findByIdAndUpdate(
      payload.reportId,
      {
        $set: {
          status: payload.status,
          adminNote: trimmedNote,
          resolvedAt,
          resolvedBy: payload.resolvedBy,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec();

    if (!report) {
      return null;
    }

    await NoticeModel.updateMany(
      {
        type: NoticeTypeEnum.REPORT,
        "metadata.reportId": payload.reportId,
      },
      {
        $set: {
          "metadata.reportStatus": payload.status,
          "metadata.adminNote": trimmedNote,
          "metadata.resolvedAt": resolvedAt,
        },
      },
    ).exec();

    return report;
  }
}
