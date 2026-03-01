import { Input, Modal } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface ApprovePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  isApproving: boolean;
}

const ApprovePropertyModal: React.FC<ApprovePropertyModalProps> = React.memo(
  ({ isOpen, onClose, onConfirm, isApproving }) => {
    const [note, setNote] = useState("");
    const { t } = useTranslation();

    const handleOk = () => {
      onConfirm(note.trim());
    };

    const handleCancel = () => {
      setNote("");
      onClose();
    };

    return (
      <Modal
        title={t("properties.approveNoteTitle", "Ghi chú phê duyệt")}
        open={isOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={isApproving}
        okText={t("button.approve", "Phê duyệt")}
        cancelText={t("button.cancel", "Hủy")}
      >
        <div className="pt-4">
          <Input.TextArea
            rows={4}
            placeholder={t(
              "properties.approveNotePlaceholder",
              "Nhập ghi chú cho admin (không bắt buộc)...",
            )}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </Modal>
    );
  },
);

ApprovePropertyModal.displayName = "ApprovePropertyModal";

export default ApprovePropertyModal;
