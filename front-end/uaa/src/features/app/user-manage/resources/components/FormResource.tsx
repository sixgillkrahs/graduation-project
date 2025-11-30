import { Form, Input, type FormInstance } from "antd";

const { Item } = Form;
const { TextArea } = Input;

const FormResource = ({ form }: { form: FormInstance }) => {
  return (
    <Form layout="vertical" form={form}>
      <Item label="Name" name="name" rules={[{ required: true, message: "Please input name!" }]}>
        <Input placeholder="Enter name" />
      </Item>
      <Item label="Path" name="path" rules={[{ required: true, message: "Please input path!" }]}>
        <Input prefix="/api/" placeholder="Enter path" />
      </Item>
      <Item label="Description" name="description">
        <TextArea placeholder="Enter description" />
      </Item>
    </Form>
  );
};

export default FormResource;
