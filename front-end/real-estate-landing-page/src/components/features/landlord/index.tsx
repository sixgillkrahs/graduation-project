"use client";

import { IParamsPagination } from "@/@types/service";
import { CsButton } from "@/components/custom";
import { Input } from "@/components/ui/input";
import { CsTable, TableColumn } from "@/components/ui/table";
import useDebounce from "@/hooks/useDebounce";
import { EditIcon, EyeIcon, Plus, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ModalAdd from "./components/ModalAdd";
import { useLandlords } from "./services/query";
import { useDeleteLandlord } from "./services/mutate";
import { CsAlert } from "@/components/custom/alert";
import { getAgentCmsCopy } from "@/lib/agent-cms-copy";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ROUTES } from "@/const/routes";

export const Landlord = () => {
  const copy = getAgentCmsCopy(useLocale()).landlord;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [selectedLandlord, setSelectedLandlord] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { mutateAsync: deleteLandlord, isPending: isDeleting } =
    useDeleteLandlord();
  const [pagination, setPagination] = useState<IParamsPagination>({
    page: 1,
    limit: 10,
    search: "",
    sortField: "createdAt",
    sortOrder: "desc",
  });
  const { data: landlords, isLoading } = useLandlords(pagination);
  const [openModalAdd, setOpenModalAdd] = useState(false);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
      search: debouncedSearch,
    }));
  }, [debouncedSearch]);

  const handleDelete = (id: string) => {
    setSelectedLandlord(id);
    setOpenAlert(true);
  };

  const columns: TableColumn<any>[] = [
    {
      title: copy.columns.name,
      dataIndex: "name",
      key: "name",
    },
    {
      title: copy.columns.email,
      dataIndex: "email",
      key: "email",
    },
    {
      title: copy.columns.phone,
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: copy.columns.action,
      dataIndex: "action",
      key: "action",
      render(_value, record, _index) {
        return (
          <div className="flex gap-2">
            <CsButton
              icon={<EyeIcon />}
              onClick={() => handleView(record.id)}
            />
            <CsButton
              icon={<EditIcon />}
              onClick={() => handleEdit(record.id)}
            />
            <CsButton
              icon={<Trash />}
              className="bg-red-600!"
              onClick={() => handleDelete(record.id)}
              disabled={isDeleting}
            />
          </div>
        );
      },
    },
  ];

  const handleClose = useCallback(() => {
    setOpenModalAdd(false);
  }, []);

  const handleOpen = () => {
    setOpenModalAdd(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedLandlord) {
      await deleteLandlord(selectedLandlord);
      setOpenAlert(false);
      setSelectedLandlord(null);
    }
  };

  const handleView = (id: string) => {
    router.push(ROUTES.AGENT_LANDLORD_DETAIL(id));
  };

  const handleEdit = (id: string) => {
    setSelectedLandlord(id);
    setOpenModalAdd(true);
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center ">
        <div>
          <h1 className="cs-typography text-2xl">{copy.pageTitle}</h1>
          <span className="cs-paragraph-gray">{copy.pageSubtitle}</span>
        </div>
        <CsButton
          className="cs-bg-black text-white"
          onClick={handleOpen}
          icon={<Plus className="text-white! text-2xl" />}
        >
          {copy.addLandlord}
        </CsButton>
      </div>
      <div className="grid gap-4">
        <div className="flex justify-end p-2 rounded-2xl border border-input">
          <Input
            placeholder={copy.searchPlaceholder}
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CsTable
          columns={columns}
          dataSource={landlords?.data.results || []}
          rowKey={(record: any) => record.id}
          loading={isLoading || isDeleting}
          emptyText={copy.empty}
          key={"id"}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: landlords?.data.totalResults || 0,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                page,
                limit: pageSize,
              }));
            },
          }}
        />
      </div>
      <ModalAdd
        open={openModalAdd}
        onCancel={handleClose}
        id={selectedLandlord || undefined}
      />
      <CsAlert
        open={openAlert}
        onOpenChange={setOpenAlert}
        title={copy.alert.title}
        description={copy.alert.description}
        action={copy.alert.action}
        cancel={copy.alert.cancel}
        actionClick={handleConfirmDelete}
        cancelClick={handleClose}
        actionClassName="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};
