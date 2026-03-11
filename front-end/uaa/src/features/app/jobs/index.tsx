import { useDeleteJob, useRetryJob } from "./services/mutate";
import { useGetJobs } from "./services/query";
import FullTable from "@/components/FullTable";
import { toVietnamTime } from "@shared/render/time";
import { Alert, Dropdown, Modal, Tag } from "antd";
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

  const getJobTypeMeta = (record: IJobService.JobDTO) => {
    if (record.type === "PROPERTY_EMBEDDING") {
      return {
        title: t("jobs:typeLabel.PROPERTY_EMBEDDING"),
        description: t("jobs:typeDescription.PROPERTY_EMBEDDING"),
      };
    }

    return {
      title: record.type,
      description: t("jobs:typeDescription.default"),
    };
  };

  const getPayloadSummary = (record: IJobService.JobDTO) => {
    if (record.type === "PROPERTY_EMBEDDING") {
      const propertyId = record.payload?.propertyId;

      if (propertyId) {
        return {
          primary: t("jobs:payload.propertyEmbedding.primary"),
          secondary: t("jobs:payload.propertyEmbedding.secondaryWithId", {
            propertyId,
          }),
        };
      }

      return {
        primary: t("jobs:payload.propertyEmbedding.primary"),
        secondary: t("jobs:payload.propertyEmbedding.secondaryFallback"),
      };
    }

    return {
      primary: t("jobs:payload.default.primary"),
      secondary: t("jobs:payload.default.secondary"),
    };
  };

  const getErrorMessage = (error?: string) => {
    if (!error) {
      return t("jobs:error.none");
    }

    if (error.includes("Property not found")) {
      return t("jobs:error.propertyNotFound");
    }

    if (error.includes("Missing propertyId")) {
      return t("jobs:error.missingPropertyId");
    }

    if (error.includes("Unsupported job type")) {
      return t("jobs:error.unsupportedType");
    }

    return t("jobs:error.generic");
  };

  const columns: ColumnsType<IJobService.JobDTO> = [
    {
      title: t("jobs:columns.type"),
      dataIndex: "type",
      key: "type",
      render: (_, record) => {
        const meta = getJobTypeMeta(record);

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{meta.title}</span>
            <span className="text-xs text-gray-500">{meta.description}</span>
          </div>
        );
      },
    },
    {
      title: t("jobs:columns.payload"),
      dataIndex: "payload",
      key: "payload",
      render: (_, record) => {
        const payloadSummary = getPayloadSummary(record);

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {payloadSummary.primary}
            </span>
            <span className="text-xs text-gray-500">
              {payloadSummary.secondary}
            </span>
          </div>
        );
      },
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

        return (
          <Tag color={color}>
            {t(`jobs:status.${val}`, { defaultValue: val })}
          </Tag>
        );
      },
    },
    {
      title: t("jobs:columns.attempts"),
      key: "attempts",
      render: (_, record) =>
        t("jobs:attempts.summary", {
          attempts: record.attempts,
          maxAttempts: record.maxAttempts,
        }),
    },
    {
      title: t("jobs:columns.error"),
      dataIndex: "error",
      key: "error",
      render: (value) => (
        <span className={value ? "text-red-500" : "text-gray-400"}>
          {getErrorMessage(value)}
        </span>
      ),
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
      <Alert
        className="mb-4"
        type="info"
        showIcon
        message={t("jobs:help.title")}
        description={t("jobs:help.description")}
      />
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
