import { Icon } from "@/components/ui";
import { getAgentCmsCopy } from "@/lib/agent-cms-copy";
import { Eye, EyeClosed } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import RenderField from "./RenderField";

const CardIdentity = ({
  identityInfo,
}: {
  identityInfo: IProfileService.IdentityInfo | undefined;
}) => {
  const [visible, setVisible] = useState(false);
  const copy = getAgentCmsCopy(useLocale()).profile;
  return (
    <div className="bg-white rounded-[18px]">
      <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4  px-8 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="size-5 flex items-center justify-center bg-black/10 p-2 rounded-lg box-content">
            <Icon.IdCard className="size-5" />
          </div>{" "}
          <div>
            {copy.identity.title}{" "}
            <div className="text-[12px]! font-bold! text-black/50">
              {" "}
              {copy.identity.sensitive}
            </div>
          </div>
        </div>
        <div>
          {visible ? (
            <EyeClosed
              className="size-5 cursor-pointer"
              onClick={() => setVisible(false)}
            />
          ) : (
            <Eye
              className="size-5 cursor-pointer"
              onClick={() => setVisible(true)}
            />
          )}
        </div>
      </div>
      <div className="grid gap-4 py-4 px-8">
        <RenderField
          label={copy.identity.fullName}
          value={identityInfo?.fullName || ""}
        />
        <div className="flex gap-20">
          <RenderField
            label={copy.identity.idNumber}
            value={
              visible
                ? identityInfo?.IDNumber || ""
                : identityInfo?.IDNumber?.substring(0, 4) +
                  "********" +
                  identityInfo?.IDNumber?.substring(12)
            }
          />
          <RenderField
            label={copy.identity.gender}
            value={identityInfo?.gender || ""}
          />
        </div>
        <RenderField
          label={copy.identity.dateOfBirth}
          value={identityInfo?.dateOfBirth || ""}
        />
      </div>
    </div>
  );
};

export default CardIdentity;
