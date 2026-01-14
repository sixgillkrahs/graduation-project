import { Modal } from "@/components/ui";
import { memo } from "react";

const ModalAdd = ({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) => {
  return (
    <Modal open={open} onCancel={onCancel}>
      <h1>he</h1>
    </Modal>
  );
};

export default memo(ModalAdd);
