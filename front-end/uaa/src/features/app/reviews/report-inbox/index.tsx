import { useMarkReportNoticeAsRead } from "./services/mutate";
import { useGetReportInbox } from "./services/query";
import MessageService from "@shared/message";
import type { IParamsPagination } from "@shared/types/service";
import {
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Pagination,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  BellRing,
  Eye,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const { Paragraph, Text, Title } = Typography;
const { Search: SearchInput } = Input;

const formatDateTime = (value?: string) => {
  if (!value) return "--";
  return new Date(value).toLocaleString("vi-VN");
};

const ReportInbox = () => {
  const { t } = useTranslation(["reviews", "translation"]);
  const [params, setParams] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");

  const { data, isLoading, refetch } = useGetReportInbox(params);
  const markAsReadMutation = useMarkReportNoticeAsRead();

  const inbox = data?.data;
  const notices = useMemo(() => inbox?.results || [], [inbox?.results]);

  const filteredNotices = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    if (!keyword) {
      return notices;
    }

    return notices.filter((item) => {
      const haystack = [
        item.title,
        item.content,
        item.metadata?.targetType,
        item.metadata?.targetId,
        item.metadata?.reason,
        item.metadata?.details,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [notices, searchValue]);

  const stats = useMemo(
    () => ({
      total: inbox?.totalResults || 0,
      unread: inbox?.totalUnread || 0,
      listing: notices.filter((item) => item.metadata?.targetType === "LISTING").length,
      agent: notices.filter((item) => item.metadata?.targetType === "AGENT").length,
    }),
    [inbox?.totalResults, inbox?.totalUnread, notices],
  );

  const handleMarkAsRead = async (id: string) => {
    await markAsReadMutation.mutateAsync(id);
    MessageService.success(t("reportInbox.actions.readSuccess"));
  };

  const columns: ColumnsType<IReportNoticeService.ReportNoticeDTO> = [
    {
      title: t("reportInbox.table.time"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value) => <Text>{formatDateTime(value)}</Text>,
    },
    {
      title: t("reportInbox.table.title"),
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <Space size={8}>
            <span className="font-medium text-slate-900">{record.title}</span>
            {record.isRead ? (
              <Tag>{t("reportInbox.status.read")}</Tag>
            ) : (
              <Badge status="processing" text={t("reportInbox.status.unread")} />
            )}
          </Space>
          <Text type="secondary">{record.content}</Text>
        </div>
      ),
    },
    {
      title: t("reportInbox.table.target"),
      key: "target",
      width: 180,
      render: (_, record) => (
        <div className="flex flex-col">
          <Tag color={record.metadata?.targetType === "LISTING" ? "blue" : "purple"}>
            {t(`reportInbox.target.${record.metadata?.targetType || "LISTING"}`)}
          </Tag>
          <Text type="secondary" className="mt-1">
            {record.metadata?.targetId || "--"}
          </Text>
        </div>
      ),
    },
    {
      title: t("reportInbox.table.reason"),
      key: "reason",
      width: 180,
      render: (_, record) => (
        <Tag color="volcano">
          {t(`reportInbox.reason.${record.metadata?.reason || "OTHER"}`)}
        </Tag>
      ),
    },
    {
      title: t("reportInbox.table.details"),
      key: "details",
      render: (_, record) => (
        <Paragraph ellipsis={{ rows: 2, expandable: false }} className="mb-0! max-w-[360px]">
          {record.metadata?.details || t("reportInbox.table.noDetails")}
        </Paragraph>
      ),
    },
    {
      title: t("translation:columns.action"),
      key: "action",
      width: 120,
      render: (_, record) => (
        <Tooltip title={t("reportInbox.actions.markRead")}>
          <Button
            shape="circle"
            icon={<Eye className="h-4 w-4" />}
            disabled={record.isRead}
            loading={markAsReadMutation.isPending}
            onClick={() => handleMarkAsRead(record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-[28px] border-0 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center justify-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
              <BellRing className="mr-1.5 h-3.5 w-3.5" />
              {t("reportInbox.controlDesk")}
            </div>
            <Title level={3} className="mb-2!">{t("reportInbox.title")}</Title>
            <Paragraph className="mb-0! text-slate-500">
              {t("reportInbox.description")}
            </Paragraph>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="min-w-[130px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <Statistic title={t("reportInbox.stats.total")} value={stats.total} />
            </div>
            <div className="min-w-[130px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <Statistic title={t("reportInbox.stats.unread")} value={stats.unread} valueStyle={{ color: "#fa8c16" }} />
            </div>
            <div className="min-w-[130px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <Statistic title={t("reportInbox.stats.listing")} value={stats.listing} valueStyle={{ color: "#1677ff" }} />
            </div>
            <div className="min-w-[130px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <Statistic title={t("reportInbox.stats.agent")} value={stats.agent} valueStyle={{ color: "#722ed1" }} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-[28px] border-0 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Title level={5} className="mb-1!">{t("reportInbox.listTitle")}</Title>
            <Text type="secondary">{t("reportInbox.listDescription")}</Text>
          </div>

          <div className="flex items-center gap-3">
            <SearchInput
              allowClear
              placeholder={t("reportInbox.searchPlaceholder")}
              onSearch={setSearchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              value={searchValue}
              prefix={<Search className="h-4 w-4 text-slate-400" />}
              className="w-[280px]"
            />
            <Tooltip title={t("reportInbox.refresh")}>
              <Button
                icon={<RefreshCcw className="h-4 w-4" />}
                onClick={() => {
                  void refetch();
                }}
              />
            </Tooltip>
          </div>
        </div>

        <Table<IReportNoticeService.ReportNoticeDTO>
          rowKey="id"
          loading={isLoading}
          columns={columns}
          dataSource={filteredNotices}
          pagination={false}
          locale={{
            emptyText: <Empty description={t("reportInbox.empty")} />,
          }}
        />

        <div className="mt-4 flex justify-end">
          <Pagination
            current={inbox?.page || 1}
            pageSize={inbox?.limit || 10}
            total={inbox?.totalResults || 0}
            onChange={(page, limit) =>
              setParams((prev) => ({
                ...prev,
                page,
                limit: limit || prev.limit,
              }))
            }
            showSizeChanger
          />
        </div>
      </Card>
    </div>
  );
};

export default ReportInbox;
