import { useGetPermissions } from "../../permissions/services/query";
import { Form, Input, Switch, Transfer } from "antd";
import type { TransferItem } from "antd/es/transfer";
import { useMemo, useState } from "react";

const { Item } = Form;
const { TextArea } = Input;

const FormRole = () => {
  const [params] = useState({
    limit: 10,
    page: 1,
    isActive: true,
  });
  const { data } = useGetPermissions(params);

  const dataSource = useMemo<TransferItem[]>(() => {
    const results = data?.data?.results || [];
    return results.map((r) => ({
      key: r.id,
      title: r.name,
      description: r.name,
    }));
  }, [data]);

  const onChange = (targetKeys: string[], direction: "left" | "right", moveKeys: string[]) => {};

  return (
    <>
      <Item label="Name" name="name" rules={[{ required: true, message: "Please input name!" }]}>
        <Input placeholder="Enter name" />
      </Item>
      <Item label="Permissions" name="permissions" wrapperCol={{ span: 24 }}>
        <Transfer
          className="min-w-full"
          listStyle={{
            width: "100%",
            height: 300,
          }}
          rowKey={(item) => item.key!}
          dataSource={dataSource}
          // targetKeys={dataSource.map((item) => item.key!)}
          // selectedKeys={selectedKeys}
          // onChange={onChange}
          // onSelectChange={onSelectChange}
          // onScroll={onScroll}

          render={(item) => item.title || ""}
        />
      </Item>
      <Item label="Description" name="description">
        <TextArea placeholder="Enter description" />
      </Item>
      <Item label="Active" name="isActive">
        <Switch />
      </Item>
      {/* <Item label="Default" name="isDefault">
        <Switch />
      </Item> */}
    </>
  );
};

export default FormRole;
