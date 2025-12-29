import { useRejectAgentsRegistration } from "../services/mutate";
import { useGetAgentsRegistration } from "../services/query";
import AgentRegistrationService from "../services/service";
import { ArrowLeftOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import message from "@shared/message";
import { renderConstant } from "@shared/render/const";
import { toVietnamTime } from "@shared/render/time";
import { Button, Card, Col, Flex, Image, Input, Modal, Row, Space, Tag, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const { Text } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;

interface InfoFieldProps {
  label: React.ReactNode;
  value?: React.ReactNode;
}

const showRejectConfirm = (onSubmit: (reason: string) => void) => {
  let reason = "";

  confirm({
    title: "Do you want to reject this application?",
    icon: <ExclamationCircleFilled />,
    content: (
      <div>
        <p>Please provide a reason for rejection:</p>
        <TextArea
          rows={4}
          placeholder="Enter rejection reason"
          onChange={(e) => {
            reason = e.target.value;
          }}
        />
      </div>
    ),
    okText: "Reject",
    okType: "danger",
    cancelText: "Cancel",

    onOk() {
      onSubmit(reason.trim());
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: agentRegistrationDetail } = useGetAgentsRegistration(id!);
  const { mutateAsync: reject } = useRejectAgentsRegistration();

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
    });
  };

  const onAccept = () => {};

  const onBack = () => {
    navigate(-1);
  };

  return (
    <Card
      actions={[
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Back
        </Button>,
      ]}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={3}>Agent Registration Detail</Typography.Title>
        <Space>
          {agentRegistrationDetail?.data.status == AgentRegistrationService.STATUS[0].value && (
            <>
              <Button type="primary" onClick={onAccept}>
                Accept
              </Button>
              <Button danger onClick={onReject}>
                Reject
              </Button>
            </>
          )}
        </Space>
      </Flex>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            title={"Agent Information"}
            style={{
              marginBottom: 16,
            }}
          >
            <InfoField
              label="Name Register"
              value={agentRegistrationDetail?.data.basicInfo.nameRegister}
            />
            <InfoField label="Phone" value={agentRegistrationDetail?.data.basicInfo.phoneNumber} />
            <InfoField label="Email" value={agentRegistrationDetail?.data.basicInfo.email} />
            {agentRegistrationDetail?.data.status && (
              <InfoField
                label="Status"
                value={renderConstant(
                  agentRegistrationDetail?.data.status,
                  AgentRegistrationService.STATUS,
                )}
              />
            )}
            {agentRegistrationDetail?.data.status == AgentRegistrationService.STATUS[2].value && (
              <>
                <InfoField
                  label="Reject Reason"
                  value={agentRegistrationDetail?.data.reasonReject || "-"}
                />
                <InfoField
                  label="Reject Date"
                  value={toVietnamTime(agentRegistrationDetail?.data?.updatedAt)}
                />
              </>
            )}
          </Card>
          <Card title={"Business Information"}>
            <InfoField
              label="Tax Code"
              value={agentRegistrationDetail?.data.businessInfo.taxCode}
            />
            <InfoField
              label="specialization"
              value={agentRegistrationDetail?.data.businessInfo.specialization.map((item) => {
                return (
                  <>
                    <Tag color={"blue"}>{item}</Tag>{" "}
                  </>
                );
              })}
            />
            <InfoField
              label="Years Of Experience"
              value={<>{agentRegistrationDetail?.data.businessInfo.yearsOfExperience} years</>}
            />
            <InfoField
              label="Certificate Number"
              value={agentRegistrationDetail?.data.businessInfo.certificateNumber}
            />
            <InfoField
              label="Certificate"
              value={
                agentRegistrationDetail?.data?.imageInfo?.certificateImage ? (
                  <>
                    {agentRegistrationDetail?.data?.imageInfo?.certificateImage.map((image) => {
                      return (
                        <Image
                          width={200}
                          src={`${import.meta.env.VITE_BASEURL_AI}images/${image}`}
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
          <Card title={"Identity Information"}>
            <InfoField
              label="Identity Number"
              value={agentRegistrationDetail?.data.basicInfo.identityInfo.IDNumber}
            />
            <InfoField
              label="Full Name"
              value={agentRegistrationDetail?.data.basicInfo.identityInfo.fullName}
            />
            <InfoField
              label="Gender"
              value={
                agentRegistrationDetail?.data.basicInfo.identityInfo.gender === "Nam"
                  ? "Male"
                  : "Female"
              }
            />
            <InfoField
              label="Date of Birth"
              value={agentRegistrationDetail?.data.basicInfo.identityInfo.dateOfBirth}
            />
            <InfoField
              label="Place Of Birth"
              value={agentRegistrationDetail?.data.basicInfo.identityInfo.placeOfBirth}
            />
            <InfoField
              label="Nationality"
              value={agentRegistrationDetail?.data.basicInfo.identityInfo.nationality}
            />
            <InfoField
              label="Identity Front"
              value={
                agentRegistrationDetail?.data?.imageInfo?.identityFront ? (
                  <Image
                    width={200}
                    src={`${import.meta.env.VITE_BASEURL_AI}images/${agentRegistrationDetail.data.imageInfo.identityFront}`}
                    alt="Identity Front"
                  />
                ) : (
                  "-"
                )
              }
            />
            <InfoField
              label="Identity Back"
              value={
                agentRegistrationDetail?.data?.imageInfo?.identityBack ? (
                  <Image
                    width={200}
                    src={`${import.meta.env.VITE_BASEURL_AI}images/${agentRegistrationDetail.data.imageInfo.identityBack}`}
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
