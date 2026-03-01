import { useApproveProperty, useRejectProperty } from "../../services/mutate";
import { useGetPropertyDetail } from "../../services/query";
import ApprovePropertyModal from "./components/ApprovePropertyModal";
import RejectPropertyModal from "./components/RejectPropertyModal";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Image,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { LIST_PROVINCE, LIST_WARD, findOptionLabel } from "gra-helper";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Home,
  Mail,
  MapPin,
  Maximize,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate: approveProperty, isPending: isApproving } = useApproveProperty();
  const { mutate: rejectProperty, isPending: isRejecting } = useRejectProperty();
  const { t } = useTranslation();
  const { data: propertyResp, isLoading } = useGetPropertyDetail(id || "");

  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);

  const property = propertyResp?.data;

  const handleUpdateStatus = (status: "PUBLISHED" | "REJECTED") => {
    if (!id) return;
    if (status === "PUBLISHED") {
      setIsApproveModalVisible(true);
    } else {
      setIsRejectModalVisible(true);
    }
  };

  const closeApproveModal = useCallback(() => setIsApproveModalVisible(false), []);
  const closeRejectModal = useCallback(() => setIsRejectModalVisible(false), []);

  const handleConfirmApprove = useCallback(
    (note: string) => {
      if (!id) return;

      approveProperty(
        { id, note },
        {
          onSuccess: () => {
            message.success(t("message.updateSuccess"));
            setIsApproveModalVisible(false);
            navigate(-1);
          },
          onError: () => {
            message.error(t("message.updateError"));
          },
        },
      );
    },
    [id, approveProperty, t, navigate],
  );

  const handleConfirmReject = useCallback(
    (reason: string) => {
      if (!id) return;

      rejectProperty(
        { id, reason },
        {
          onSuccess: () => {
            message.success(t("message.updateSuccess"));
            setIsRejectModalVisible(false);
            navigate(-1);
          },
          onError: () => {
            message.error(t("message.updateError"));
          },
        },
      );
    },
    [id, rejectProperty, t, navigate],
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!property) {
    return <div>{t("message.notFound")}</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "PUBLISHED":
        return "green";
      case "REJECTED":
        return "red";
      case "SOLD":
        return "blue";
      case "EXPIRED":
        return "gray";
      default:
        return "default";
    }
  };

  const formatPrice = (price: number, unit: string) => {
    // Basic formatting, can be improved based on unit logic
    return `${price} ${unit}`;
  };

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-between">
        <Space>
          <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            {t("button.close")}
          </Button>
          {/* <Title level={3} style={{ margin: 0 }}>
            {property.projectName || t("properties.propertyDetail")}
          </Title> */}
          <Tag color={getStatusColor(property.status)} className="ml-2">
            {property.status}
          </Tag>
        </Space>
        {property.status === "PENDING" && (
          <Space>
            <Button
              danger
              icon={<XCircle size={16} />}
              onClick={() => handleUpdateStatus("REJECTED")}
              loading={isRejecting}
            >
              {t("button.reject")}
            </Button>
            <Button
              type="primary"
              icon={<CheckCircle size={16} />}
              onClick={() => handleUpdateStatus("PUBLISHED")}
              loading={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {t("button.approve")}
            </Button>
          </Space>
        )}
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column: Images & Key Info */}
        <Col span={24} lg={16} className="space-y-6!">
          <Card className="mb-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              {/* Main Image */}
              <div className="col-span-2">
                <Image
                  src={property?.media?.thumbnail || property?.media?.images[0]}
                  alt="Property Thumbnail"
                  className="h-[400px] w-full rounded-lg object-cover"
                  fallback="https://placehold.co/600x400?text=No+Image"
                />
              </div>
              {/* Gallery */}
              {property?.media?.images.slice(0, 4).map((img, index) => (
                <div key={index} className="col-span-1">
                  <Image
                    src={img}
                    alt={`Property ${index}`}
                    className="h-[200px] w-full rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Chùm ảnh 360 độ (Virtual Tour)" className="mb-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {property?.media?.virtualTourUrls && property.media.virtualTourUrls.length > 0 ? (
                property.media.virtualTourUrls.map((url: string, index: number) => (
                  <div
                    key={index}
                    className="flex h-[350px] w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm"
                  >
                    <ReactPhotoSphereViewer
                      src={url}
                      height="100%"
                      width="100%"
                      littlePlanet={false}
                      container={`viewer-${index}`}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-1 flex h-[200px] items-center justify-center rounded-lg bg-gray-100 text-center text-gray-500 md:col-span-2">
                  <p>Không có dữ liệu 360 độ cho bất động sản này.</p>
                </div>
              )}
            </div>
          </Card>

          <Card title={t("properties.description")} className="mb-6 shadow-sm">
            <Paragraph>{property?.description}</Paragraph>
          </Card>

          <Card title={t("properties.features")} className="shadow-sm">
            <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}>
              <Descriptions.Item label={t("properties.propertyType")}>
                {property.propertyType}
              </Descriptions.Item>
              <Descriptions.Item label={t("properties.demandType")}>
                {property.demandType === "SALE" ? (
                  <Tag color="green">{t("common.sale")}</Tag>
                ) : (
                  <Tag color="orange">{t("common.rent")}</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t("properties.area")}>
                {property?.features?.area} m²
              </Descriptions.Item>
              <Descriptions.Item label={t("properties.bedrooms")}>
                {property?.features?.bedrooms || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label={t("properties.bathrooms")}>
                {property?.features?.bathrooms || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label={t("properties.direction")}>
                {property?.features?.direction || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label={t("properties.furniture")}>
                {property?.features?.furniture || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label={t("properties.legalStatus")}>
                {property?.features?.legalStatus || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Right Column: Overview, Location, Contact */}
        <Col span={24} lg={8} className="space-y-6!">
          <Card className="mb-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Text type="secondary">{t("properties.price")}</Text>
                <Title level={4} style={{ margin: 0, color: "#faad14" }}>
                  {formatPrice(property?.features?.price, property?.features?.priceUnit)}
                </Title>
              </div>
              <Divider className="my-2" />
              <div className="flex items-center gap-2">
                <Maximize className="text-gray-400" size={20} />
                <Text>{property?.features?.area} m²</Text>
              </div>
              <div className="flex items-center gap-2">
                <Home className="text-gray-400" size={20} />
                <Text>{property?.propertyType}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-400" size={20} />
                <Text>{new Date(property?.createdAt).toLocaleDateString()}</Text>
              </div>
            </div>
          </Card>

          <Card title={t("properties.location")} className="mb-6 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-1 text-red-500" size={20} />
                <Text>
                  {property?.location?.address},{" "}
                  {findOptionLabel(property?.location?.ward, LIST_WARD)},{" "}
                  {findOptionLabel(property?.location?.province, LIST_PROVINCE)}
                </Text>
              </div>
              {/* Add Map Placeholder if needed */}
            </div>
          </Card>

          <Card title={t("properties.poster")} className="shadow-sm">
            <div className="mb-4 flex flex-col items-center">
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <User size={32} className="text-blue-500" />
              </div>
              <Title level={5}>{property?.userId?.fullName || "Unknown"}</Title>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <Text>{property?.userId?.fullName || "Unknown"}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <Text>{property?.userId?.phone || "N/A"}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <Text>{property?.userId?.email || "N/A"}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <ApprovePropertyModal
        isOpen={isApproveModalVisible}
        onClose={closeApproveModal}
        onConfirm={handleConfirmApprove}
        isApproving={isApproving}
      />

      <RejectPropertyModal
        isOpen={isRejectModalVisible}
        onClose={closeRejectModal}
        onConfirm={handleConfirmReject}
        isRejecting={isRejecting}
      />
    </div>
  );
};

export default PropertyDetail;
