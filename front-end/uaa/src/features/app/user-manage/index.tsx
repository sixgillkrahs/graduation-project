import Resources from "./resources";
import Roles from "./roles";
import { Tabs } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const UserManager = () => {
  const [selected, setSelected] = useState("roles");
  const [searchParams, setSearchParams] = useSearchParams();
  const handleSelectionChange = (key: string) => {
    setSelected(key);
    setSearchParams({ tab: key });
  };

  useEffect(() => {
    const tabFromParams = searchParams.get("tab");
    if (tabFromParams && ["roles", "permissions", "resources"].includes(tabFromParams)) {
      setSelected(tabFromParams);
    } else {
      setSelected("roles");
      setSearchParams({ tab: "roles" });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex w-full flex-col">
      <Tabs
        type="card"
        aria-label="Options"
        activeKey={selected}
        onChange={handleSelectionChange}
        destroyOnHidden={true}
        items={[
          {
            key: "roles",
            label: "Roles",
            children: <Roles />,
          },
          {
            key: "permissions",
            label: "Permissions",
            // children: <Permissions />,
          },
          {
            key: "resources",
            label: "Resources",
            children: <Resources />,
          },
        ]}
      />
    </div>
  );
};

export default UserManager;
