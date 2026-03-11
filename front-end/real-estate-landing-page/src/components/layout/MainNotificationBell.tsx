"use client";

import NotificationBell from "@/components/layout/NotificationBell";

type MainNotificationBellProps = {
  isAuthenticated: boolean;
};

const MainNotificationBell = ({
  isAuthenticated,
}: MainNotificationBellProps) => {
  return <NotificationBell isAuthenticated={isAuthenticated} />;
};

export default MainNotificationBell;
