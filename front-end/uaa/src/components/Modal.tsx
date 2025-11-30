import { Modal } from "antd";
import { memo, type FC, type ReactNode } from "react";

interface IModalCUProps {
  isOpen: boolean;
  onCancel: () => void;
  onOk: () => void;
  title?: string;
  children?: ReactNode;
}

const ModalCU: FC<IModalCUProps> = ({ isOpen, onCancel, onOk, title, children }) => {
  console.log("first");
  return (
    <Modal open={isOpen} onCancel={onCancel} onOk={onOk} destroyOnHidden title={title}>
      {children}
    </Modal>
  );
};

export default memo(ModalCU);
