"use client";

import { Icon } from "@/components/ui";
import ModalAdd from "./components/ModalAdd";
import { useCallback, useState } from "react";
import {
  RippleButton,
  RippleButtonRipples,
} from "@/components/animate-ui/components/buttons/ripple";
import { CsButton } from "@/components/custom";
import { Eye } from "lucide-react";
import { Table } from "@/components/ui/table";

export const Landlord = () => {
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const columns: any[] = [
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
      key: "action",
      render: () => (
        <div className="flex gap-2">
          <CsButton variant={"outline"} icon={<Eye className="w-4 h-4" />} />
          <CsButton
            variant={"outline"}
            icon={<Icon.Edit className="w-4 h-4" />}
          />
          <CsButton
            variant={"outline"}
            icon={<Icon.DeleteBin className="text-red-500 w-4 h-4" />}
          />
        </div>
      ),
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
        <RippleButton className="cs-bg-black text-white" onClick={handleOpen}>
          Add Landlord
          <RippleButtonRipples />
        </RippleButton>
      </div>
      <div>
        <Table columns={[]} dataSource={data} rowKey="id" />
      </div>
      <ModalAdd open={openModalAdd} onCancel={handleClose} />
    </div>
  );
};
