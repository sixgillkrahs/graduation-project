import { Button, Icon, Tag } from "@/components/ui";
import { useProfile } from "./services/query";
import RenderField from "./components/RenderField";
import CardField from "./components/CardField";
import CardIdentity from "./components/CardIdentity";

const Profile = () => {
  const { data: profile } = useProfile();

  const profileData = profile?.data;

  console.log(profileData);

  return (
    <section className="p-6 md:p-8 container mx-auto grid gap-6">
      <div className="flex justify-between items-center gap-4 p-8  w-full rounded-[18px] bg-black/10">
        <div className="">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gray-200 p-4 size-36 flex items-center justify-center">
              <img
                src="/avatar.png"
                alt="avatar"
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="grid gap-2">
              <span className="cs-typography text-[30px]! font-bold!">
                {profileData?.basicInfo.nameRegister}
              </span>
              <span className="cs-typography text-[16px]! flex gap-2 items-center">
                <Icon.Mail className="size-5" /> {profileData?.basicInfo.email}
              </span>
              <span className="cs-typography text-[16px]! flex gap-2 items-center">
                <Icon.Phone className="size-5" />{" "}
                {profileData?.basicInfo.phoneNumber}
              </span>
              <div className="bg-[#F7F7F7] main-color-red w-fit font-bold text-center px-3 py-1 rounded-lg flex items-center gap-2 text-[12px]!">
                {profileData?.businessInfo && <>Real Estate Agent</>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="text-black"
            outline
            icon={<Icon.RotateLock className="size-5" />}
          >
            Change Password
          </Button>
          <Button
            className="cs-bg-black text-white"
            icon={<Icon.Pencil className="size-5" />}
          >
            Edit Profile
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-black/10 rounded-[18px]">
          <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4  px-8 flex items-center gap-2">
            <div className="size-5 flex items-center justify-center bg-white p-2 rounded-lg box-content">
              <Icon.User className="size-5" />
            </div>{" "}
            Contact Info
          </div>
          <div className="grid gap-4 py-4 px-8">
            <RenderField
              label="Phone Number"
              value={profileData?.basicInfo.phoneNumber || ""}
            />
            <RenderField
              label="Email"
              value={profileData?.basicInfo.email || ""}
            />
            <RenderField
              label="Address"
              value={profileData?.basicInfo.identityInfo.placeOfBirth || ""}
            />
          </div>
        </div>
        <div className="bg-black/10 rounded-[18px]">
          <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4  px-8 flex items-center gap-2">
            <div className="size-5 flex items-center justify-center bg-white p-2 rounded-lg box-content">
              <Icon.Briefcase className="size-5" />
            </div>{" "}
            Professional Profile
          </div>
          <div className="grid gap-4 py-4 px-8 b">
            <div className="grid grid-cols-2 gap-4">
              <CardField
                title="Experience"
                value={
                  <span>
                    <span className="cs-typography text-[18px]! font-bold!">
                      {profileData?.businessInfo.yearsOfExperience}
                    </span>{" "}
                    <span className="cs-paragraph-gray text-[14px]! font-bold!">
                      years
                    </span>
                  </span>
                }
              />
              <CardField
                title="Rating"
                value={
                  <span className="flex items-center gap-1 ">
                    <span className="cs-typography text-[18px]! font-bold!">
                      {profileData?.businessInfo.yearsOfExperience}
                    </span>{" "}
                    <Icon.Star className="size-3 " />
                  </span>
                }
              />
            </div>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <div className="cs-paragraph-gray text-[14px]! font-bold! uppercase">
                  Tax Code
                </div>
                <CardField value={profileData?.businessInfo.taxCode || ""} />
              </div>
              <div className="grid gap-1">
                <div className="cs-paragraph-gray text-[14px]! font-bold! uppercase">
                  Certificate Number
                </div>
                <CardField
                  value={profileData?.businessInfo.certificateNumber || ""}
                />
              </div>
            </div>
            <div className="my-4 bg-black/10 w-full h-px" />
            <div className="grid gap-2">
              <span className="flex items-center gap-2 cs-typography text-[14px]! font-bold!">
                <span>
                  <Icon.VerifiedBadge className="size-5" />
                </span>{" "}
                Specialization
              </span>
              <div className="flex flex-wrap gap-2">
                {profileData?.businessInfo.specialization.map((item) => {
                  return (
                    <Tag
                      key={item}
                      title={item}
                      className="text-[14px]! text-black! font-bold!"
                    />
                  );
                })}
              </div>
            </div>
            <div className="my-4 bg-black/10 w-full h-px" />
            <div className="grid gap-2">
              <span className="flex items-center gap-2 cs-typography text-[14px]! font-bold!">
                <span>
                  <Icon.MapPin className="size-5" />
                </span>{" "}
                Working Area
              </span>
              <div className="flex flex-wrap gap-2">
                {profileData?.businessInfo.workingArea.map((item) => {
                  return (
                    <Tag
                      key={item}
                      title={item}
                      className="text-[14px]! text-black! font-bold!"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <CardIdentity identityInfo={profileData?.basicInfo.identityInfo} />
          <div className="bg-black/10 rounded-[18px] h-full">
            <div className="cs-typography text-[16px]! font-bold! border-b border-b-black/10 py-4  px-8 flex items-center gap-2">
              <div className="size-5 flex items-center justify-center bg-white p-2 rounded-lg box-content">
                <Icon.IdCard className="size-5" />
              </div>{" "}
              Documents
            </div>
            <div className="grid gap-4 py-4 px-8">
              <div className="grid gap-2">
                <div className="cs-paragraph text-[14px]! font-bold! uppercase">
                  Identity Card
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-full h-20 bg-black/10 rounded-[12px]"></div>
                  <div className="w-full h-20 bg-black/10 rounded-[12px]"></div>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="cs-paragraph text-[14px]! font-bold! uppercase">
                  Business License
                </div>
                <div className="w-full h-20 bg-black/10 rounded-[12px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
