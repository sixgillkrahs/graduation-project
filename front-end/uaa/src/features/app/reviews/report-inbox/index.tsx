import { useLockAgentAccount } from "../../agents/agent-manage/services/mutate";
import { useRejectProperty } from "../../properties/services/mutate";
import { useMarkReportNoticeAsRead, useResolveReport } from "./services/mutate";
import { useGetReportDetail, useGetReportInbox } from "./services/query";
import MessageService from "@shared/message";
import type { IParamsPagination } from "@shared/types/service";
import {
  Badge,
  Button,
  Card,
  Drawer,
  Empty,
  Input,
  Modal,
  Pagination,
  Radio,
  Segmented,
  Space,
  Spin,
  Statistic,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowUpRight,
  BadgeAlert,
  BellRing,
  Eye,
  Inbox,
  LockKeyhole,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShieldX,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const { Paragraph, Text, Title } = Typography;
const { Search: SearchInput, TextArea } = Input;

type StatusFilter = "ALL" | "UNREAD" | "READ";
type TargetFilter = "ALL" | IReportNoticeService.ReportTargetType;
type LockType = "TEMPORARY" | "PERMANENT";
type QuickLockPreset = "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH";

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString("vi-VN") : "--";

const compactId = (value?: string) =>
  !value ? "--" : value.length <= 14 ? value : `${value.slice(0, 6)}...${value.slice(-4)}`;

const buildPresetLockUntil = (preset: QuickLockPreset) => {
  const date = new Date();
  if (preset === "ONE_DAY") date.setDate(date.getDate() + 1);
  if (preset === "ONE_WEEK") date.setDate(date.getDate() + 7);
  if (preset === "ONE_MONTH") date.setMonth(date.getMonth() + 1);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

const ReportInbox = () => {
  const { t } = useTranslation(["reviews", "translation"]);
  const navigate = useNavigate();
  const [params, setParams] = useState<IParamsPagination>({ page: 1, limit: 10 });
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [targetFilter, setTargetFilter] = useState<TargetFilter>("ALL");
  const [activeNotice, setActiveNotice] = useState<IReportNoticeService.ReportNoticeDTO | null>(
    null,
  );
  const [adminNote, setAdminNote] = useState("");
  const [lockType, setLockType] = useState<LockType>("TEMPORARY");
  const [quickLockPreset, setQuickLockPreset] = useState<QuickLockPreset>("ONE_WEEK");
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockReason, setLockReason] = useState("");

  const { data, isLoading, refetch } = useGetReportInbox(params);
  const selectedReportId = activeNotice?.metadata?.reportId || "";
  const { data: detailResp, isLoading: isDetailLoading } = useGetReportDetail(selectedReportId);

  const markAsReadMutation = useMarkReportNoticeAsRead();
  const resolveReportMutation = useResolveReport();
  const rejectPropertyMutation = useRejectProperty();
  const lockAgentAccountMutation = useLockAgentAccount();

  const inbox = data?.data;
  const notices = useMemo(() => inbox?.results || [], [inbox?.results]);
  const detail = detailResp?.data;

  useEffect(() => {
    setAdminNote(detail?.adminNote || activeNotice?.metadata?.adminNote || "");
  }, [detail?.adminNote, detail?.id, activeNotice?.id, activeNotice?.metadata?.adminNote]);

  const filteredNotices = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return notices.filter((item) => {
      const matchesKeyword =
        !keyword ||
        [
          item.title,
          item.content,
          item.metadata?.targetType,
          item.metadata?.targetId,
          item.metadata?.reason,
          item.metadata?.details,
          item.metadata?.reportId,
          item.metadata?.reportStatus,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "UNREAD" && !item.isRead) ||
        (statusFilter === "READ" && item.isRead);

      const matchesTarget = targetFilter === "ALL" || item.metadata?.targetType === targetFilter;

      return matchesKeyword && matchesStatus && matchesTarget;
    });
  }, [notices, searchValue, statusFilter, targetFilter]);

  const stats = useMemo(
    () => ({
      total: inbox?.totalResults || 0,
      unread: inbox?.totalUnread || 0,
      listing: notices.filter((item) => item.metadata?.targetType === "LISTING").length,
      agent: notices.filter((item) => item.metadata?.targetType === "AGENT").length,
    }),
    [inbox?.totalResults, inbox?.totalUnread, notices],
  );

  const filteredStats = useMemo(
    () => ({
      total: filteredNotices.length,
      unread: filteredNotices.filter((item) => !item.isRead).length,
    }),
    [filteredNotices],
  );

  const hasActiveFilters = !!searchValue.trim() || statusFilter !== "ALL" || targetFilter !== "ALL";

  const reportStatusLabel = (status?: IReportNoticeService.ReportStatus) =>
    t(`reportInbox.reportStatus.${status || "OPEN"}`);

  const targetLabel = (targetType?: IReportNoticeService.ReportTargetType) =>
    t(`reportInbox.target.${targetType || "LISTING"}`);

  const reasonLabel = (reason?: IReportNoticeService.ReportReason) =>
    t(`reportInbox.reason.${reason || "OTHER"}`);

  const handleMarkAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync(id);
    MessageService.success(t("reportInbox.actions.readSuccess"));
  };

  const handleResolve = async (status: "CONFIRMED" | "DISMISSED") => {
    if (!selectedReportId) return;

    await resolveReportMutation.mutateAsync({
      id: selectedReportId,
      body: { status, adminNote: adminNote.trim() || undefined },
    });

    MessageService.success(
      status === "CONFIRMED"
        ? t("reportInbox.actions.confirmSuccess")
        : t("reportInbox.actions.dismissSuccess"),
    );
  };

  const openTarget = () => {
    if (!detail?.target) return;

    if (detail.target.kind === "LISTING") {
      const prefix =
        detail.target.status === "REJECTED"
          ? "rejected"
          : detail.target.status === "PENDING"
            ? "pending"
            : "published";
      navigate(`/properties/${prefix}/${detail.target.id}`);
      return;
    }

    if (detail.target.registrationId) {
      navigate(`/agents/manage/${detail.target.registrationId}`);
      return;
    }

    navigate(`/agents/manage/user/${detail.target.id}`);
  };

  const handleRejectListing = async () => {
    if (!selectedReportId || detail?.target?.kind !== "LISTING") return;

    const reason =
      adminNote.trim() || detail.details || t("reportInbox.actions.defaultListingReason");

    await rejectPropertyMutation.mutateAsync({
      id: detail.target.id,
      reason,
    });

    await resolveReportMutation.mutateAsync({
      id: selectedReportId,
      body: { status: "CONFIRMED", adminNote: reason },
    });

    MessageService.success(t("reportInbox.actions.listingPunished"));
  };

  const handleLockAgent = async () => {
    if (detail?.target?.kind !== "AGENT" || !detail.target.registrationId) return;

    const lockUntil = lockType === "TEMPORARY" ? buildPresetLockUntil(quickLockPreset) : undefined;
    const note = adminNote.trim() || detail.details || t("reportInbox.actions.defaultAgentReason");

    if (!lockReason.trim()) {
      MessageService.error(t("reportInbox.lockModal.reasonRequired"));
      return;
    }

    await lockAgentAccountMutation.mutateAsync({
      registrationId: detail.target.registrationId,
      body: {
        lockType,
        reason: lockReason.trim(),
        lockUntil,
      },
    });

    await resolveReportMutation.mutateAsync({
      id: selectedReportId,
      body: { status: "CONFIRMED", adminNote: note },
    });

    setIsLockModalOpen(false);
    MessageService.success(t("reportInbox.actions.agentPunished"));
  };

  const columns: ColumnsType<IReportNoticeService.ReportNoticeDTO> = [
    {
      title: t("reportInbox.table.time"),
      key: "createdAt",
      width: 190,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <Text>{formatDateTime(record.metadata?.reportedAt || record.createdAt)}</Text>
          <Text type="secondary" className="text-xs">
            {formatDateTime(record.createdAt)}
          </Text>
        </div>
      ),
    },
    {
      title: t("reportInbox.table.title"),
      key: "title",
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">{record.title}</span>
            <Badge
              status={record.isRead ? "default" : "processing"}
              text={record.isRead ? t("reportInbox.status.read") : t("reportInbox.status.unread")}
            />
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {reportStatusLabel(record.metadata?.reportStatus)}
            </span>
          </div>
          <Paragraph className="mb-0! text-sm text-slate-600" ellipsis={{ rows: 2 }}>
            {record.content}
          </Paragraph>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {record.metadata?.reportId ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                <BadgeAlert className="h-3.5 w-3.5" />
                {compactId(record.metadata.reportId)}
              </span>
            ) : null}
            {record.metadata?.reporterUserId ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                <UserRound className="h-3.5 w-3.5" />
                {compactId(record.metadata.reporterUserId)}
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      title: t("reportInbox.table.target"),
      key: "target",
      width: 140,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <Text strong>{targetLabel(record.metadata?.targetType)}</Text>
          <Text type="secondary" className="text-xs">
            {compactId(record.metadata?.targetId)}
          </Text>
        </div>
      ),
    },
    {
      title: t("reportInbox.table.reason"),
      key: "reason",
      width: 140,
      render: (_, record) => reasonLabel(record.metadata?.reason),
    },
    {
      title: t("translation:columns.action"),
      key: "action",
      width: 230,
      render: (_, record) => (
        <Space wrap>
          <Button
            type="primary"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => setActiveNotice(record)}
          >
            {t("reportInbox.actions.review")}
          </Button>
          <Button
            icon={<ShieldCheck className="h-4 w-4" />}
            disabled={record.isRead}
            loading={markAsReadMutation.isPending}
            onClick={() => handleMarkAsRead(record.id)}
          >
            {record.isRead ? t("reportInbox.status.read") : t("reportInbox.actions.markRead")}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card className="rounded-[28px] border-0 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                <BellRing className="mr-1.5 h-3.5 w-3.5" />
                {t("reportInbox.controlDesk")}
              </div>
              <Title level={3} className="mb-2!">
                {t("reportInbox.title")}
              </Title>
              <Paragraph className="mb-0! text-slate-500">{t("reportInbox.description")}</Paragraph>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="min-w-[130px] rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <Statistic title={t("reportInbox.stats.total")} value={stats.total} />
              </div>
              <div className="min-w-[130px] rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                <Statistic title={t("reportInbox.stats.unread")} value={stats.unread} />
              </div>
              <div className="min-w-[130px] rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                <Statistic title={t("reportInbox.stats.listing")} value={stats.listing} />
              </div>
              <div className="min-w-[130px] rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                <Statistic title={t("reportInbox.stats.agent")} value={stats.agent} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[28px] border-0 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Title level={5} className="mb-1!">
                {t("reportInbox.listTitle")}
              </Title>
              <Text type="secondary">{t("reportInbox.listDescription")}</Text>
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <SearchInput
                  allowClear
                  placeholder={t("reportInbox.searchPlaceholder")}
                  onSearch={setSearchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  value={searchValue}
                  prefix={<Search className="h-4 w-4 text-slate-400" />}
                  className="w-full sm:w-[320px]"
                />
                <div className="flex items-center gap-2">
                  <Button icon={<RefreshCcw className="h-4 w-4" />} onClick={() => void refetch()}>
                    {t("reportInbox.refresh")}
                  </Button>
                  {hasActiveFilters ? (
                    <Button
                      onClick={() => {
                        setSearchValue("");
                        setStatusFilter("ALL");
                        setTargetFilter("ALL");
                      }}
                    >
                      {t("reportInbox.actions.clearFilters")}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row">
                <Segmented<StatusFilter>
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  options={[
                    { label: t("reportInbox.filters.status.all"), value: "ALL" },
                    { label: t("reportInbox.filters.status.unread"), value: "UNREAD" },
                    { label: t("reportInbox.filters.status.read"), value: "READ" },
                  ]}
                />
                <Segmented<TargetFilter>
                  value={targetFilter}
                  onChange={(value) => setTargetFilter(value)}
                  options={[
                    { label: t("reportInbox.filters.target.all"), value: "ALL" },
                    { label: t("reportInbox.filters.target.listing"), value: "LISTING" },
                    { label: t("reportInbox.filters.target.agent"), value: "AGENT" },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mb-5 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-medium shadow-xs">
              <Inbox className="h-4 w-4 text-slate-500" />
              {t("reportInbox.summary.pageResults", {
                count: filteredStats.total,
                total: notices.length,
              })}
            </span>
            <span className="ml-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-medium shadow-xs">
              <BellRing className="h-4 w-4 text-orange-500" />
              {t("reportInbox.summary.unreadFocus", { count: filteredStats.unread })}
            </span>
          </div>

          <Table<IReportNoticeService.ReportNoticeDTO>
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={filteredNotices}
            pagination={false}
            className="report-inbox-table"
            rowClassName={(record) =>
              record.isRead ? "report-inbox-row" : "report-inbox-row report-inbox-row-unread"
            }
            locale={{ emptyText: <Empty description={t("reportInbox.empty")} /> }}
            scroll={{ x: 1100 }}
          />

          <div className="mt-4 flex justify-end">
            <Pagination
              current={inbox?.page || 1}
              pageSize={inbox?.limit || 10}
              total={inbox?.totalResults || 0}
              onChange={(page, limit) =>
                setParams((prev) => ({ ...prev, page, limit: limit || prev.limit }))
              }
              showSizeChanger
            />
          </div>
        </Card>
      </div>

      <Drawer
        title={t("reportInbox.drawer.title")}
        open={!!activeNotice}
        width={620}
        onClose={() => setActiveNotice(null)}
        extra={
          activeNotice && !activeNotice.isRead ? (
            <Button onClick={() => handleMarkAsRead(activeNotice.id)}>
              {t("reportInbox.actions.markRead")}
            </Button>
          ) : null
        }
      >
        {isDetailLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spin size="large" />
          </div>
        ) : !detail ? (
          <Empty description={t("reportInbox.drawer.empty")} />
        ) : (
          <div className="flex flex-col gap-4">
            <Card>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {reportStatusLabel(detail.status)}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {targetLabel(detail.targetType)}
                </span>
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <Text type="secondary">{t("reportInbox.drawer.reason")}</Text>
                  <div className="mt-1 font-medium">{reasonLabel(detail.reason)}</div>
                </div>
                <div>
                  <Text type="secondary">{t("reportInbox.drawer.reporter")}</Text>
                  <div className="mt-1 font-medium">
                    {detail.reporter?.fullName || t("reportInbox.drawer.unknownReporter")}
                  </div>
                  <div className="text-sm text-slate-500">{detail.reporter?.email || "--"}</div>
                  <div className="text-sm text-slate-500">{detail.reporter?.phone || "--"}</div>
                </div>
                <div>
                  <Text type="secondary">{t("reportInbox.drawer.details")}</Text>
                  <Paragraph className="mt-1 mb-0!">
                    {detail.details || t("reportInbox.table.noDetails")}
                  </Paragraph>
                </div>
                <div>
                  <Text type="secondary">{t("reportInbox.drawer.adminNote")}</Text>
                  <TextArea
                    rows={4}
                    value={adminNote}
                    onChange={(event) => setAdminNote(event.target.value)}
                    placeholder={t("reportInbox.drawer.adminNotePlaceholder")}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            <Card
              title={t("reportInbox.drawer.targetTitle")}
              extra={
                detail.target ? (
                  <Button icon={<ArrowUpRight className="h-4 w-4" />} onClick={openTarget}>
                    {t("reportInbox.actions.openTarget")}
                  </Button>
                ) : null
              }
            >
              {!detail.target ? (
                <Empty description={t("reportInbox.drawer.targetMissing")} />
              ) : detail.target.kind === "LISTING" ? (
                <div className="grid gap-3">
                  <div>
                    <Text type="secondary">{t("reportInbox.drawer.listingStatus")}</Text>
                    <div className="mt-1 font-medium">{detail.target.status}</div>
                  </div>
                  <div>
                    <Text type="secondary">{t("reportInbox.drawer.listingTitle")}</Text>
                    <div className="mt-1 font-medium">{detail.target.title}</div>
                  </div>
                  <div>
                    <Text type="secondary">{t("reportInbox.drawer.listingOwner")}</Text>
                    <div className="mt-1">{detail.target.owner?.fullName || "--"}</div>
                    <div className="text-sm text-slate-500">
                      {detail.target.owner?.email || "--"}
                    </div>
                  </div>
                  {detail.target.rejectReason ? (
                    <div>
                      <Text type="secondary">{t("reportInbox.drawer.listingRejectReason")}</Text>
                      <Paragraph className="mt-1 mb-0!">{detail.target.rejectReason}</Paragraph>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-3">
                  <div>
                    <Text type="secondary">{t("reportInbox.drawer.agentStatus")}</Text>
                    <div className="mt-1 font-medium">{detail.target.status}</div>
                  </div>
                  <div>
                    <Text type="secondary">{t("reportInbox.drawer.agentName")}</Text>
                    <div className="mt-1 font-medium">
                      {detail.target.user?.fullName ||
                        detail.target.basicInfo?.nameRegister ||
                        "--"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {detail.target.user?.email || detail.target.basicInfo?.email || "--"}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">{t("reportInbox.drawer.agentAccount")}</Text>
                    <div className="mt-1 font-medium">
                      {detail.target.accountLock
                        ? t("reportInbox.drawer.agentLocked")
                        : t("reportInbox.drawer.agentActive")}
                    </div>
                  </div>
                  {detail.target.accountLock?.reason ? (
                    <div>
                      <Text type="secondary">{t("reportInbox.drawer.agentLockReason")}</Text>
                      <Paragraph className="mt-1 mb-0!">{detail.target.accountLock.reason}</Paragraph>
                    </div>
                  ) : null}
                </div>
              )}
            </Card>

            <Card title={t("reportInbox.drawer.actionsTitle")}>
              <Space wrap>
                <Button
                  type="primary"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  loading={resolveReportMutation.isPending}
                  disabled={detail.status === "CONFIRMED"}
                  onClick={() => void handleResolve("CONFIRMED")}
                >
                  {t("reportInbox.actions.confirm")}
                </Button>
                <Button
                  icon={<ShieldX className="h-4 w-4" />}
                  loading={resolveReportMutation.isPending}
                  disabled={detail.status === "DISMISSED"}
                  onClick={() => void handleResolve("DISMISSED")}
                >
                  {t("reportInbox.actions.dismiss")}
                </Button>
                {detail.target?.kind === "LISTING" ? (
                  <Tooltip title={t("reportInbox.actions.rejectListingHint")}>
                    <Button
                      danger
                      icon={<TriangleAlert className="h-4 w-4" />}
                      loading={rejectPropertyMutation.isPending}
                      disabled={detail.target.status === "REJECTED"}
                      onClick={() => void handleRejectListing()}
                    >
                      {t("reportInbox.actions.rejectListing")}
                    </Button>
                  </Tooltip>
                ) : null}
                {detail.target?.kind === "AGENT" && detail.target.registrationId ? (
                  <Tooltip title={t("reportInbox.actions.lockAgentHint")}>
                    <Button
                      danger
                      icon={<LockKeyhole className="h-4 w-4" />}
                      loading={lockAgentAccountMutation.isPending}
                      onClick={() => {
                        setLockType("TEMPORARY");
                        setQuickLockPreset("ONE_WEEK");
                        setLockReason(adminNote.trim() || detail.details || "");
                        setIsLockModalOpen(true);
                      }}
                    >
                      {t("reportInbox.actions.lockAgent")}
                    </Button>
                  </Tooltip>
                ) : null}
              </Space>
            </Card>
          </div>
        )}
      </Drawer>

      <Modal
        title={t("reportInbox.lockModal.title")}
        open={isLockModalOpen}
        onCancel={() => setIsLockModalOpen(false)}
        onOk={() => void handleLockAgent()}
        confirmLoading={lockAgentAccountMutation.isPending}
        okText={t("reportInbox.lockModal.confirm")}
        cancelText={t("translation:button.cancel")}
      >
        <div className="flex flex-col gap-4">
          <Text>{t("reportInbox.lockModal.description")}</Text>
          <Segmented<LockType>
            block
            value={lockType}
            onChange={(value) => setLockType(value)}
            options={[
              { label: t("reportInbox.lockModal.temporary"), value: "TEMPORARY" },
              { label: t("reportInbox.lockModal.permanent"), value: "PERMANENT" },
            ]}
          />
          {lockType === "TEMPORARY" ? (
            <Radio.Group
              className="flex flex-col gap-2"
              value={quickLockPreset}
              onChange={(event) => setQuickLockPreset(event.target.value)}
            >
              <Radio value="ONE_DAY">{t("reportInbox.lockModal.oneDay")}</Radio>
              <Radio value="ONE_WEEK">{t("reportInbox.lockModal.oneWeek")}</Radio>
              <Radio value="ONE_MONTH">{t("reportInbox.lockModal.oneMonth")}</Radio>
            </Radio.Group>
          ) : null}
          <div className="flex flex-col gap-2">
            <Text>{t("reportInbox.lockModal.reason")}</Text>
            <TextArea
              rows={4}
              value={lockReason}
              onChange={(event) => setLockReason(event.target.value)}
              placeholder={t("reportInbox.lockModal.reasonPlaceholder")}
              maxLength={500}
              showCount
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReportInbox;
