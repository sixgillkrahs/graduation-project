import { useGetAgentsRegistrations } from "../services/query";
import AgentRegistrationService from "../services/service";
import FullTable from "@/components/FullTable";
import { renderConstant } from "@shared/render/const";
import { toVietnamTime } from "@shared/render/time";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

const AgentRegistration = () => {
  const navigate = useNavigate();
  const columns: ColumnsType<IAgentRegistrationService.AgentRegistration> = [
    {
      title: "Tên Đăng Ký",
      dataIndex: ["basicInfo", "nameRegister"],
      key: "businessInfo.nameRegister",
    },
    {
      title: "Email",
      dataIndex: ["basicInfo", "email"],
      key: "basicInfo.email",
    },
    {
      title: "Số điện thoại",
      dataIndex: ["basicInfo", "phoneNumber"],
      key: "basicInfo.phoneNumber",
    },
    {
      title: "Số năm KN",
      dataIndex: ["businessInfo", "yearsOfExperience"],
      key: "businessInfo.yearsOfExperience",
    },
    {
      title: "Khu vực",
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
      title: "Trạng thái",
      dataIndex: ["status"],
      key: "status",
      render: (value) => renderConstant(value, AgentRegistrationService.STATUS),
    },
    {
      title: "Ngày đăng ký",
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
          placeholder: "Tên đăng ký",
          name: ["basicInfo", "nameRegister"],
        },
        {
          type: "input",
          placeholder: "Email",
          name: ["basicInfo", "email"],
        },
        {
          name: "status",
          type: "select",
          options: AgentRegistrationService.STATUS,
          placeholder: "Trạng thái",
        },
        {
          type: "date",
          placeholder: "Ngày đăng ký",
          name: ["createdAt"],
        },
      ]}
    />
  );
};

export default AgentRegistration;
