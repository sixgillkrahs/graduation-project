import { useGetPermissions } from "../../permissions/services/query";
import { Col, Form, Input, Modal, Row, Switch, Transfer } from "antd";
import type { TransferDirection, TransferItem, TransferProps } from "antd/es/transfer";
import type { TransferKey } from "antd/es/transfer/interface";
import { forwardRef, memo, useImperativeHandle, useMemo, useState, type Key } from "react";

const { Item } = Form;
const { TextArea } = Input;

export type FormRef = {
  open: () => void;
};

const FormRole = forwardRef<FormRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedKeys, setSelectedKeys] = useState<TransferProps["targetKeys"]>([]);
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));
  const [params] = useState({
    limit: 10,
    page: 1,
    isActive: true,
  });
  const { data } = useGetPermissions(params);
  const [targetKeys, setTargetKeys] = useState<TransferProps["targetKeys"]>(
    data?.data?.results?.map((r) => r.id) || [],
  );

  const dataSource = useMemo<TransferItem[]>(() => {
    const results = data?.data?.results || [];
    return results.map((r) => ({
      key: r.id,
      title: r.name,
      description: r.name,
    }));
  }, [data]);

  const onChange: TransferProps["onChange"] = (
    targetKeys: Key[],
    direction: TransferDirection,
    moveKeys: TransferKey[],
  ) => {
    console.log(targetKeys, direction, moveKeys);
    setTargetKeys(targetKeys);
  };

  const onSubmit = (values: IRoleService.CreateRoleDTO) => {
    console.log(values);
  };

  const onSelectChange: TransferProps["onSelectChange"] = (
    sourceSelectedKeys,
    targetSelectedKeys,
  ) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  console.log("first");

  const onCancel = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Create Role"
      destroyOnHidden
      width={800}
      okButtonProps={{
        htmlType: "submit",
      }}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        onFinish={onSubmit}
        layout="vertical"
        initialValues={{ isActive: true, isDefault: false }}
      >
        <Item label="Name" name="name" rules={[{ required: true, message: "Please input name!" }]}>
          <Input placeholder="Enter name" />
        </Item>
        <Item label="Description" name="description">
          <TextArea placeholder="Enter description" />
        </Item>
        <Row>
          <Col span={12}>
            <Item name="isActive">
              <Switch /> Active
            </Item>
          </Col>
          <Col span={12}>
            <Item name="isDefault">
              <Switch /> <span>Default</span>
            </Item>
          </Col>
        </Row>
        <Item label="Permissions" name="permissions" wrapperCol={{ span: 24 }}>
          <Transfer
            styles={{
              section: {
                width: "100%",
                height: 300,
              },
            }}
            rowKey={(item) => item.key!}
            dataSource={dataSource}
            onChange={onChange}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onSelectChange={onSelectChange}
            // onScroll={onScroll}
            render={(item) => item.title || ""}
            selectAllLabels={[
              <>
                <span>Tổng: {data?.data?.totalResults || 0} quyền hoạt động</span>
              </>,
            ]}
          />
        </Item>
      </Form>
    </Modal>
  );
});

export default memo(FormRole);
