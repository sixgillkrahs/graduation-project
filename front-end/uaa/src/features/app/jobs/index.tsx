import { useRetryJob, useDeleteJob } from "./services/mutate";
import { useGetJobs } from "./services/query";
import FullTable from "@/components/FullTable";
import { toVietnamTime } from "@shared/render/time";
import { Dropdown, Tag, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EllipsisVertical, RotateCcw, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";

const Jobs = () => {
  const { t } = useTranslation(["jobs", "translation"]);
  const [modal, contextHolder] = Modal.useModal();

  const retryMutation = useRetryJob();
  const deleteMutation = useDeleteJob();

  const handleRetry = (id: string) => {
    modal.confirm({
      title: t("jobs:confirm.retry.title"),
      content: t("jobs:confirm.retry.content"),
      onOk: () => retryMutation.mutateAsync(id),
      okText: t("jobs:confirm.retry.okText"),
    });
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: t("jobs:confirm.delete.title"),
      content: t("jobs:confirm.delete.content"),
      okType: "danger",
      onOk: () => deleteMutation.mutate(id),
      okText: t("jobs:confirm.delete.okText"),
    });
  };

  const columns: ColumnsType<IJobService.JobDTO> = [
    {
      title: t("jobs:columns.type"),
      dataIndex: "type",
      key: "type",
    },
    {
      title: t("jobs:columns.payload"),
      dataIndex: "payload",
      key: "payload",
      render: (val) => <span className="text-xs text-gray-500">{JSON.stringify(val)}</span>,
      ellipsis: true,
    },
    {
      title: t("jobs:columns.status"),
      dataIndex: "status",
      key: "status",
      render: (val) => {
        const color =
          val === "COMPLETED"
            ? "green"
            : val === "FAILED"
              ? "red"
              : val === "PROCESSING"
                ? "blue"
                : "default";
        return <Tag color={color}>{t(`jobs:status.${val}`, { defaultValue: val })}</Tag>;
      },
    },
    {
      title: t("jobs:columns.attempts"),
      key: "attempts",
      render: (_, record) => `${record.attempts} / ${record.maxAttempts}`,
    },
    {
      title: t("jobs:columns.error"),
      dataIndex: "error",
      key: "error",
      ellipsis: true,
    },
    {
      title: t("jobs:columns.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => toVietnamTime(value),
    },
    {
      title: t("columns.action"),
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "retry",
                label: t("jobs:actions.retry"),
                icon: <RotateCcw className="h-4 w-4" />,
                disabled: record.status !== "FAILED",
                onClick: () => handleRetry(record._id || record.id),
              },
              { type: "divider" as const },
              {
                key: "delete",
                label: t("button.delete"),
                icon: <Trash className="h-4 w-4" />,
                danger: true,
                onClick: () => handleDelete(record._id || record.id),
              },
            ],
          }}
        >
          <EllipsisVertical className="cursor-pointer" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col">
      <div className="mb-4 text-xl font-bold">{t("jobs:title")}</div>
      <FullTable<IJobService.JobDTO>
        columns={columns}
        useGetList={useGetJobs}
        disableAction
        isExport={false}
        isAdd={false}
      />
      {contextHolder}
    </div>
  );
};

export default Jobs;
