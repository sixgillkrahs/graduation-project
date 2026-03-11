import { useGetAgentsRegistrations } from "../services/query";
import AgentRegistrationService from "../services/service";
import FullTable from "@/components/FullTable";
import { renderConstant } from "@shared/render/const";
import { toVietnamTime } from "@shared/render/time";
import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AgentRegistration = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("agents");
  const columns: ColumnsType<IAgentRegistrationService.AgentRegistration> = [
    {
      title: t("columns.nameRegister"),
      dataIndex: ["basicInfo", "nameRegister"],
      key: "businessInfo.nameRegister",
    },
    {
      title: t("columns.email"),
      dataIndex: ["basicInfo", "email"],
      key: "basicInfo.email",
    },
    {
      title: t("columns.phoneNumber"),
      dataIndex: ["basicInfo", "phoneNumber"],
      key: "basicInfo.phoneNumber",
    },
    {
      title: t("columns.yearsOfExperience"),
      dataIndex: ["businessInfo", "yearsOfExperience"],
      key: "businessInfo.yearsOfExperience",
    },
    {
      title: t("columns.workingArea"),
      dataIndex: ["businessInfo", "workingArea"],
      key: "businessInfo.workingArea",
      render: (value: string[]) => {
        if (!value || value.length === 0) return "-";

        const MAX = 3;
        const displayItems = value.slice(0, MAX);
        const hasMore = value.length > MAX;

        return (
          <>
            {displayItems.map((item, index) => (
              <span key={index}>
                {renderConstant(item, AgentRegistrationService.VietNamProvide)}
                {index < displayItems.length - 1 && ", "}
              </span>
            ))}
            {hasMore && " ..."}
          </>
        );
      },
    },
    {
      title: t("columns.status"),
      dataIndex: ["status"],
      key: "status",
      render: (value) => {
        const item = AgentRegistrationService.STATUS.find(i => i.value === value);
        return <Tag color={item?.color}>{t(`statusValue.${value}`)}</Tag>;
      },
    },
    {
      title: t("columns.createdAt"),
      dataIndex: ["createdAt"],
      key: "createdAt",
      render: (value) => toVietnamTime(value),
    },
  ];

  const handleDetail = (record: IAgentRegistrationService.AgentRegistration) => {
    navigate(`/agents/registration/${record.id}`);
  };

  return (
    <FullTable<IAgentRegistrationService.AgentRegistration>
      columns={columns}
      isExport={false}
      isAdd={false}
      useGetList={useGetAgentsRegistrations}
      isView={false}
      isEdit={false}
      isDetail={true}
      onDetail={handleDetail}
      filter={[
        {
          type: "input",
          placeholder: t("filter.nameRegister"),
          name: ["basicInfo", "nameRegister"],
        },
        {
          type: "input",
          placeholder: t("filter.email"),
          name: ["basicInfo", "email"],
        },
        {
          name: "status",
          type: "select",
          options: AgentRegistrationService.STATUS,
          placeholder: t("filter.status"),
        },
        {
          type: "date",
          placeholder: t("filter.createdAt"),
          name: ["createdAt"],
        },
      ]}
    />
  );
};

export default AgentRegistration;
