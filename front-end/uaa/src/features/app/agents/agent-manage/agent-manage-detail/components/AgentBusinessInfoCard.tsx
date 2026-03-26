import AgentRegistrationService from "../../../agent-registration/services/service";
import InfoField from "./InfoField";
import { resolveDocumentImageUrl } from "@shared/helper/documentImage";
import { renderConstant } from "@shared/render/const";
import { Card, Image, Tag } from "antd";
import { memo } from "react";
import { useTranslation } from "react-i18next";

type AgentBusinessInfoCardProps = {
  detail: IAgentRegistrationService.AgentRegistration;
};

const AgentBusinessInfoCard = ({ detail }: AgentBusinessInfoCardProps) => {
  const { t } = useTranslation("agents");

  return (
    <Card title={t("detail.businessInfo")}>
      <InfoField label={t("detail.taxCode")} value={detail.businessInfo.taxCode} />
      <InfoField
        label={t("detail.specialization")}
        value={
          detail.businessInfo.specialization?.length ? (
            <>
              {detail.businessInfo.specialization.map((item) => (
                <Tag key={item} color="blue">
                  {item}
                </Tag>
              ))}
            </>
          ) : (
            "-"
          )
        }
      />
      <InfoField
        label={t("detail.workingArea")}
        value={
          detail.businessInfo.workingArea?.length ? (
            <>
              {detail.businessInfo.workingArea.map((item) => (
                <Tag key={item}>
                  {renderConstant(item, AgentRegistrationService.VietNamProvide)}
                </Tag>
              ))}
            </>
          ) : (
            "-"
          )
        }
      />
      <InfoField
        label={t("detail.yearsOfExperience")}
        value={
          <>
            {detail.businessInfo.yearsOfExperience} {t("detail.years")}
          </>
        }
      />
      <InfoField
        label={t("detail.certificateNumber")}
        value={detail.businessInfo.certificateNumber}
      />
      <InfoField
        label={t("detail.certificate")}
        value={
          detail.imageInfo?.certificateImage?.length ? (
            <>
              {detail.imageInfo.certificateImage.map((image) => (
                <Image
                  key={image}
                  width={200}
                  src={resolveDocumentImageUrl(image)}
                  alt="Certificate"
                />
              ))}
            </>
          ) : (
            "-"
          )
        }
      />
    </Card>
  );
};

export default memo(AgentBusinessInfoCard);
