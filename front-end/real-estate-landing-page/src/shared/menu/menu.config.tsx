import { MenuItem } from "@/components/ui/Menu/menu.types";
import { Icon } from "@/components/ui/Icon";

export const sidebarMenu: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <Icon.Dashboard />,
    href: "/agent/dashboard",
  },
  {
    key: "listings",
    label: "My Listings",
    icon: <Icon.Building />,
    href: "/agent/listings",
  },
  {
    key: "crm",
    label: "Leads & CRM",
    icon: <Icon.Group />,
    href: "/agent/crm",
  },
  {
    key: "schedule",
    label: "Schedule",
    icon: <Icon.CalendarSchedule />,
    href: "/agent/schedule",
  },
  {
    key: "messages",
    label: "Messages",
    icon: <Icon.Message />,
    href: "/agent/messages",
  },
];
