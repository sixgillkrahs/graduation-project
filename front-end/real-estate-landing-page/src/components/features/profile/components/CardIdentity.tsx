import { Icon } from "@/components/ui";
import RenderField from "./RenderField";
import { useState } from "react";

const CardIdentity = ({
  identityInfo,
}: {
  identityInfo: IProfileService.IdentityInfo | undefined;
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="bg-white rounded-[18px]">
      <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4  px-8 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="size-5 flex items-center justify-center bg-black/10 p-2 rounded-lg box-content">
            <Icon.IdCard className="size-5" />
          </div>{" "}
          <div>
            Legal Identity{" "}
            <div className="text-[12px]! font-bold! text-black/50">
              {" "}
              Sensitive Information
            </div>
          </div>
        </div>
        <div>
          {visible ? (
            <Icon.EyeClose
              className="size-5 cursor-pointer"
              onClick={() => setVisible(false)}
            />
          ) : (
            <Icon.Eye
              className="size-5 cursor-pointer"
              onClick={() => setVisible(true)}
            />
          )}
        </div>
      </div>
      <div className="grid gap-4 py-4 px-8">
        <RenderField label="Full Name" value={identityInfo?.fullName || ""} />
        <div className="flex gap-20">
          <RenderField
            label="ID Number"
            value={
              visible
                ? identityInfo?.IDNumber || ""
                : identityInfo?.IDNumber?.substring(0, 4) +
                  "********" +
                  identityInfo?.IDNumber?.substring(12)
            }
          />
          <RenderField label="Gender" value={identityInfo?.gender || ""} />
        </div>
        <RenderField
          label="Date of Birth"
          value={identityInfo?.dateOfBirth || ""}
        />
      </div>
    </div>
  );
};

export default CardIdentity;
