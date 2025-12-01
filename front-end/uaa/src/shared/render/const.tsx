import { Tag } from "antd";

function renderConstant(
  value: string,
  constant: { value: string; label: string; color: string }[],
) {
  return (
    <Tag color={constant.find((item) => item.value === value)?.color || "default"} variant="solid">
      {constant.find((item) => item.value === value)?.label || value}
    </Tag>
  );
}

export { renderConstant };
