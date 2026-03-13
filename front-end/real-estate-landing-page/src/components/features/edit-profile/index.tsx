"use client";

import { useProfile } from "../profile/services/query";
import BuyerEditProfile from "./BuyerEditProfile";
import AgentEditProfile from "./AgentEditProfile";

const EditProfile = () => {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  if (profile?.data?.roleId === "USER") {
    return <BuyerEditProfile />;
  }

  return <AgentEditProfile />;
};

export default EditProfile;
