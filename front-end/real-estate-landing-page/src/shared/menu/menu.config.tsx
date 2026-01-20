import { Icon } from "@/components/ui/Icon";
import { MenuItem } from "@/components/ui/siderbar";

export const sidebarMenu: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <Icon.Dashboard />,
    url: "/agent/dashboard",
  },
  {
    title: "My Listings",
    icon: <Icon.Building />,
    url: "/agent/listings",
  },
  {
    title: "Landlord",
    icon: <Icon.Group />,
    url: "/agent/landlord",
  },
  {
    title: "Leads & CRM",
    icon: <Icon.Group />,
    url: "/agent/crm",
  },
  {
    title: "Schedule",
    icon: <Icon.CalendarSchedule />,
    url: "/agent/schedule",
  },
  {
    title: "Messages",
    icon: <Icon.Message />,
    url: "/agent/messages",
  },
];
