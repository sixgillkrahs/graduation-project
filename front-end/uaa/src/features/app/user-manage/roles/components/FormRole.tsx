import { useGetInfinitePermissions } from "../../permissions/services/query";
import { useCreateRole } from "../services/mutate";
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
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));
  const [params] = useState({
    limit: 10,
    page: 1,
    isActive: true,
  });
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetInfinitePermissions(params);
  const [targetKeys, setTargetKeys] = useState<TransferProps["targetKeys"]>();

  const dataSource = useMemo<TransferItem[]>(() => {
    const pages = data?.pages || [];
    return pages.flatMap((p: any) =>
      (p?.data?.results || []).map((r: any) => ({ key: r.id, title: r.name, description: r.name })),
    );
  }, [data]);

  const onChange: TransferProps["onChange"] = (targetKeys: Key[]) => {
    setTargetKeys(targetKeys);
  };

  const onSubmit = (values: IRoleService.CreateRoleDTO) => {
    createRole(values).then((res) => {
      console.log(res);
      setOpen(false);
    });
  };

  console.log("first");

  const onCancel = () => {
    setOpen(false);
  };

  const onScroll = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <Modal
      loading={isLoading}
      open={open}
      onCancel={onCancel}
      title="Create Role"
      destroyOnHidden
      width={800}
      okButtonProps={{
        htmlType: "submit",
        loading: isCreating,
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
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Item>
          </Col>
          <Col span={12}>
            <Item name="isDefault">
              <Switch checkedChildren="Default" unCheckedChildren="Not Default" />
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
            render={(item) => item.title || ""}
            onScroll={onScroll}
            showSelectAll={true}
            onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => {
              console.log(sourceSelectedKeys, targetSelectedKeys);
            }}
            selectAllLabels={[
              <>
                <span>Tổng: {data?.pages[0].data.totalResults || 0} quyền hoạt động</span>
              </>,
            ]}
          />
        </Item>
      </Form>
    </Modal>
  );
});

export default memo(FormRole);
