import { Form, Input } from "antd";

const { Item } = Form;
const { TextArea } = Input;

const FormResource = () => {
  return (
    <>
      <Item
        label="Name (EN)"
        name={["name", "en"]}
        rules={[{ required: true, message: "Please input English name!" }]}
      >
        <Input placeholder="Enter English name" />
      </Item>
      <Item
        label="Name (VI)"
        name={["name", "vi"]}
        rules={[{ required: true, message: "Please input Vietnamese name!" }]}
      >
        <Input placeholder="Enter Vietnamese name" />
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
