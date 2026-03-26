import InfoField from "./InfoField";
import { resolveDocumentImageUrl } from "@shared/helper/documentImage";
import { Card, Image } from "antd";
import { memo } from "react";
import { useTranslation } from "react-i18next";

type AgentIdentityInfoCardProps = {
  detail: IAgentRegistrationService.AgentRegistration;
};

const AgentIdentityInfoCard = ({ detail }: AgentIdentityInfoCardProps) => {
  const { t } = useTranslation("agents");

  return (
    <Card title={t("detail.identityInfo")} style={{ marginBottom: 16 }}>
      <InfoField
        label={t("detail.identityNumber")}
        value={detail.basicInfo.identityInfo.IDNumber}
      />
      <InfoField label={t("detail.fullName")} value={detail.basicInfo.identityInfo.fullName} />
      <InfoField
        label={t("detail.gender")}
        value={
          detail.basicInfo.identityInfo.gender === "Nam"
            ? t("detail.male")
            : t("detail.female")
        }
      />
      <InfoField
        label={t("detail.dateOfBirth")}
        value={detail.basicInfo.identityInfo.dateOfBirth}
      />
      <InfoField
        label={t("detail.placeOfBirth")}
        value={detail.basicInfo.identityInfo.placeOfBirth}
      />
      <InfoField
        label={t("detail.nationality")}
        value={detail.basicInfo.identityInfo.nationality}
      />
      <InfoField
        label={t("detail.identityFront")}
        value={
          detail.imageInfo?.identityFront ? (
            <Image
              width={200}
              src={resolveDocumentImageUrl(detail.imageInfo.identityFront)}
              alt="Identity Front"
            />
          ) : (
            "-"
          )
        }
      />
      <InfoField
        label={t("detail.identityBack")}
        value={
          detail.imageInfo?.identityBack ? (
            <Image
              width={200}
              src={resolveDocumentImageUrl(detail.imageInfo.identityBack)}
              alt="Identity Back"
            />
          ) : (
            "-"
          )
        }
      />
    </Card>
  );
};

export default memo(AgentIdentityInfoCard);
