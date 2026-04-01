import "./models.d.ts";
import { useGetUpgradeSummary, useGetUpgradeTransactions } from "./services/query";
import FullTable from "@/components/FullTable";
import { useDateTimeFormatter } from "@shared/hooks/useDateTimeFormatter";
import { formatPropertyPrice } from "@shared/utils/propertyPrice";
import { Alert, Card, Col, Row, Statistic, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CreditCard, ReceiptText, ShieldCheck, Users } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const { Paragraph, Title, Text } = Typography;

const Payments = () => {
  const { t, i18n } = useTranslation(["payments", "translation"]);
  const { formatDateTime } = useDateTimeFormatter();
  const summaryQuery = useGetUpgradeSummary();
  const formatRevenueValue = (value?: number) =>
    new Intl.NumberFormat(i18n.language?.startsWith("en") ? "en-US" : "vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const columns: ColumnsType<IPaymentService.UpgradeTransaction> = [
    {
      title: t("payments:columns.buyer"),
      key: "buyer",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">
            {record.user?.fullName || t("common.unknown")}
          </span>
          <span className="text-xs text-slate-500">
            {record.user?.email || t("common.notAvailable")}
          </span>
        </div>
      ),
    },
    {
      title: t("payments:columns.phone"),
      dataIndex: ["user", "phone"],
      key: "user.phone",
      render: (value) => value || t("common.notAvailable"),
    },
    {
      title: t("payments:columns.amount"),
      dataIndex: "amount",
      key: "amount",
      sorter: true,
      render: (value: number) => formatPropertyPrice(value, "VND", "VND"),
    },
    {
      title: t("payments:columns.duration"),
      dataIndex: "planDurationMonths",
      key: "planDurationMonths",
      render: (value: number) =>
        t(`payments:durations.${value}`, {
          count: value,
          defaultValue: t("payments:durations.fallback", { count: value }),
        }),
    },
    {
      title: t("payments:columns.status"),
      dataIndex: "status",
      key: "status",
      render: (value: IPaymentService.UpgradeTransaction["status"]) => {
        const colorMap: Record<IPaymentService.UpgradeTransaction["status"], string> = {
          SUCCESS: "green",
          PENDING: "gold",
          FAILED: "red",
          CANCELLED: "default",
        };

        return <Tag color={colorMap[value]}>{t(`payments:status.${value}`)}</Tag>;
      },
    },
    {
      title: t("payments:columns.transactionRef"),
      dataIndex: "transactionRef",
      key: "transactionRef",
    },
    {
      title: t("payments:columns.purchasedAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: t("payments:columns.planEndDate"),
      key: "planEndDate",
      render: (_, record) => {
        const endDate = record.planEndDate || record.agent?.currentPlanEndDate;
        return endDate ? formatDateTime(endDate) : t("common.notAvailable");
      },
    },
  ];

  const summaryCards = useMemo(
    () => [
      {
        key: "revenue",
        title: t("payments:summary.totalRevenue.title"),
        value: formatRevenueValue(summaryQuery.data?.data.totalRevenue),
        description: t("payments:summary.totalRevenue.description"),
        icon: <CreditCard className="h-5 w-5 text-emerald-600" />,
      },
      {
        key: "purchases",
        title: t("payments:summary.totalPurchases.title"),
        value: summaryQuery.data?.data.totalPurchases || 0,
        description: t("payments:summary.totalPurchases.description"),
        icon: <ReceiptText className="h-5 w-5 text-sky-600" />,
      },
      {
        key: "buyers",
        title: t("payments:summary.totalBuyers.title"),
        value: summaryQuery.data?.data.totalBuyers || 0,
        description: t("payments:summary.totalBuyers.description"),
        icon: <Users className="h-5 w-5 text-violet-600" />,
      },
      {
        key: "activeProAgents",
        title: t("payments:summary.activeProAgents.title"),
        value: summaryQuery.data?.data.activeProAgents || 0,
        description: t("payments:summary.activeProAgents.description"),
        icon: <ShieldCheck className="h-5 w-5 text-amber-600" />,
      },
    ],
    [formatRevenueValue, summaryQuery.data?.data, t],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Title level={3} className="mb-2!">
          {t("payments:title")}
        </Title>
        <Paragraph className="mb-0 text-slate-500">
          {t("payments:description")}
        </Paragraph>
      </div>

      {summaryQuery.isError ? (
        <Alert
          showIcon
          type="warning"
          message={t("payments:errors.summary.title")}
          description={t("payments:errors.summary.description")}
        />
      ) : null}

      <Row gutter={[16, 16]}>
        {summaryCards.map((item) => (
          <Col key={item.key} xs={24} sm={12} xl={6}>
            <Card className="h-full rounded-3xl border-0 shadow-sm" bodyStyle={{ padding: 24 }}>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                {item.icon}
              </div>
              <Statistic title={item.title} value={item.value} valueStyle={{ fontSize: 28 }} />
              <Text className="mt-3 block text-sm leading-6 text-slate-500">
                {item.description}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <FullTable<IPaymentService.UpgradeTransaction>
        columns={columns}
        useGetList={useGetUpgradeTransactions}
        disableAction
        isExport={false}
        isAdd={false}
        filter={[
          {
            name: "status",
            type: "select",
            placeholder: t("payments:filters.status"),
            options: [
              { label: t("payments:status.SUCCESS"), value: "SUCCESS" },
              { label: t("payments:status.PENDING"), value: "PENDING" },
              { label: t("payments:status.FAILED"), value: "FAILED" },
              { label: t("payments:status.CANCELLED"), value: "CANCELLED" },
            ],
          },
          {
            name: "planDurationMonths",
            type: "select",
            placeholder: t("payments:filters.duration"),
            options: [
              { label: t("payments:durations.1"), value: 1 },
              { label: t("payments:durations.12"), value: 12 },
            ],
          },
        ]}
        search={{
          placeholder: t("payments:searchPlaceholder"),
        }}
      />
    </div>
  );
};

export default Payments;
