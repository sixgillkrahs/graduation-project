import type { IProperty } from "../../model/property.model";
import { useGetPropertiesRejected } from "../../services/query";
import FullTable from "@/components/FullTable";
import { Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { LIST_PROVINCE, LIST_WARD, findOptionLabel } from "gra-helper";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const PropertiesRejected = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "STREET_HOUSE", "VILLA", "LAND", "OTHER"].map(
    (type) => ({ label: type, value: type }),
  );

  const DEMAND_TYPES = [
    { label: t("common.sale"), value: "SALE" },
    { label: t("common.rent"), value: "RENT" },
  ];

  const columns: ColumnsType<any> = [
    {
      title: t("properties.propertyType"),
      dataIndex: "propertyType",
      key: "propertyType",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: t("properties.demandType"),
      dataIndex: "demandType",
      key: "demandType",
      render: (type) =>
        type === "SALE" ? (
          <Tag color="green">{t("common.sale")}</Tag>
        ) : (
          <Tag color="orange">{t("common.rent")}</Tag>
        ),
    },
    {
      title: t("properties.area"),
      dataIndex: ["features", "area"],
      key: "area",
    },
    {
      title: t("properties.price"),
      key: "price",
      render: (_, record) => `${record.features.price} ${record.features.priceUnit}`,
    },
    {
      title: t("properties.location"),
      dataIndex: ["location", "address"],
      key: "address",
      render: (_, record) =>
        `${findOptionLabel(record.location.ward, LIST_WARD)}, ${findOptionLabel(
          record.location.province,
          LIST_PROVINCE,
        )}`,
    },
    {
      title: t("properties.poster"),
      dataIndex: ["userId", "fullName"],
      key: "fullName",
    },
    {
      title: t("properties.phone"),
      dataIndex: ["userId", "phone"],
      key: "phone",
    },
    {
      title: "Reason",
      dataIndex: "rejectReason",
      key: "rejectReason",
      render: (reason) => {
        if (!reason) return <span className="text-gray-400">-</span>;
        return (
          <Tooltip title={reason}>
            <div className="max-w-[150px] truncate font-medium text-red-600">{reason}</div>
          </Tooltip>
        );
      },
    },
    {
      title: t("properties.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const handleDetail = (record: IProperty) => {
    navigate(`/properties/rejected/${record.id}`);
  };

  return (
    <FullTable<IProperty>
      columns={columns}
      isExport={false}
      isAdd={false}
      isView={false}
      isEdit={false}
      isDetail={true}
      isDelete={false}
      useGetList={useGetPropertiesRejected}
      onDetail={handleDetail}
      filter={[
        {
          type: "input",
          placeholder: t("properties.poster"),
          name: ["userId", "fullName"],
        },
        {
          type: "input",
          placeholder: t("properties.phone"),
          name: ["userId", "phone"],
        },
        {
          name: "propertyType",
          type: "select",
          options: PROPERTY_TYPES,
          placeholder: t("properties.propertyType"),
        },
        {
          name: "demandType",
          type: "select",
          options: DEMAND_TYPES,
          placeholder: t("properties.demandType"),
        },
        {
          type: "date",
          placeholder: t("properties.createdAt"),
          name: ["createdAt"],
        },
      ]}
    />
  );
};

export default PropertiesRejected;
