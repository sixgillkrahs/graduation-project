import { useGetInfiniteResources } from "../../resources/services/query";
import PermissionService from "../services/service";
import { Col, Form, Input, Row, Select, Switch } from "antd";
import { useMemo, useState } from "react";

const { Item } = Form;
const { TextArea } = Input;

const FormPermission = () => {
  const [params, setParams] = useState({
    limit: 10,
    page: 1,
  });
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetInfiniteResources(params);

  const resourceOptions = useMemo(() => {
    const pages = data?.pages || [];
    return pages.flatMap((p: any) =>
      (p?.data?.results || []).map((r: any) => ({ label: r.name, value: r.id })),
    );
  }, [data?.pages]);

  return (
    <>
      <Item label="Name" name="name" rules={[{ required: true, message: "Please input name!" }]}>
        <Input placeholder="Enter name" />
      </Item>
      <Row gutter={12}>
        <Col span={12}>
          <Item
            label="Operation"
            name="operation"
            rules={[{ required: true, message: "Please select operation!" }]}
          >
            <Select
              placeholder="Select operation"
              options={PermissionService.OPERATION.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Item>
        </Col>
        <Col span={12}>
          <Item
            label="Resource"
            name="resourceId"
            rules={[{ required: true, message: "Please select resource!" }]}
          >
            <Select
              placeholder="Select resource"
              options={resourceOptions}
              loading={isLoading || isFetchingNextPage}
              showSearch={{
                filterOption: (input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase()),
                onSearch: (val) => setParams((p) => ({ ...p, query: val })),
              }}
              onPopupScroll={(e) => {
                const target = e.target as HTMLDivElement;
                const nearBottom =
                  target.scrollTop + target.clientHeight >= target.scrollHeight - 32;
                if (nearBottom && hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
            />
          </Item>
        </Col>
      </Row>
      <Item label="Description" name="description">
        <TextArea placeholder="Enter description" />
      </Item>
      <Item label="Active" name="isActive">
        <Switch />
      </Item>
    </>
  );
};

export default FormPermission;
