import { useGetPermissions } from "../../permissions/services/query";
import { Form, Input, Row, Switch, Transfer } from "antd";
import type { TransferItem } from "antd/es/transfer";
import { useMemo, useState } from "react";

const { Item } = Form;
const { TextArea } = Input;

const FormRole = () => {
  const [params, setParams] = useState({
    limit: 10,
    page: 1,
    isActive: true,
  });
  const { data, isLoading } = useGetPermissions(params);

  const dataSource = useMemo<TransferItem[]>(() => {
    const results = data?.data?.results || [];
    console.log(results);
    return results.map((r) => ({
      key: r.id,
      title: r.name,
      description: r.name,
    }));
  }, [data]);

  return (
    <>
      <Item label="Name" name="name" rules={[{ required: true, message: "Please input name!" }]}>
        <Input placeholder="Enter name" />
      </Item>
      <Item>
        <Transfer
          className="min-w-full"
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
      <Item label="Default" name="isDefault">
        <Switch />
      </Item>
    </>
  );
};

export default FormRole;
