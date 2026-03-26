import AgentRegistrationService from "../../../agent-registration/services/service";
import InfoField from "./InfoField";
import { toVietnamTime } from "@shared/render/time";
import { Card, Tag } from "antd";
import { memo } from "react";
import { useTranslation } from "react-i18next";

type AgentOverviewCardProps = {
  detail: IAgentRegistrationService.AgentRegistration;
};

const AgentOverviewCard = ({ detail }: AgentOverviewCardProps) => {
  const { t } = useTranslation("agents");
  const statusColor = AgentRegistrationService.STATUS.find(
    (item) => item.value === detail.status,
  )?.color;
  const accountLock = detail.accountLock;
  const isAccountLocked = !!accountLock;

  return (
    <Card title={t("detail.info")} style={{ marginBottom: 16 }}>
      <InfoField label={t("detail.nameRegister")} value={detail.basicInfo.nameRegister} />
      <InfoField label={t("detail.phone")} value={detail.basicInfo.phoneNumber} />
      <InfoField label={t("detail.email")} value={detail.basicInfo.email} />
      <InfoField
        label={t("detail.status")}
        value={<Tag color={statusColor}>{t(`statusValue.${detail.status}`)}</Tag>}
      />
      <InfoField
        label={t("manage.accountStatus")}
        value={
          isAccountLocked ? (
            <Tag color="red">{t("manage.accountLocked")}</Tag>
          ) : (
            <Tag color="green">{t("manage.accountActive")}</Tag>
          )
        }
      />
      {accountLock ? (
        <>
          <InfoField
            label={t("manage.lockMode")}
            value={
              <Tag color="red">
                {accountLock.lockType === "PERMANENT"
                  ? t("manage.lockModePermanent")
                  : t("manage.lockModeTemporary")}
              </Tag>
            }
          />
          <InfoField label={t("manage.lockedAt")} value={toVietnamTime(accountLock.lockedAt)} />
          <InfoField label={t("manage.lockReason")} value={accountLock.reason || "-"} />
          <InfoField
            label={t("manage.lockedUntil")}
            value={
              accountLock.lockType === "PERMANENT"
                ? t("manage.forever")
                : accountLock.lockedUntil
                  ? toVietnamTime(accountLock.lockedUntil)
                  : "-"
            }
          />
        </>
      ) : null}
      {detail.unlockRequest ? (
        <>
          <InfoField
            label={t("manage.unlockRequestStatus")}
            value={<Tag color="gold">{t("manage.unlockRequestPending")}</Tag>}
          />
          <InfoField
            label={t("manage.unlockRequestedAt")}
            value={toVietnamTime(detail.unlockRequest.requestedAt)}
          />
          <InfoField
            label={t("manage.unlockContactEmail")}
            value={detail.unlockRequest.contactEmail || "-"}
          />
          <InfoField label={t("manage.unlockReason")} value={detail.unlockRequest.reason} />
        </>
      ) : null}
      <InfoField label={t("detail.approveDate")} value={toVietnamTime(detail.updatedAt)} />
      <InfoField label={t("detail.note")} value={detail.note || "-"} />
    </Card>
  );
};

export default memo(AgentOverviewCard);
