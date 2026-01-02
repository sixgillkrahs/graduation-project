import { useProfile } from "./services/query";

const Profile = () => {
  const { data: profile } = useProfile();

  const profileData = profile?.data;

  return (
    <section className="rounded-2xl p-6 md:p-8 shadow-lg relative">
      <div className="flex justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 p-4">
            <div className="rounded-full bg-gray-200 p-4 size-36 flex items-center justify-center">
              <img
                src="/avatar.png"
                alt="avatar"
                className="w-full h-full rounded-full"
              />
            </div>
            <div className="grid gap-2">
              <h3 className="cs-typography text-[24px]!">
                {profileData?.nameRegister}
              </h3>
              <h3 className="cs-typography text-[24px]!">
                {profileData?.email}
              </h3>
              <h3 className="cs-typography text-[24px]!">
                {profileData?.phoneNumber}
              </h3>
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </section>
  );
};

export default Profile;
