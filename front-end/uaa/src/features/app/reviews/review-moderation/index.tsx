import { useApproveReview, useRejectReview } from "./services/mutate";
import { useGetReviewModerationQueue } from "./services/query";
import MessageService from "@shared/message";
import type { IParamsPagination } from "@shared/types/service";
import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Input,
  Modal,
  Pagination,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCcw,
  Search,
  ShieldAlert,
  Star,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const { Paragraph, Text, Title } = Typography;
const { TextArea, Search: SearchInput } = Input;
import { useTranslation } from "react-i18next";

const formatDateTime = (value?: string) => {
  if (!value) return "--";
  return new Date(value).toLocaleString("vi-VN");
};

const statusMeta = (status: IReviewModerationService.ReviewStatus, t: any) => {
  switch (status) {
    case "AWAITING_ADMIN":
      return { color: "blue", label: t("moderation.status.AWAITING_ADMIN") };
    case "REPORTED":
      return { color: "volcano", label: t("moderation.status.REPORTED") };
    case "PENDING":
      return { color: "gold", label: t("moderation.status.PENDING") };
    case "PUBLISHED":
      return { color: "green", label: t("moderation.status.PUBLISHED") };
    case "REJECTED":
      return { color: "red", label: t("moderation.status.REJECTED") };
    default:
      return { color: "default", label: status };
  }
};

const ReviewModeration = () => {
  const { t } = useTranslation("reviews");
  const [params, setParams] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
  });
  const [selectedReview, setSelectedReview] =
    useState<IReviewModerationService.ReviewDTO | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [decisionNote, setDecisionNote] = useState("");

  const { data, isLoading, refetch } = useGetReviewModerationQueue(params);
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();

  const reviews = useMemo(() => data?.data.results || [], [data?.data.results]);
  const pagination = data?.data;
  const currentPageStats = useMemo(() => {
    return {
      total: pagination?.totalResults || 0,
      awaiting: reviews.filter((item) => item.status === "AWAITING_ADMIN").length,
      reported: reviews.filter((item) => item.status === "REPORTED").length,
      averageRating:
        reviews.length > 0
          ? (
              reviews.reduce((total, item) => total + item.rating, 0) / reviews.length
            ).toFixed(1)
          : "0.0",
    };
  }, [pagination?.totalResults, reviews]);

  const handleOpenDecision = (
    nextDecision: "approve" | "reject",
    review: IReviewModerationService.ReviewDTO,
  ) => {
    setSelectedReview(review);
    setDecision(nextDecision);
    setDecisionNote(review.adminNote || "");
  };

  const handleCloseDecision = () => {
    setDecision(null);
    setDecisionNote("");
  };

  const handleSubmitDecision = async () => {
    if (!selectedReview || !decision) return;

    if (decision === "approve") {
      await approveMutation.mutateAsync({
        reviewId: selectedReview.id,
        note: decisionNote.trim() || undefined,
      });
      MessageService.success(t("moderation.actions.approveSuccess"));
    } else {
      await rejectMutation.mutateAsync({
        reviewId: selectedReview.id,
        note: decisionNote.trim() || undefined,
      });
      MessageService.success(t("moderation.actions.rejectSuccess"));
    }

    handleCloseDecision();
    if (selectedReview) {
      setSelectedReview(null);
    }
  };

  const columns: ColumnsType<IReviewModerationService.ReviewDTO> = [
    {
      title: t("moderation.table.customer"),
      dataIndex: "customerName",
      key: "customerName",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
            {record.customerInitial}
          </div>
          <div>
            <div className="font-medium text-slate-900">{record.customerName}</div>
            <div className="text-xs text-slate-500">{formatDateTime(record.createdAt)}</div>
          </div>
        </div>
      ),
    },
    {
      title: t("moderation.table.property"),
      dataIndex: "propertyName",
      key: "propertyName",
      render: (value) => <span className="font-medium text-slate-700">{value}</span>,
    },
    {
      title: t("moderation.table.rating"),
      dataIndex: "rating",
      key: "rating",
      width: 110,
      render: (value) => (
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-semibold text-slate-800">{value}/5</span>
        </div>
      ),
    },
    {
      title: t("moderation.table.status"),
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (value) => {
        const meta = statusMeta(value, t);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: t("moderation.table.comment"),
      dataIndex: "comment",
      key: "comment",
      render: (value) => (
        <Paragraph ellipsis={{ rows: 2, expandable: false }} className="mb-0! max-w-[360px]">
          {value || t("moderation.table.noComment")}
        </Paragraph>
      ),
    },
    {
      title: t("moderation.table.actions"),
      key: "action",
      width: 170,
      render: (_, record) => (
        <Space>
          <Tooltip title={t("moderation.actions.view")}>
            <Button
              shape="circle"
              icon={<Eye className="h-4 w-4" />}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedReview(record);
              }}
            />
          </Tooltip>
          <Tooltip title={t("moderation.actions.approve")}>
            <Button
              type="primary"
              shape="circle"
              icon={<CheckCircle2 className="h-4 w-4" />}
              onClick={(event) => {
                event.stopPropagation();
                handleOpenDecision("approve", record);
              }}
            />
          </Tooltip>
          <Tooltip title={t("moderation.actions.reject")}>
            <Button
              danger
              shape="circle"
              icon={<XCircle className="h-4 w-4" />}
              onClick={(event) => {
                event.stopPropagation();
                handleOpenDecision("reject", record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-[28px] border-0 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center justify-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
              {t("moderation.controlDesk")}
            </div>
            <Title level={3} className="mb-2!">{t("moderation.title")}</Title>
            <Paragraph className="mb-0! text-slate-500">
              {t("moderation.description")}
            </Paragraph>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:w-auto">
            <div className="min-w-[130px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <Statistic title={t("moderation.stats.total")} value={currentPageStats.total} />
            </div>
            <div className="min-w-[130px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <Statistic title={t("moderation.stats.awaiting")} value={currentPageStats.awaiting} valueStyle={{ color: "#1677ff" }} />
            </div>
            <div className="min-w-[130px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <Statistic title={t("moderation.stats.reported")} value={currentPageStats.reported} valueStyle={{ color: "#fa541c" }} />
            </div>
            <div className="min-w-[130px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <Statistic 
                title={t("moderation.stats.avgRating")} 
                value={currentPageStats.averageRating} 
                prefix={<Star className="mb-0.5 mr-1 inline h-4 w-4 fill-amber-400 text-amber-400" />} 
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="rounded-[28px] border-0 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <Title level={4} className="mb-1!">
              {t("moderation.search.title")}
            </Title>
            <Text type="secondary">
              {t("moderation.search.description")}
            </Text>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput
              allowClear
              className="min-w-[320px]"
              placeholder={t("moderation.search.placeholder")}
              prefix={<Search className="h-4 w-4 text-slate-400" />}
              onSearch={(value) =>
                setParams((current) => ({
                  ...current,
                  page: 1,
                  search: value || undefined,
                }))
              }
            />
            <Tooltip title={t("moderation.search.refresh")}>
              <Button
                shape="circle"
                icon={<RefreshCcw className="h-4 w-4" />}
                onClick={() => refetch()}
              />
            </Tooltip>
          </div>
        </div>

        <Table<IReviewModerationService.ReviewDTO>
          rowKey="id"
          columns={columns}
          dataSource={reviews}
          loading={isLoading}
          pagination={false}
          locale={{
            emptyText: <Empty description={t("moderation.table.empty")} />,
          }}
          onRow={(record) => ({
            onClick: () => setSelectedReview(record),
          })}
        />

        <div className="mt-5 flex justify-end">
          <Pagination
            current={pagination?.page || params.page}
            pageSize={pagination?.limit || params.limit}
            total={pagination?.totalResults || 0}
            showSizeChanger
            onChange={(page, limit) =>
              setParams((current) => ({
                ...current,
                page,
                limit,
              }))
            }
          />
        </div>
      </Card>

      <Drawer
        open={Boolean(selectedReview)}
        width={520}
        onClose={() => setSelectedReview(null)}
        title={t("moderation.details.title")}
      >
        {selectedReview && (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Title level={5} className="mb-1!">
                    {selectedReview.customerName}
                  </Title>
                  <Text type="secondary">{formatDateTime(selectedReview.createdAt)}</Text>
                </div>
                <Tag color={statusMeta(selectedReview.status, t).color}>
                  {statusMeta(selectedReview.status, t).label}
                </Tag>
              </div>

              <div className="mt-4 flex items-center gap-2 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-semibold text-slate-800">{selectedReview.rating}/5</span>
              </div>
            </div>

            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Card size="small" title={t("moderation.details.property")}>
                  <Text>{selectedReview.propertyName}</Text>
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small" title={t("moderation.details.quickTags")}>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.tags.length > 0 ? (
                      selectedReview.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)
                    ) : (
                      <Text type="secondary">{t("moderation.details.noTags")}</Text>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>

            <Card
              size="small"
              title={
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-slate-500" />
                  <span>{t("moderation.details.customerComment")}</span>
                </div>
              }
            >
              <Paragraph className="mb-0! whitespace-pre-wrap">
                {selectedReview.comment || t("moderation.table.noComment")}
              </Paragraph>
            </Card>

            {selectedReview.agentReply && (
              <Card size="small" title={t("moderation.details.agentReply")}>
                <Paragraph className="mb-1! whitespace-pre-wrap">
                  {selectedReview.agentReply.content}
                </Paragraph>
                <Text type="secondary">{formatDateTime(selectedReview.agentReply.repliedAt)}</Text>
              </Card>
            )}

            {selectedReview.reportReason && (
              <Card
                size="small"
                title={
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                    <span>{t("moderation.details.reportReason")}</span>
                  </div>
                }
              >
                <Paragraph className="mb-0! whitespace-pre-wrap">
                  {selectedReview.reportReason}
                </Paragraph>
              </Card>
            )}

            {selectedReview.adminNote && (
              <Card size="small" title={t("moderation.details.previousNote")}>
                <Paragraph className="mb-0! whitespace-pre-wrap">
                  {selectedReview.adminNote}
                </Paragraph>
              </Card>
            )}

            <div className="flex gap-3">
              <Tooltip title={t("moderation.actions.approve")}>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => handleOpenDecision("approve", selectedReview)}
                  loading={approveMutation.isPending}
                />
              </Tooltip>
              <Tooltip title={t("moderation.actions.reject")}>
                <Button
                  danger
                  shape="circle"
                  icon={<XCircle className="h-4 w-4" />}
                  onClick={() => handleOpenDecision("reject", selectedReview)}
                  loading={rejectMutation.isPending}
                />
              </Tooltip>
            </div>
          </div>
        )}
      </Drawer>

      <Modal
        title={decision === "approve" ? t("moderation.actions.approve") : t("moderation.actions.reject")}
        open={Boolean(decision)}
        onCancel={handleCloseDecision}
        footer={[
          <Tooltip key="cancel" title={t("moderation.actions.cancel")}>
            <Button shape="circle" icon={<X className="h-4 w-4" />} onClick={handleCloseDecision} />
          </Tooltip>,
          <Tooltip
            key="submit"
            title={decision === "approve" ? t("moderation.actions.approve") : t("moderation.actions.reject")}
          >
            <Button
              type={decision === "approve" ? "primary" : "default"}
              danger={decision === "reject"}
              shape="circle"
              icon={
                decision === "approve" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )
              }
              loading={approveMutation.isPending || rejectMutation.isPending}
              onClick={handleSubmitDecision}
            />
          </Tooltip>,
        ]}
      >
        <div className="mb-4">
          <Text>
            {decision === "approve"
              ? t("moderation.actions.approveDesc")
              : t("moderation.actions.rejectDesc")}
          </Text>
        </div>
        <TextArea
          rows={4}
          value={decisionNote}
          onChange={(event) => setDecisionNote(event.target.value)}
          placeholder={
            decision === "approve"
              ? t("moderation.actions.approvePlaceholder")
              : t("moderation.actions.rejectPlaceholder")
          }
        />
      </Modal>
    </div>
  );
};

export default ReviewModeration;
