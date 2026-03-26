import { useDateTimeFormatter } from "@shared/hooks/useDateTimeFormatter";
import { Card, Table, Tag, Typography, type TableColumnsType } from "antd";
import { memo } from "react";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

type UnlockHistoryCardProps = {
  histories?: IAgentRegistrationService.UnlockRequestHistory[];
};

const emptyHistories: IAgentRegistrationService.UnlockRequestHistory[] = [];

const UnlockHistoryCard = ({ histories = emptyHistories }: UnlockHistoryCardProps) => {
  const { t } = useTranslation("agents");
  const { formatDateTime } = useDateTimeFormatter();

  const columns: TableColumnsType<IAgentRegistrationService.UnlockRequestHistory> = [
    {
      title: t("manage.unlockHistoryDecision", {
        defaultValue: "Trạng thái",
      }),
      dataIndex: "decision",
      key: "decision",
      width: 170,
      render: (decision: IAgentRegistrationService.UnlockRequestHistory["decision"]) => (
        <Tag color={decision === "APPROVED" ? "green" : "red"}>
          {decision === "APPROVED"
            ? t("manage.unlockHistoryApproved", { defaultValue: "Đã duyệt mở khóa" })
            : t("manage.unlockHistoryRejected", { defaultValue: "Từ chối yêu cầu" })}
        </Tag>
      ),
    },
    {
      title: t("manage.unlockHistoryRequestedAt", {
        defaultValue: "Gửi yêu cầu lúc",
      }),
      dataIndex: "requestedAt",
      key: "requestedAt",
      width: 190,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: t("manage.unlockHistoryReviewedAt", {
        defaultValue: "Duyệt lúc",
      }),
      dataIndex: "reviewedAt",
      key: "reviewedAt",
      width: 190,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: t("manage.unlockHistoryReviewedBy", {
        defaultValue: "Người duyệt",
      }),
      dataIndex: "reviewedByName",
      key: "reviewedByName",
      width: 180,
      render: (value?: string | null) => value || "-",
    },
    {
      title: t("manage.unlockHistoryContactEmail", {
        defaultValue: "Email liên hệ",
      }),
      dataIndex: "contactEmail",
      key: "contactEmail",
      width: 220,
      render: (value?: string | null) => value || "-",
    },
    {
      title: t("manage.unlockHistoryReason", {
        defaultValue: "Lý do",
      }),
      dataIndex: "reason",
      key: "reason",
      width: 280,
      render: (value: string) => value || "-",
    },
  ];

  return (
    <Card
      title={t("manage.unlockHistoryTitle", {
        defaultValue: "Lịch sử duyệt đơn mở khóa",
      })}
      style={{ marginBottom: 16 }}
    >
      {histories.length ? (
        <Table
          size="small"
          rowKey={(record, index) =>
            `${record.reviewedAt}-${record.requestedAt}-${index || 0}`
          }
          columns={columns}
          dataSource={histories}
          pagination={false}
          scroll={{ x: 950 }}
        />
      ) : (
        <Text type="secondary">
          {t("manage.unlockHistoryEmpty", {
            defaultValue: "Chưa có đơn nào được duyệt",
          })}
        </Text>
      )}
    </Card>
  );
};

export default memo(UnlockHistoryCard);
