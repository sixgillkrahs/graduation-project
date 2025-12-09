import { Form, Modal, type ButtonProps, type FormInstance } from "antd";
import { type ReactNode } from "react";

interface IModalFormProps {
  isOpen: boolean;
  onCancel: () => void;
  onOk: () => void;
  title: string;
  children: ReactNode;
  form?: FormInstance;
  initialValues?: Record<string, any>;
  submitButtonText?: string;
  loading?: boolean;
  cancelButtonProps?: ButtonProps;
  okButtonProps?: ButtonProps;
  cancelText?: string;
  destroyOnHidden?: boolean;
}

const ModalForm = ({
  isOpen,
  onCancel,
  onOk,
  title,
  children,
  form,
  initialValues,
  submitButtonText = "Submit",
  loading = false,
  cancelButtonProps = {
    type: "default",
  },
  okButtonProps = {
    type: "primary",
    loading: false,
  },
  cancelText = "Cancel",
  destroyOnHidden = false,
}: IModalFormProps) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onCancel}
      onOk={onOk}
      width={600}
      destroyOnHidden={destroyOnHidden}
      afterClose={() => {
        form?.resetFields();
      }}
      okButtonProps={okButtonProps}
      loading={loading}
      okText={submitButtonText}
      cancelButtonProps={cancelButtonProps}
      cancelText={cancelText}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        {children}
      </Form>
    </Modal>
  );
};

export default ModalForm;
