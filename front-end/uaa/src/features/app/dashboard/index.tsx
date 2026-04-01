import { useDateTimeFormatter } from "@shared/hooks/useDateTimeFormatter";
import { Alert, Button, Card, Empty, Progress, Statistic, Tag, Typography } from "antd";
import {
  ArrowRight,
  BellRing,
  Building2,
  CheckCircle2,
  LockKeyhole,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useGetUpgradeSummary } from "../payments/services/query";
import { useGetAgents, useGetUnlockRequests } from "../agents/agent-manage/services/query";
import { useGetAgentsRegistrations } from "../agents/agent-registration/services/query";
import { useGetJobs } from "../jobs/services/query";
import {
  useGetPropertiesPending,
  useGetPropertiesPublished,
  useGetPropertiesRejected,
} from "../properties/services/query";
import { useGetReportInbox } from "../reviews/report-inbox/services/query";
import { useGetReviewModerationQueue } from "../reviews/review-moderation/services/query";

const { Paragraph, Text, Title } = Typography;

const COUNT_PARAMS = { page: 1, limit: 1 } as const;
const SNAPSHOT_PARAMS = { page: 1, limit: 5 } as const;

type MetricTone = "brand" | "warning" | "danger" | "success";

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  route: string;
  tone: MetricTone;
};

const metricToneStyles: Record<
  MetricTone,
  {
    card: string;
    icon: string;
    tag: string;
  }
> = {
  brand: {
    card: "from-sky-50 via-white to-cyan-50",
    icon: "bg-sky-100 text-sky-700",
    tag: "bg-sky-100 text-sky-700 border-sky-200",
  },
  warning: {
    card: "from-amber-50 via-white to-orange-50",
    icon: "bg-amber-100 text-amber-700",
    tag: "bg-amber-100 text-amber-700 border-amber-200",
  },
  danger: {
    card: "from-rose-50 via-white to-red-50",
    icon: "bg-rose-100 text-rose-700",
    tag: "bg-rose-100 text-rose-700 border-rose-200",
  },
  success: {
    card: "from-emerald-50 via-white to-green-50",
    icon: "bg-emerald-100 text-emerald-700",
    tag: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

type MetricCardProps = {
  title: string;
  value: React.ReactNode;
  description: string;
  tone: MetricTone;
  icon: React.ReactNode;
  footer?: string;
  onClick?: () => void;
};

const MetricCard = ({
  title,
  value,
  description,
  tone,
  icon,
  footer,
  onClick,
}: MetricCardProps) => {
  const styles = metricToneStyles[tone];

  return (
    <Card
      hoverable={!!onClick}
      className={`rounded-[28px] border-0 bg-gradient-to-br ${styles.card} shadow-sm`}
      bodyStyle={{ padding: 24 }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.icon}`}>
          {icon}
        </div>
        {footer ? (
          <Tag className={`m-0 rounded-full border px-3 py-1 text-xs font-semibold ${styles.tag}`}>
            {footer}
          </Tag>
        ) : null}
      </div>

      <div className="mt-6">
        <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </Text>
        <div className="mt-2 text-4xl font-bold leading-none text-slate-950">{value}</div>
        <Paragraph className="mb-0 mt-3 text-sm leading-6 text-slate-500">
          {description}
        </Paragraph>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const { t, i18n } = useTranslation("dashboard");
  const { formatDateTime } = useDateTimeFormatter();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeAgentsQuery = useGetAgents(COUNT_PARAMS);
  const pendingRegistrationsQuery = useGetAgentsRegistrations({
    ...SNAPSHOT_PARAMS,
    status: "PENDING",
  });
  const unlockRequestsQuery = useGetUnlockRequests(SNAPSHOT_PARAMS);
  const pendingPropertiesQuery = useGetPropertiesPending(SNAPSHOT_PARAMS);
  const publishedPropertiesQuery = useGetPropertiesPublished(COUNT_PARAMS);
  const rejectedPropertiesQuery = useGetPropertiesRejected(COUNT_PARAMS);
  const reviewQueueQuery = useGetReviewModerationQueue(SNAPSHOT_PARAMS);
  const reportInboxQuery = useGetReportInbox(SNAPSHOT_PARAMS);
  const failedJobsQuery = useGetJobs({ ...SNAPSHOT_PARAMS, status: "FAILED" });
  const processingJobsQuery = useGetJobs({ ...COUNT_PARAMS, status: "PROCESSING" });
  const paymentSummaryQuery = useGetUpgradeSummary();

  const refreshAll = async () => {
    setIsRefreshing(true);

    await Promise.allSettled([
      activeAgentsQuery.refetch(),
      pendingRegistrationsQuery.refetch(),
      unlockRequestsQuery.refetch(),
      pendingPropertiesQuery.refetch(),
      publishedPropertiesQuery.refetch(),
      rejectedPropertiesQuery.refetch(),
      reviewQueueQuery.refetch(),
      reportInboxQuery.refetch(),
      failedJobsQuery.refetch(),
      processingJobsQuery.refetch(),
      paymentSummaryQuery.refetch(),
    ]);

    setIsRefreshing(false);
  };

  const activeAgents = activeAgentsQuery.data?.data.totalResults || 0;
  const pendingRegistrations = pendingRegistrationsQuery.data?.data.totalResults || 0;
  const unlockRequests = unlockRequestsQuery.data?.data.totalResults || 0;
  const pendingProperties = pendingPropertiesQuery.data?.data.totalResults || 0;
  const publishedProperties = publishedPropertiesQuery.data?.data.totalResults || 0;
  const rejectedProperties = rejectedPropertiesQuery.data?.data.totalResults || 0;
  const reviewQueue = reviewQueueQuery.data?.data.totalResults || 0;
  const unreadReports = reportInboxQuery.data?.data.totalUnread || 0;
  const failedJobs = failedJobsQuery.data?.data.totalResults || 0;
  const processingJobs = processingJobsQuery.data?.data.totalResults || 0;
  const proRevenue = paymentSummaryQuery.data?.data.totalRevenue || 0;
  const proPurchases = paymentSummaryQuery.data?.data.totalPurchases || 0;
  const formatRevenueValue = (value?: number) =>
    new Intl.NumberFormat(i18n.language?.startsWith("en") ? "en-US" : "vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  const proRevenueValue = paymentSummaryQuery.isLoading
    ? "..."
    : formatRevenueValue(proRevenue);

  const workloadCount =
    pendingRegistrations + unlockRequests + pendingProperties + reviewQueue + unreadReports + failedJobs;

  const publishingBase = publishedProperties + pendingProperties + rejectedProperties;
  const publishingHealth = publishingBase > 0 ? Math.round((publishedProperties / publishingBase) * 100) : 0;

  const metrics = useMemo(
    () => [
      {
        key: "activeAgents",
        title: t("stats.activeAgents.title"),
        value: activeAgents,
        description: t("stats.activeAgents.description"),
        tone: "success" as const,
        icon: <Users className="h-5 w-5" />,
        route: "/agents/manage",
      },
      {
        key: "proRevenue",
        title: t("stats.proRevenue.title"),
        value: proRevenueValue,
        description: t("stats.proRevenue.description"),
        tone: "brand" as const,
        icon: <Wallet className="h-5 w-5" />,
        route: "/payments/pro-purchases",
        footer: t("stats.proRevenue.footer", { count: proPurchases }),
      },
      {
        key: "pendingRegistrations",
        title: t("stats.pendingRegistrations.title"),
        value: pendingRegistrations,
        description: t("stats.pendingRegistrations.description"),
        tone: pendingRegistrations > 0 ? ("warning" as const) : ("success" as const),
        icon: <UserPlus className="h-5 w-5" />,
        route: "/agents/registration",
      },
      {
        key: "unlockRequests",
        title: t("stats.unlockRequests.title"),
        value: unlockRequests,
        description: t("stats.unlockRequests.description"),
        tone: unlockRequests > 0 ? ("warning" as const) : ("success" as const),
        icon: <LockKeyhole className="h-5 w-5" />,
        route: "/agents/unlock-requests",
      },
      {
        key: "pendingProperties",
        title: t("stats.pendingProperties.title"),
        value: pendingProperties,
        description: t("stats.pendingProperties.description"),
        tone: pendingProperties > 0 ? ("warning" as const) : ("success" as const),
        icon: <Building2 className="h-5 w-5" />,
        route: "/properties/pending",
      },
      {
        key: "reviewQueue",
        title: t("stats.reviewQueue.title"),
        value: reviewQueue,
        description: t("stats.reviewQueue.description"),
        tone: reviewQueue > 0 ? ("warning" as const) : ("success" as const),
        icon: <ShieldAlert className="h-5 w-5" />,
        route: "/reviews/moderation",
      },
      {
        key: "unreadReports",
        title: t("stats.unreadReports.title"),
        value: unreadReports,
        description: t("stats.unreadReports.description"),
        tone: unreadReports > 0 ? ("danger" as const) : ("success" as const),
        icon: <BellRing className="h-5 w-5" />,
        route: "/reviews/reports",
      },
      {
        key: "failedJobs",
        title: t("stats.failedJobs.title"),
        value: failedJobs,
        description: t("stats.failedJobs.description"),
        tone: failedJobs > 0 ? ("danger" as const) : ("success" as const),
        icon: <Workflow className="h-5 w-5" />,
        route: "/jobs",
        footer: processingJobs > 0 ? t("stats.failedJobs.footer", { count: processingJobs }) : undefined,
      },
      {
        key: "publishedProperties",
        title: t("stats.publishedProperties.title"),
        value: publishedProperties,
        description: t("stats.publishedProperties.description"),
        tone: "brand" as const,
        icon: <CheckCircle2 className="h-5 w-5" />,
        route: "/properties/published",
      },
    ],
    [
      activeAgents,
      failedJobs,
      pendingProperties,
      pendingRegistrations,
      processingJobs,
      proPurchases,
      proRevenueValue,
      publishedProperties,
      reviewQueue,
      t,
      unreadReports,
      unlockRequests,
    ],
  );

  const attentionQueues = useMemo(
    () => [
      {
        key: "registrations",
        title: t("queues.registrations.title"),
        description: t("queues.registrations.description"),
        count: pendingRegistrations,
        route: "/agents/registration",
        tone: pendingRegistrations > 0 ? ("warning" as const) : ("success" as const),
      },
      {
        key: "properties",
        title: t("queues.properties.title"),
        description: t("queues.properties.description"),
        count: pendingProperties,
        route: "/properties/pending",
        tone: pendingProperties > 0 ? ("warning" as const) : ("success" as const),
      },
      {
        key: "reports",
        title: t("queues.reports.title"),
        description: t("queues.reports.description"),
        count: unreadReports,
        route: "/reviews/reports",
        tone: unreadReports > 0 ? ("danger" as const) : ("success" as const),
      },
      {
        key: "jobs",
        title: t("queues.jobs.title"),
        description: t("queues.jobs.description"),
        count: failedJobs,
        route: "/jobs",
        tone: failedJobs > 0 ? ("danger" as const) : ("success" as const),
      },
    ],
    [failedJobs, pendingProperties, pendingRegistrations, t, unreadReports],
  );

  const quickActions = useMemo(
    () => [
      {
        key: "registrations",
        title: t("quickActions.registrations.title"),
        description: t("quickActions.registrations.description"),
        route: "/agents/registration",
        icon: <UserPlus className="h-5 w-5" />,
      },
      {
        key: "unlockRequests",
        title: t("quickActions.unlockRequests.title"),
        description: t("quickActions.unlockRequests.description"),
        route: "/agents/unlock-requests",
        icon: <LockKeyhole className="h-5 w-5" />,
      },
      {
        key: "pendingProperties",
        title: t("quickActions.pendingProperties.title"),
        description: t("quickActions.pendingProperties.description"),
        route: "/properties/pending",
        icon: <Building2 className="h-5 w-5" />,
      },
      {
        key: "reviews",
        title: t("quickActions.reviews.title"),
        description: t("quickActions.reviews.description"),
        route: "/reviews/moderation",
        icon: <ShieldAlert className="h-5 w-5" />,
      },
      {
        key: "reports",
        title: t("quickActions.reports.title"),
        description: t("quickActions.reports.description"),
        route: "/reviews/reports",
        icon: <BellRing className="h-5 w-5" />,
      },
      {
        key: "jobs",
        title: t("quickActions.jobs.title"),
        description: t("quickActions.jobs.description"),
        route: "/jobs",
        icon: <Workflow className="h-5 w-5" />,
      },
    ],
    [t],
  );

  const activityItems = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    for (const registration of pendingRegistrationsQuery.data?.data.results || []) {
      items.push({
        id: `registration-${registration.id}`,
        title: t("activity.types.registration"),
        description: t("activity.descriptions.registration", {
          name: registration.basicInfo?.nameRegister || "--",
          email: registration.basicInfo?.email || "--",
        }),
        timestamp: registration.createdAt,
        route: `/agents/registration/${registration.id}`,
        tone: "warning",
      });
    }

    for (const unlockRequest of unlockRequestsQuery.data?.data.results || []) {
      items.push({
        id: `unlock-${unlockRequest.id}`,
        title: t("activity.types.unlock"),
        description: t("activity.descriptions.unlock", {
          name: unlockRequest.fullName || "--",
          email: unlockRequest.email || "--",
        }),
        timestamp: unlockRequest.requestedAt,
        route: `/agents/manage/${unlockRequest.registrationId}`,
        tone: "warning",
      });
    }

    for (const property of pendingPropertiesQuery.data?.data.results || []) {
      items.push({
        id: `property-${property.id}`,
        title: t("activity.types.property"),
        description: t("activity.descriptions.property", {
          title: property.projectName || property.id,
          province: property.location?.province || "--",
        }),
        timestamp: property.createdAt,
        route: `/properties/pending/${property.id}`,
        tone: "brand",
      });
    }

    for (const notice of reportInboxQuery.data?.data.results || []) {
      items.push({
        id: `report-${notice.id}`,
        title: t("activity.types.report"),
        description: t("activity.descriptions.report", {
          title: notice.title,
        }),
        timestamp: notice.createdAt || notice.updatedAt,
        route: "/reviews/reports",
        tone: notice.isRead ? "brand" : "danger",
      });
    }

    for (const review of reviewQueueQuery.data?.data.results || []) {
      items.push({
        id: `review-${review.id}`,
        title: t("activity.types.review"),
        description: t("activity.descriptions.review", {
          customer: review.customerName,
          property: review.propertyName,
        }),
        timestamp: review.createdAt,
        route: "/reviews/moderation",
        tone: "warning",
      });
    }

    for (const job of failedJobsQuery.data?.data.results || []) {
      items.push({
        id: `job-${job.id}`,
        title: t("activity.types.job"),
        description: t("activity.descriptions.job", {
          type: job.type,
          error: job.error || t("activity.labels.genericError"),
        }),
        timestamp: job.updatedAt || job.createdAt,
        route: "/jobs",
        tone: "danger",
      });
    }

    return items
      .filter((item) => item.timestamp)
      .sort((left, right) => new Date(right.timestamp || 0).getTime() - new Date(left.timestamp || 0).getTime())
      .slice(0, 8);
  }, [
    failedJobsQuery.data?.data.results,
    pendingPropertiesQuery.data?.data.results,
    pendingRegistrationsQuery.data?.data.results,
    reportInboxQuery.data?.data.results,
    reviewQueueQuery.data?.data.results,
    t,
    unlockRequestsQuery.data?.data.results,
  ]);

  const hasPartialError = [
    activeAgentsQuery,
    pendingRegistrationsQuery,
    unlockRequestsQuery,
    pendingPropertiesQuery,
    publishedPropertiesQuery,
    rejectedPropertiesQuery,
    reviewQueueQuery,
    reportInboxQuery,
    failedJobsQuery,
    processingJobsQuery,
    paymentSummaryQuery,
  ].some((query) => query.isError);

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-7 text-white shadow-sm">
        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </div>
            <Title level={2} className="mb-3 !text-white">
              {t("hero.title")}
            </Title>
            <Paragraph className="mb-0 !text-base leading-7 !text-slate-300">
              {t("hero.description")}
            </Paragraph>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="large"
              icon={<RefreshCcw className="h-4 w-4" />}
              loading={isRefreshing}
              onClick={refreshAll}
            >
              {t("actions.refresh")}
            </Button>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
            <Text className="text-xs font-semibold uppercase tracking-[0.18em] !text-slate-300">
              {t("hero.workload.title")}
            </Text>
            <div className="mt-2 text-4xl font-bold">{workloadCount}</div>
            <Paragraph className="mb-0 mt-3 !text-sm leading-6 !text-slate-300">
              {t("hero.workload.description")}
            </Paragraph>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text className="text-xs font-semibold uppercase tracking-[0.18em] !text-slate-300">
                  {t("hero.publishHealth.title")}
                </Text>
                <div className="mt-2 text-4xl font-bold">{publishingHealth}%</div>
              </div>
              <CheckCircle2 className="h-10 w-10 text-emerald-300" />
            </div>
            <Progress
              percent={publishingHealth}
              showInfo={false}
              strokeColor="#4ade80"
              trailColor="rgba(255,255,255,0.12)"
              className="mt-4 mb-2"
            />
            <Text className="!text-sm !text-slate-300">
              {t("hero.publishHealth.description", {
                published: publishedProperties,
                total: publishingBase,
              })}
            </Text>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="text-xs font-semibold uppercase tracking-[0.18em] !text-slate-300">
                  {t("hero.processingJobs.title")}
                </Text>
                <div className="mt-2 text-3xl font-bold">{processingJobs}</div>
                <Text className="!text-sm !text-slate-300">{t("hero.processingJobs.description")}</Text>
              </div>
              <div>
                <Text className="text-xs font-semibold uppercase tracking-[0.18em] !text-slate-300">
                  {t("hero.unreadReports.title")}
                </Text>
                <div className="mt-2 text-3xl font-bold">{unreadReports}</div>
                <Text className="!text-sm !text-slate-300">{t("hero.unreadReports.description")}</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasPartialError ? (
        <Alert
          showIcon
          type="warning"
          message={t("errors.partialData.title")}
          description={t("errors.partialData.description")}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.key}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            tone={metric.tone}
            icon={metric.icon}
            footer={metric.footer}
            onClick={() => navigate(metric.route)}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[28px] border-0 shadow-sm" bodyStyle={{ padding: 28 }}>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Title level={4} className="mb-1!">
                {t("sections.activity.title")}
              </Title>
              <Paragraph className="mb-0 !text-slate-500">
                {t("sections.activity.description")}
              </Paragraph>
            </div>
            <Button type="text" onClick={() => navigate("/reviews/reports")}>
              {t("actions.open")}
            </Button>
          </div>

          {activityItems.length === 0 ? (
            <Empty description={t("activity.empty")} />
          ) : (
            <div className="space-y-3">
              {activityItems.map((item) => {
                const styles = metricToneStyles[item.tone];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.route)}
                    className="flex w-full items-start gap-4 rounded-2xl border border-slate-100 px-4 py-4 text-left transition-colors hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full ${styles.icon}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="mt-1 text-sm text-slate-500">{item.description}</div>
                        </div>
                        <div className="shrink-0 text-xs text-slate-400">
                          {formatDateTime(item.timestamp)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="rounded-[28px] border-0 shadow-sm" bodyStyle={{ padding: 28 }}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <Title level={4} className="mb-1!">
                  {t("sections.queues.title")}
                </Title>
                <Paragraph className="mb-0 !text-slate-500">
                  {t("sections.queues.description")}
                </Paragraph>
              </div>
            </div>

            <div className="space-y-4">
              {attentionQueues.map((queue) => {
                const styles = metricToneStyles[queue.tone];
                const statusLabel =
                  queue.count === 0 ? t("queueStatus.clear") : queue.count > 5 ? t("queueStatus.critical") : t("queueStatus.watch");

                return (
                  <div
                    key={queue.key}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-900">{queue.title}</div>
                        <div className="mt-1 text-sm text-slate-500">{queue.description}</div>
                      </div>
                      <Tag className={`m-0 rounded-full border px-3 py-1 text-xs font-semibold ${styles.tag}`}>
                        {statusLabel}
                      </Tag>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <Statistic value={queue.count} valueStyle={{ fontSize: 28, lineHeight: 1.1 }} />
                      <Button type="link" className="px-0" onClick={() => navigate(queue.route)}>
                        {t("actions.open")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="rounded-[28px] border-0 shadow-sm" bodyStyle={{ padding: 28 }}>
            <div className="mb-6">
              <Title level={4} className="mb-1!">
                {t("sections.quickActions.title")}
              </Title>
              <Paragraph className="mb-0 !text-slate-500">
                {t("sections.quickActions.description")}
              </Paragraph>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {quickActions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => navigate(action.route)}
                  className="group rounded-2xl border border-slate-100 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-slate-50"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                    {action.icon}
                  </div>
                  <div className="font-semibold text-slate-900">{action.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">{action.description}</div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    {t("actions.open")}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
