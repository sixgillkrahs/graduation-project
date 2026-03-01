import { Input, Modal, message } from "antd";
import React, { useState } from "react";

interface RejectPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isRejecting: boolean;
}

const RejectPropertyModal: React.FC<RejectPropertyModalProps> = React.memo(
  ({ isOpen, onClose, onConfirm, isRejecting }) => {
    const [rejectReason, setRejectReason] = useState("");

    const handleOk = () => {
      if (!rejectReason.trim()) {
        message.warning("Vui lòng nhập lý do từ chối");
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
        title="Lý do từ chối"
        open={isOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={isRejecting}
        okText="Gửi từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <div className="pt-4">
          <Input.TextArea
            rows={4}
            placeholder="Nhập lý do chi tiết tại sao từ chối tin đăng này..."
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
