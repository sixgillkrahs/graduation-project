import { Form, Input } from "antd";

const { Item } = Form;
const { TextArea } = Input;

const FormResource = () => {
  return (
    <>
      <Item label="Name" name="name" rules={[{ required: true, message: "Please input name!" }]}>
        <Input placeholder="Enter name" />
      </Item>
      <Item label="Path" name="path" rules={[{ required: true, message: "Please input path!" }]}>
        <Input prefix="/api/" placeholder="Enter path" />
      </Item>
      <Item label="Description" name="description">
        <TextArea placeholder="Enter description" />
      </Item>
    </>
  );
};

export default FormResource;
