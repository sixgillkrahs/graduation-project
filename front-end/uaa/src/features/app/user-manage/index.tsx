import Permissions from "./permissions";
import Resources from "./resources";
import Roles from "./roles";
import { Tab, Tabs } from "@heroui/tabs";
import { useState, type Key } from "react";

const TabsArray = [
  {
    key: "roles",
    title: "Roles",
    component: Roles,
  },
  {
    key: "permissions",
    title: "Permissions",
    component: Permissions,
  },
  {
    key: "resources",
    title: "Resources",
    component: Resources,
  },
];

const UserManager = () => {
  const [selected, setSelected] = useState("roles");
  const handleSelectionChange = (key: Key) => setSelected(key as string);

  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="Options" selectedKey={selected} onSelectionChange={handleSelectionChange}>
        {TabsArray.map((tab) => (
          <Tab key={tab.key} title={tab.title}>
            {<tab.component />}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default UserManager;
