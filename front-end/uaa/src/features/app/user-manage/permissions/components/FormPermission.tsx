import { useGetInfiniteResources } from "../../resources/services/query";
import { Col, Form, Input, Row, Select } from "antd";
import type { BaseOptionType } from "antd/es/select";

const { Item } = Form;
const { TextArea } = Input;
const options: BaseOptionType[] = [
  {
    label: "Read",
    value: "READ",
  },
  {
    label: "Write",
    value: "WRITE",
  },
  {
    label: "Update",
    value: "UPDATE",
  },
  {
    label: "Delete",
    value: "DELETE",
  },
  {
    label: "Approve",
    value: "APPROVE",
  },
  {
    label: "Export",
    value: "EXPORT",
  },
];

const FormPermission = () => {
  const { data, isLoading } = useGetInfiniteResources({
    limit: 10,
    page: 1,
  });

  console.log(data);
  return (
    <>
      <Item label="Name" name="name" rules={[{ required: true, message: "Please input name!" }]}>
        <Input placeholder="Enter name" />
      </Item>
      <Row gutter={12}>
        <Col span={12}>
          <Item label="Operation" name="operation">
            <Select placeholder="Select operation" options={options} />
          </Item>
        </Col>
        <Col span={12}>
          <Item label="Resource" name="resource">
            <Select placeholder="Select resource" />
          </Item>
        </Col>
      </Row>
      <Item label="Description" name="description">
        <TextArea placeholder="Enter description" />
      </Item>
    </>
  );
};

export default FormPermission;
