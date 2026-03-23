import { useGetAgentsRegistration } from "../../agent-registration/services/query";
import AgentRegistrationService from "../../agent-registration/services/service";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { resolveDocumentImageUrl } from "@shared/helper/documentImage";
import { renderConstant } from "@shared/render/const";
import { toVietnamTime } from "@shared/render/time";
import { Button, Card, Col, Flex, Image, Row, Space, Spin, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const { Text } = Typography;

interface InfoFieldProps {
  label: React.ReactNode;
  value?: React.ReactNode;
}

const InfoField = ({ label, value }: InfoFieldProps) => {
  const isReactNode = typeof value === "object" && value !== null;

  return (
    <Row gutter={[16, 4]} className="mb-2">
      <Col xs={24} sm={8} md={6} lg={5}>
        <Text>{label}:</Text>
      </Col>
      <Col xs={24} sm={16} md={18} lg={19}>
        {isReactNode ? value : <Text strong>{value || "-"}</Text>}
      </Col>
    </Row>
  );
};

const AgentManageDetail = () => {
  const { t } = useTranslation("agents");
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: agentDetail, isLoading } = useGetAgentsRegistration(id || "");

  const detail = agentDetail?.data;
  const statusColor = AgentRegistrationService.STATUS.find(
    (item) => item.value === detail?.status,
  )?.color;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-220px)] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!detail) {
    return <div>{t("detail.notFound")}</div>;
  }

  return (
    <Card
      actions={[
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          {t("detail.back")}
        </Button>,
      ]}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={3}>{t("manage.detailTitle")}</Typography.Title>
        <Space>
          <Tag color={statusColor}>{t(`statusValue.${detail.status}`)}</Tag>
        </Space>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title={t("detail.info")} style={{ marginBottom: 16 }}>
            <InfoField label={t("detail.nameRegister")} value={detail.basicInfo.nameRegister} />
            <InfoField label={t("detail.phone")} value={detail.basicInfo.phoneNumber} />
            <InfoField label={t("detail.email")} value={detail.basicInfo.email} />
            <InfoField
              label={t("detail.status")}
              value={<Tag color={statusColor}>{t(`statusValue.${detail.status}`)}</Tag>}
            />
            <InfoField label={t("detail.approveDate")} value={toVietnamTime(detail.updatedAt)} />
            <InfoField label={t("detail.note")} value={detail.note || "-"} />
          </Card>

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
        </Col>

        <Col xs={24} sm={12}>
          <Card title={t("detail.identityInfo")}>
            <InfoField
              label={t("detail.identityNumber")}
              value={detail.basicInfo.identityInfo.IDNumber}
            />
            <InfoField
              label={t("detail.fullName")}
              value={detail.basicInfo.identityInfo.fullName}
            />
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
        </Col>
      </Row>
    </Card>
  );
};

export default AgentManageDetail;
