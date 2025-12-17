import { useGetInfinitePermissions } from "../../permissions/services/query";
import { useCreateRole, useUpdateRole } from "../services/mutate";
import { useGetRole } from "../services/query";
import type { Id } from "@shared/types/service";
import { Col, Form, Input, Modal, Row, Switch, Transfer } from "antd";
import type { TransferItem } from "antd/es/transfer";
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useState } from "react";

const { Item } = Form;
const { TextArea } = Input;

export type FormRef = {
  open: (id?: Id) => void;
};

const FormRole = forwardRef<FormRef>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [id, setId] = useState<Id>("");
  const { data: role, isLoading: isLoadingRole } = useGetRole(id);
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();
  const { mutateAsync: updateRole, isPending: isUpdating } = useUpdateRole();
  useImperativeHandle(ref, () => ({
    open: (id?: Id) => {
      setId(id || "");
      setOpen(true);
    },
  }));
  const params = {
    limit: 10,
    page: 1,
    isActive: true,
  };
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetInfinitePermissions(params);

  const dataSource = useMemo<TransferItem[]>(() => {
    const pages = data?.pages || [];
    return pages.flatMap((p: any) =>
      (p?.data?.results || []).map((r: any) => ({ key: r.id, title: r.name, description: r.name })),
    );
  }, [data]);

  const onSubmit = (values: IRoleService.CreateRoleDTO) => {
    if (id) {
      updateRole({ ...values, id: String(id) }).then(() => {
        setOpen(false);
      });
    } else {
      createRole(values).then(() => {
        setOpen(false);
      });
    }
  };

  useEffect(() => {
    if (id && role?.data) {
      const permissionIds = Array.isArray((role.data as any).permissionIds)
        ? (role.data as any).permissionIds.map((item: any) => item?.id ?? item)
        : [];
      form.setFieldsValue({ ...role.data, permissionIds });
    }
  }, [id, role, form]);

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
      loading={isLoading || isLoadingRole}
      open={open}
      onCancel={onCancel}
      title="Create Role"
      destroyOnHidden
      width={800}
      okButtonProps={{
        htmlType: "submit",
        loading: isCreating || isUpdating,
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
        <Item
          label="Permissions"
          name="permissionIds"
          valuePropName="targetKeys"
          wrapperCol={{ span: 24 }}
        >
          <Transfer
            styles={{
              section: {
                width: "100%",
                height: 300,
              },
            }}
            rowKey={(item) => item.key!}
            dataSource={dataSource}
            onChange={(keys) => {
              form.setFieldValue("permissionIds", keys);
            }}
            render={(item) => item.title || ""}
            onScroll={onScroll}
            showSelectAll={true}
            onSelectChange={(sourceSelectedKeys, targetSelectedKeys) => {
              console.log(sourceSelectedKeys, targetSelectedKeys);
            }}
            // selectAllLabels={[
            //   <>
            //     <span>Tổng: {data?.pages[0].data.totalResults || 0} quyền hoạt động</span>
            //   </>,
            // ]}
          />
        </Item>
      </Form>
    </Modal>
  );
});

export default memo(FormRole);
