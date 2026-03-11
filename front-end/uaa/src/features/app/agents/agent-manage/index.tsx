import AgentRegistrationService from "../agent-registration/services/service";
import { useGetAgents } from "./services/query";
import FullTable from "@/components/FullTable";
import { renderConstant } from "@shared/render/const";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

const AgentManagement = () => {
  const { t } = useTranslation("agents");
  const columns: ColumnsType<IAgentService.Agent> = [
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
  ];
  return (
    <FullTable<IAgentService.Agent>
      columns={columns}
      isExport={false}
      isAdd={false}
      useGetList={useGetAgents}
      isView={false}
      isEdit={false}
      isDetail={true}
      // onDetail={handleDetail}
    />
  );
};

export default AgentManagement;
