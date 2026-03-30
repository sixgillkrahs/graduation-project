import { Input, Modal, message } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface RejectPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isRejecting: boolean;
}

const RejectPropertyModal: React.FC<RejectPropertyModalProps> = React.memo(
  ({ isOpen, onClose, onConfirm, isRejecting }) => {
    const [rejectReason, setRejectReason] = useState("");
    const { t } = useTranslation();

    const handleOk = () => {
      if (!rejectReason.trim()) {
        message.warning(
          t("properties.rejectReasonValidation", {
            defaultValue: "Please enter a rejection reason",
          }),
        );
        return;
      }
      onConfirm(rejectReason.trim());
    };

    const handleCancel = () => {
      setRejectReason("");
      onClose();
    };

    return (
      <Modal
        title={t("properties.rejectReasonTitle", { defaultValue: "Rejection reason" })}
        open={isOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={isRejecting}
        okText={t("properties.rejectReasonSubmit", { defaultValue: "Submit rejection" })}
        cancelText={t("button.cancel", { defaultValue: "Cancel" })}
        okButtonProps={{ danger: true }}
      >
        <div className="pt-4">
          <Input.TextArea
            rows={4}
            placeholder={t("properties.rejectReasonPlaceholder", {
              defaultValue: "Enter the detailed reason for rejecting this listing...",
            })}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>
    );
  },
);

RejectPropertyModal.displayName = "RejectPropertyModal";

export default RejectPropertyModal;
