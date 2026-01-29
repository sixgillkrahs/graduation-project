import type { IProperty } from "../../model/property.model";
import { useGetPropertiesPending } from "../../services/query";
import FullTable from "@/components/FullTable";
import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { LIST_PROVINCE, LIST_WARD, findOptionLabel } from "gra-helper";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const PropertiesPending = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      title: t("properties.status"),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "PENDING" ? "orange" : status === "APPROVED" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
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
    navigate(`/properties/pending/${record.id}`);
  };

  return (
    <FullTable<IProperty>
      columns={columns}
      isExport={false}
      isAdd={false}
      isView={false}
      isEdit={false}
      isDetail={true}
      useGetList={useGetPropertiesPending}
      onDetail={handleDetail}
    />
  );
};

export default PropertiesPending;
