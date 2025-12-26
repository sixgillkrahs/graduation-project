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
      title: "Họ và tên",
      dataIndex: ["identityInfo", "agentName"],
      key: "identityInfo.agentName",
    },
    {
      title: "Email",
      dataIndex: ["businessInfo", "email"],
      key: "businessInfo.email",
    },
    {
      title: "Số điện thoại",
      dataIndex: ["businessInfo", "phoneNumber"],
      key: "businessInfo.phone",
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
    />
  );
};

export default AgentRegistration;
