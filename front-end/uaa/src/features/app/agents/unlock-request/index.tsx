import {
  useGetUnlockRequests,
} from "../agent-manage/services/query";
import {
  useRejectUnlockRequest,
  useUnlockAgentAccount,
} from "../agent-manage/services/mutate";
import FullTable from "@/components/FullTable";
import MessageService from "@/shared/message";
import { toVietnamTime } from "@/shared/render/time";
import type { ItemType } from "antd/es/menu/interface";
import type { ColumnsType } from "antd/es/table";
import { Modal, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const UnlockRequestInbox = () => {
  const { t } = useTranslation("agents");
  const navigate = useNavigate();
  const { mutateAsync: unlockAgentAccount } = useUnlockAgentAccount();
  const { mutateAsync: rejectUnlockRequest } = useRejectUnlockRequest();

  const columns: ColumnsType<IAgentService.UnlockRequestItem> = [
    {
      title: t("unlockRequests.columns.fullName"),
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: t("unlockRequests.columns.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("unlockRequests.columns.contactEmail"),
      dataIndex: "contactEmail",
      key: "contactEmail",
      render: (value?: string | null) => value || "-",
    },
    {
      title: t("unlockRequests.columns.requestedAt"),
      dataIndex: "requestedAt",
      key: "requestedAt",
      render: (value: string) => toVietnamTime(value),
    },
    {
      title: t("unlockRequests.columns.lockType"),
      dataIndex: ["accountLock", "lockType"],
      key: "accountLock.lockType",
      render: (value: "TEMPORARY" | "PERMANENT") => (
        <Tag color="red">
          {value === "PERMANENT"
            ? t("manage.lockModePermanent")
            : t("manage.lockModeTemporary")}
        </Tag>
      ),
    },
    {
      title: t("unlockRequests.columns.unlockReason"),
      dataIndex: "unlockReason",
      key: "unlockReason",
      render: (value: string) => (
        <div className="max-w-[360px] whitespace-pre-wrap break-words text-sm">
          {value}
        </div>
      ),
    },
  ];

  const handleApprove = (record: IAgentService.UnlockRequestItem) => {
    Modal.confirm({
      title: t("unlockRequests.approveTitle"),
      content: t("unlockRequests.approveDescription"),
      okText: t("unlockRequests.approveAction"),
      cancelText: t("detail.cancel"),
      okButtonProps: { type: "primary" },
      onOk: async () => {
        await unlockAgentAccount({ registrationId: record.registrationId });
        MessageService.success(t("unlockRequests.approveSuccess"));
      },
    });
  };

  const handleReject = (record: IAgentService.UnlockRequestItem) => {
    Modal.confirm({
      title: t("unlockRequests.rejectTitle"),
      content: t("unlockRequests.rejectDescription"),
      okText: t("unlockRequests.rejectAction"),
      cancelText: t("detail.cancel"),
      okButtonProps: { danger: true },
      onOk: async () => {
        await rejectUnlockRequest({ registrationId: record.registrationId });
        MessageService.success(t("unlockRequests.rejectSuccess"));
      },
    });
  };

  const extraAction = (record: IAgentService.UnlockRequestItem): ItemType[] => [
    {
      key: "approve-unlock",
      label: t("unlockRequests.approveAction"),
      onClick: () => handleApprove(record),
    },
    {
      key: "reject-unlock",
      label: t("unlockRequests.rejectAction"),
      danger: true,
      onClick: () => handleReject(record),
    },
  ];

  return (
    <FullTable<IAgentService.UnlockRequestItem>
      columns={columns}
      isExport={false}
      isAdd={false}
      isEdit={false}
      isDelete={false}
      isView={false}
      isDetail={true}
      onDetail={(record) => navigate(`/agents/manage/${record.registrationId}`)}
      useGetList={useGetUnlockRequests}
      extraAction={extraAction}
      search={{
        placeholder: t("unlockRequests.searchPlaceholder"),
        name: "query",
      }}
    />
  );
};

export default UnlockRequestInbox;
