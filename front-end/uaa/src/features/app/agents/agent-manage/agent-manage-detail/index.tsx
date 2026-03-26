import { useGetAgentsRegistration } from "../../agent-registration/services/query";
import AgentRegistrationService from "../../agent-registration/services/service";
import { useLockAgentAccount, useUnlockAgentAccount } from "../services/mutate";
import AgentBusinessInfoCard from "./components/AgentBusinessInfoCard";
import AgentIdentityInfoCard from "./components/AgentIdentityInfoCard";
import AgentOverviewCard from "./components/AgentOverviewCard";
import LockAgentAccountModal from "./components/LockAgentAccountModal";
import UnlockHistoryCard from "./components/UnlockHistoryCard";
import { ArrowLeftOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import MessageService from "@shared/message";
import { Button, Card, Col, Flex, Modal, Row, Space, Spin, Tag, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const AgentManageDetail = () => {
  const { t } = useTranslation("agents");
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: agentDetail, isLoading } = useGetAgentsRegistration(id || "");
  const { mutateAsync: lockAgentAccount, isPending: isLocking } = useLockAgentAccount();
  const { mutateAsync: unlockAgentAccount, isPending: isUnlocking } = useUnlockAgentAccount();
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  const detail = agentDetail?.data;
  const statusColor = AgentRegistrationService.STATUS.find(
    (item) => item.value === detail?.status,
  )?.color;
  const isAccountLocked = !!detail?.accountLock;

  const handleOpenLockModal = () => {
    setIsLockModalOpen(true);
  };

  const handleCloseLockModal = () => {
    if (isLocking) {
      return;
    }

    setIsLockModalOpen(false);
  };

  const handleSubmitLock = async (body: IAgentRegistrationService.LockAccountBody) => {
    if (!id) {
      MessageService.error(t("manage.lockActionError"));
      return;
    }

    await lockAgentAccount({
      registrationId: id,
      body,
    });

    MessageService.success(t("manage.lockSuccess"));
    setIsLockModalOpen(false);
  };

  const handleUnlockAccount = () => {
    if (!id) {
      MessageService.error(t("manage.unlockActionError"));
      return;
    }

    Modal.confirm({
      title: t("manage.unlockModalTitle"),
      content: t("manage.unlockModalDescription"),
      okText: t("manage.confirmUnlock"),
      cancelText: t("detail.cancel"),
      okButtonProps: { type: "primary" },
      onOk: async () => {
        await unlockAgentAccount({ registrationId: id });
        MessageService.success(t("manage.unlockSuccess"));
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-220px)] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!detail) {
    return <div>{t("detail.notFound")}</div>;
  }

  return (
    <>
      <Card
        actions={[
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            {t("detail.back")}
          </Button>,
        ]}
      >
        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <Typography.Title level={3}>{t("manage.detailTitle")}</Typography.Title>
          <Space wrap>
            <Tag color={statusColor}>{t(`statusValue.${detail.status}`)}</Tag>
            {detail.status === "APPROVED" && detail.userId ? (
              <Button
                type="primary"
                danger
                icon={isAccountLocked ? <UnlockOutlined /> : <LockOutlined />}
                loading={isUnlocking}
                onClick={isAccountLocked ? handleUnlockAccount : handleOpenLockModal}
              >
                {isAccountLocked ? t("manage.unlockAccount") : t("manage.lockAccount")}
              </Button>
            ) : null}
          </Space>
        </Flex>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <AgentOverviewCard detail={detail} />
            <AgentBusinessInfoCard detail={detail} />
          </Col>

          <Col xs={24} sm={12}>
            <AgentIdentityInfoCard detail={detail} />
            <UnlockHistoryCard histories={detail.unlockRequestHistories} />
          </Col>
        </Row>
      </Card>

      <LockAgentAccountModal
        open={isLockModalOpen}
        loading={isLocking}
        onCancel={handleCloseLockModal}
        onSubmit={handleSubmitLock}
      />
    </>
  );
};

export default AgentManageDetail;
