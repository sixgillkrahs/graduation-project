import { Col, Row, Typography } from "antd";
import { memo, type ReactNode } from "react";

const { Text } = Typography;

type InfoFieldProps = {
  label: ReactNode;
  value?: ReactNode;
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

export default memo(InfoField);
