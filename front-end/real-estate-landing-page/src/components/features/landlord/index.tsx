"use client";

import { CsButton } from "@/components/custom";
import { CsTable, TableColumn } from "@/components/ui/table";
import { EditIcon, Trash } from "lucide-react";
import { useCallback, useState } from "react";
import ModalAdd from "./components/ModalAdd";
import { useLandlords } from "./services/query";

export const Landlord = () => {
  const { data: landlords, isLoading } = useLandlords();
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const columns: TableColumn<any>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render(_value, _record, _index) {
        return (
          <div className="flex gap-2">
            <CsButton icon={<EditIcon />} />
            <CsButton icon={<Trash />} className="bg-red-600!" />
          </div>
        );
      },
    },
  ];

  const data = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "098-765-4321",
    },
  ];

  const handleClose = useCallback(() => {
    setOpenModalAdd(false);
  }, []);

  const handleOpen = () => {
    setOpenModalAdd(true);
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center ">
        <div>
          <h1 className="cs-typography text-2xl">List Landlord</h1>
          <span className="cs-paragraph-gray"> Landlord</span>
        </div>
        <CsButton className="cs-bg-black text-white" onClick={handleOpen}>
          Add Landlord
        </CsButton>
      </div>
      <div>
        <CsTable
          columns={columns}
          dataSource={landlords?.data.results || data}
          rowKey={(record: any) => record.id}
        />
      </div>
      <ModalAdd open={openModalAdd} onCancel={handleClose} />
    </div>
  );
};
