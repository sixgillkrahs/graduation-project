import { CsButton } from "@/components/custom";
import ListChat from "@/components/features/message/components/ListChat";
import { Input } from "@/components/ui/input";
import { ListFilter, Search } from "lucide-react";
import React from "react";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex gap-4 h-screen w-full">
      <div className="w-80 rounded-2xl border py-3 flex flex-col gap-3">
        <div className="flex gap-2 items-center px-3">
          <Input
            preIcon={<Search className="w-4 h-4" />}
            placeholder="Search"
          />
          <div className="flex items-center">
            <CsButton size={"icon-lg"}>
              <ListFilter />
            </CsButton>
          </div>
        </div>
        <ListChat />
      </div>
      <div className="flex-1 border p-3 rounded-2xl">{children}</div>
    </div>
  );
};

export default Sidebar;
