import { useGetInfiniteResources } from "../../resources/services/query";
import PermissionService from "../services/service";
import { Col, Form, Input, Row, Select, Switch } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const { Item } = Form;
const { TextArea } = Input;

const FormPermission = () => {
  const { t } = useTranslation();
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
      <Item
        label={t("permission.column.name")}
        name="name"
        rules={[{ required: true, message: t("permission.validate.name") }]}
      >
        <Input placeholder={t("permission.placeholder.enterPermissionName")} />
      </Item>
      <Row gutter={12}>
        <Col span={12}>
          <Item
            label={t("permission.column.operation")}
            name="operation"
            rules={[{ required: true, message: t("permission.validate.operation") }]}
          >
            <Select
              placeholder={t("permission.placeholder.enterOperation")}
              options={PermissionService.OPERATION.map((o) => ({ label: o.label, value: o.value }))}
            />
          </Item>
        </Col>
        <Col span={12}>
          <Item
            label={t("permission.column.resource")}
            name="resourceId"
            rules={[{ required: true, message: t("permission.validate.resource") }]}
          >
            <Select
              placeholder={t("permission.placeholder.resource")}
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
      <Item label={t("permission.column.description")} name="description">
        <TextArea placeholder={t("permission.placeholder.enterDescription")} />
      </Item>
      <Item label={t("permission.column.active")} name="isActive">
        <Switch />
      </Item>
    </>
  );
};

export default FormPermission;
