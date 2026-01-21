import { Icon } from "@/components/ui/Icon";
import { MenuItem } from "@/components/custom/siderbar";
import { Building2, LayoutDashboard, Users } from "lucide-react";
import { CalendarSchedule } from "@/components/ui/Icon/CalendarSchedule";

export const sidebarMenu: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard />,
    url: "/agent/dashboard",
  },
  {
    title: "My Listings",
    icon: <Building2 />,
    url: "/agent/listings",
  },
  {
    title: "Landlord",
    icon: <Users />,
    url: "/agent/landlord",
  },
  {
    title: "Leads & CRM",
    icon: <Users />,
    url: "/agent/crm",
  },
  {
    title: "Schedule",
    icon: <CalendarSchedule />,
    url: "/agent/schedule",
  },
  {
    title: "Messages",
    icon: <Icon.Message />,
    url: "/agent/messages",
  },
];
