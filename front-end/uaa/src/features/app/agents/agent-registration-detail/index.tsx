import { useGetAgentsRegistration } from "../services/query";
import { Button, Card, Col, Flex, Row, Space, Tag, Typography } from "antd";
import { useParams } from "react-router-dom";

const { Text } = Typography;

interface InfoFieldProps {
  label: React.ReactNode;
  value?: React.ReactNode;
}

const InfoField = ({ label, value }: InfoFieldProps) => {
  return (
    <Row gutter={[16, 4]} className="mb-2">
      <Col xs={24} sm={8} md={6} lg={5}>
        <Text>{label}:</Text>
      </Col>
      <Col xs={24} sm={16} md={18} lg={19}>
        <Text strong>{value || "-"}</Text>
      </Col>
    </Row>
  );
};

const AgentRegistrationDetail = () => {
  const { id } = useParams();
  const { data: agentRegistrationDetail } = useGetAgentsRegistration(id!);
  console.log(agentRegistrationDetail?.data);
  return (
    <Card>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Typography.Title level={3}>Agent Registration Detail</Typography.Title>
        <Space>
          <Button type="primary">Accept</Button>
          <Button>Reject</Button>
        </Space>
      </Flex>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title={"Agent Information"}>
            <InfoField label="Email" value={agentRegistrationDetail?.data.businessInfo.email} />
            <InfoField
              label="Phone"
              value={agentRegistrationDetail?.data.businessInfo.phoneNumber}
            />
            <InfoField
              label="Area"
              value={
                <div className="flex flex-wrap gap-2">
                  {agentRegistrationDetail?.data.businessInfo.area.map((item) => {
                    return (
                      <Tag key={item} color="blue">
                        {item}
                      </Tag>
                    );
                  })}
                </div>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title={"Registration Information"}>
            <InfoField
              label="Identity Number"
              value={agentRegistrationDetail?.data.identityInfo.IDNumber}
            />
            <InfoField
              label="Full Name"
              value={agentRegistrationDetail?.data.identityInfo.agentName}
            />
            <InfoField
              label="Gender"
              value={
                agentRegistrationDetail?.data.identityInfo.gender === "Nam" ? "Male" : "Female"
              }
            />
            <InfoField
              label="Date of Birth"
              value={agentRegistrationDetail?.data.identityInfo.dateOfBirth}
            />
            <InfoField label="Address" value={agentRegistrationDetail?.data.identityInfo.address} />
            <InfoField
              label="Nationality"
              value={agentRegistrationDetail?.data.identityInfo.nationality}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default AgentRegistrationDetail;
