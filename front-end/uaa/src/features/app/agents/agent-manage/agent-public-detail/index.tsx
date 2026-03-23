import AgentRegistrationService from "../../agent-registration/services/service";
import { useGetAgentPublicProfile } from "../services/query";
import { ArrowLeftOutlined, CheckCircleFilled } from "@ant-design/icons";
import { renderConstant } from "@shared/render/const";
import { toVietnamTime } from "@shared/render/time";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { Building2, Eye, Mail, MapPin, Phone, Star, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const { Text, Title, Paragraph } = Typography;

interface InfoFieldProps {
  label: React.ReactNode;
  value?: React.ReactNode;
}

const InfoField = ({ label, value }: InfoFieldProps) => {
  const isReactNode = typeof value === "object" && value !== null;

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <Text type="secondary">{label}</Text>
      {isReactNode ? value : <Text strong>{value || "-"}</Text>}
    </div>
  );
};

const AgentPublicDetail = () => {
  const { t } = useTranslation("agents");
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetAgentPublicProfile(userId || "");

  const detail = data?.data;

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
    <div className="space-y-6">
      <Card>
        <Flex justify="space-between" align="center" gap={16} wrap>
          <Space size={16} align="start">
            <Avatar
              size={72}
              src={detail.avatarUrl}
              icon={!detail.avatarUrl ? <UserRound size={28} /> : undefined}
            />
            <div>
              <Flex align="center" gap={8} wrap>
                <Title level={3} style={{ margin: 0 }}>
                  {detail.fullName}
                </Title>
                {detail.verified ? (
                  <Tag color="green" className="rounded-full">
                    <CheckCircleFilled /> {t("public.verified")}
                  </Tag>
                ) : null}
                {detail.isPro ? (
                  <Tag color="gold" className="rounded-full">
                    PRO
                  </Tag>
                ) : null}
              </Flex>
              <Paragraph className="mt-2 mb-2! text-gray-600">{detail.role || "-"}</Paragraph>
              <Space size={[8, 8]} wrap>
                <Tag icon={<MapPin size={12} />} className="rounded-full px-3 py-1">
                  {detail.location || "-"}
                </Tag>
                <Tag icon={<Star size={12} />} className="rounded-full px-3 py-1">
                  {t("public.rating")}: {detail.rating ?? 0}
                </Tag>
                {detail.leaderboard?.rank ? (
                  <Tag color="blue" className="rounded-full px-3 py-1">
                    {t("public.rank", { rank: detail.leaderboard.rank })}
                  </Tag>
                ) : null}
              </Space>
            </div>
          </Space>

          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            {t("detail.back")}
          </Button>
        </Flex>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={t("public.overview")} className="mb-4">
            <Paragraph className="mb-0! whitespace-pre-line">{detail.description || "-"}</Paragraph>
          </Card>

          <Card title={t("detail.businessInfo")}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InfoField
                label={t("detail.yearsOfExperience")}
                value={
                  <>
                    {detail.yearsOfExperience || "-"} {t("detail.years")}
                  </>
                }
              />
              <InfoField label={t("public.plan")} value={detail.plan || "-"} />
              <InfoField
                label={t("detail.specialization")}
                value={
                  detail.specialties?.length ? (
                    <>
                      {detail.specialties.map((item) => (
                        <Tag key={item} color="blue" className="mb-2">
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
                  detail.workingAreas?.length ? (
                    <>
                      {detail.workingAreas.map((item) => (
                        <Tag key={item} color="geekblue" className="mb-2">
                          {renderConstant(item, AgentRegistrationService.VietNamProvide)}
                        </Tag>
                      ))}
                    </>
                  ) : (
                    "-"
                  )
                }
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={t("public.contact")} className="mb-4">
            <div className="space-y-3">
              <InfoField
                label={
                  <span className="inline-flex items-center gap-2">
                    <Mail size={14} />
                    {t("detail.email")}
                  </span>
                }
                value={detail.email}
              />
              <InfoField
                label={
                  <span className="inline-flex items-center gap-2">
                    <Phone size={14} />
                    {t("detail.phone")}
                  </span>
                }
                value={detail.phone}
              />
            </div>
          </Card>

          <Card title={t("public.stats")}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Statistic
                  title={t("public.activeSaleListings")}
                  value={detail.stats?.activeSaleListingsCount || 0}
                  prefix={<Building2 size={14} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={t("public.totalListings")}
                  value={detail.stats?.totalPublishedListingsCount || 0}
                  prefix={<UserRound size={14} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={t("public.soldListings")}
                  value={detail.stats?.soldPropertiesCount || 0}
                  prefix={<CheckCircleFilled />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={t("public.totalViews")}
                  value={detail.stats?.totalViews || 0}
                  prefix={<Eye size={14} />}
                />
              </Col>
            </Row>

            {detail.leaderboard ? (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <Text strong>{t("public.leaderboard")}</Text>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <div>{t("public.rank", { rank: detail.leaderboard.rank })}</div>
                  <div>{t("public.deals", { count: detail.leaderboard.deals })}</div>
                  <div>
                    {t("public.revenue")}: {detail.leaderboard.revenue}{" "}
                    {detail.leaderboard.currency}
                  </div>
                  <div>
                    {t("public.period", {
                      month: detail.leaderboard.month,
                      year: detail.leaderboard.year,
                    })}
                  </div>
                  {detail.leaderboard.latestSoldAt ? (
                    <div>
                      {t("public.latestSoldAt")}: {toVietnamTime(detail.leaderboard.latestSoldAt)}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AgentPublicDetail;
