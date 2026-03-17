import { useAcceptAgentsRegistration, useRejectAgentsRegistration } from "../services/mutate";
import { useGetAgentsRegistration } from "../services/query";
import AgentRegistrationService from "../services/service";
import { ArrowLeftOutlined, CheckCircleFilled, ExclamationCircleFilled } from "@ant-design/icons";
import { resolveDocumentImageUrl } from "@shared/helper/documentImage";
import message from "@shared/message";
import { toVietnamTime } from "@shared/render/time";
import { Button, Card, Col, Flex, Image, Input, Modal, Row, Space, Tag, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Text } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;

interface InfoFieldProps {
  label: React.ReactNode;
  value?: React.ReactNode;
}

const showRejectConfirm = (onSubmit: (reason: string) => void, t: any) => {
  let reason = "";

  confirm({
    title: t("detail.confirmRejectTitle"),
    icon: <ExclamationCircleFilled />,
    content: (
      <div>
        <p>{t("detail.rejectReasonPrompt")}</p>
        <TextArea
          rows={4}
          placeholder={t("detail.enterRejectReason")}
          onChange={(e) => {
            reason = e.target.value;
          }}
        />
      </div>
    ),
    okText: t("detail.reject"),
    okType: "danger",
    cancelText: t("detail.cancel"),

    onOk() {
      onSubmit(reason.trim());
      return Promise.resolve();
    },
  });
};

const showApproveConfirm = (onSubmit: (note: string) => void, t: any) => {
  let note = "";

  confirm({
    title: t("detail.confirmApproveTitle"),
    icon: <CheckCircleFilled style={{ color: "#52c41a" }} />,
    content: (
      <div>
        <p>{t("detail.notePrompt")}</p>
        <TextArea
          rows={4}
          placeholder={t("detail.enterNote")}
          onChange={(e) => {
            note = e.target.value;
          }}
        />
      </div>
    ),
    okText: t("detail.accept"),
    cancelText: t("detail.cancel"),
    okButtonProps: {
      type: "primary",
    },
    onOk() {
      onSubmit(note.trim());
      return Promise.resolve();
    },
  });
};

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

const AgentRegistrationDetail = () => {
  const { t } = useTranslation("agents");
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: agentRegistrationDetail } = useGetAgentsRegistration(id!);
  const { mutateAsync: reject, isPending: rejectLoading } = useRejectAgentsRegistration();
  const { mutateAsync: approve, isPending: approveLoading } = useAcceptAgentsRegistration();

  const onReject = () => {
    showRejectConfirm(async (reason) => {
      if (id) {
        await reject({
          id: id,
          body: {
            reason: reason,
          },
        });
      } else {
        message.error("Error");
      }
    }, t);
  };

  const onApprove = () => {
    showApproveConfirm(async (note) => {
      await approve({
        id: id!,
        body: {
          note: note,
        },
      });
    }, t);
  };

  const onBack = () => {
    navigate(-1);
  };

  return (
    <Card
      actions={[
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          {t("detail.back")}
        </Button>,
      ]}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={3}>{t("detail.title")}</Typography.Title>
        <Space>
          {agentRegistrationDetail?.data.status == AgentRegistrationService.STATUS[0].value && (
            <>
              <Button type="primary" onClick={onApprove} loading={approveLoading}>
                {t("detail.accept")}
              </Button>
              <Button danger onClick={onReject} loading={rejectLoading}>
                {t("detail.reject")}
              </Button>
            </>
          )}
        </Space>
      </Flex>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            title={t("detail.info")}
            style={{
              marginBottom: 16,
            }}
          >
            <InfoField
              label={t("detail.nameRegister")}
              value={agentRegistrationDetail?.data.basicInfo.nameRegister}
            />
            <InfoField label={t("detail.phone")} value={agentRegistrationDetail?.data.basicInfo.phoneNumber} />
            <InfoField label={t("detail.email")} value={agentRegistrationDetail?.data.basicInfo.email} />
            {agentRegistrationDetail?.data.status && (
              <InfoField
                label={t("detail.status")}
                value={
                  <Tag color={AgentRegistrationService.STATUS.find(i => i.value === agentRegistrationDetail?.data.status)?.color}>
                    {t(`statusValue.${agentRegistrationDetail?.data.status}`)}
                  </Tag>
                }
              />
            )}
            {agentRegistrationDetail?.data.status == AgentRegistrationService.STATUS[2].value && (
              <>
                <InfoField
                  label={t("detail.rejectReason")}
                  value={agentRegistrationDetail?.data.reasonReject || "-"}
                />
                <InfoField
                  label={t("detail.rejectDate")}
                  value={toVietnamTime(agentRegistrationDetail?.data?.updatedAt)}
                />
              </>
            )}
            {agentRegistrationDetail?.data.status == AgentRegistrationService.STATUS[1].value && (
              <>
                <InfoField
                  label={t("detail.approveDate")}
                  value={toVietnamTime(agentRegistrationDetail?.data?.updatedAt)}
                />
                <InfoField label={t("detail.note")} value={agentRegistrationDetail?.data.note || "-"} />
              </>
            )}
          </Card>
          <Card title={t("detail.businessInfo")}>
            <InfoField
              label={t("detail.taxCode")}
              value={agentRegistrationDetail?.data.businessInfo.taxCode}
            />
            <InfoField
              label={t("detail.specialization")}
              value={agentRegistrationDetail?.data.businessInfo.specialization.map((item) => {
                return (
                  <>
                    <Tag color={"blue"}>{item}</Tag>{" "}
                  </>
                );
              })}
            />
            <InfoField
              label={t("detail.yearsOfExperience")}
              value={<>{agentRegistrationDetail?.data.businessInfo.yearsOfExperience} {t("detail.years")}</>}
            />
            <InfoField
              label={t("detail.certificateNumber")}
              value={agentRegistrationDetail?.data.businessInfo.certificateNumber}
            />
            <InfoField
              label={t("detail.certificate")}
              value={
                agentRegistrationDetail?.data?.imageInfo?.certificateImage ? (
                  <>
                    {agentRegistrationDetail?.data?.imageInfo?.certificateImage.map((image) => {
                      return (
                        <Image
                          width={200}
                          src={resolveDocumentImageUrl(image)}
                          alt="Certificate"
                        />
                      );
                    })}
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
              value={agentRegistrationDetail?.data.basicInfo.identityInfo.IDNumber}
            />
            <InfoField
              label={t("detail.fullName")}
              value={agentRegistrationDetail?.data.basicInfo.identityInfo.fullName}
            />
            <InfoField
              label={t("detail.gender")}
              value={
                agentRegistrationDetail?.data.basicInfo.identityInfo.gender === "Nam"
                  ? t("detail.male")
                  : t("detail.female")
              }
            />
            <InfoField
              label={t("detail.dateOfBirth")}
              value={agentRegistrationDetail?.data.basicInfo.identityInfo.dateOfBirth}
            />
            <InfoField
              label={t("detail.placeOfBirth")}
              value={agentRegistrationDetail?.data.basicInfo.identityInfo.placeOfBirth}
            />
            <InfoField
              label={t("detail.nationality")}
              value={agentRegistrationDetail?.data.basicInfo.identityInfo.nationality}
            />
            <InfoField
              label={t("detail.identityFront")}
              value={
                agentRegistrationDetail?.data?.imageInfo?.identityFront ? (
                  <Image
                    width={200}
                    src={resolveDocumentImageUrl(
                      agentRegistrationDetail.data.imageInfo.identityFront,
                    )}
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
                agentRegistrationDetail?.data?.imageInfo?.identityBack ? (
                  <Image
                    width={200}
                    src={resolveDocumentImageUrl(
                      agentRegistrationDetail.data.imageInfo.identityBack,
                    )}
                    alt="Identity Front"
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

export default AgentRegistrationDetail;
