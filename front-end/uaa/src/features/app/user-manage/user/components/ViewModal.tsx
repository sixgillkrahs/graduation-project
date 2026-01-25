import { useGetUser } from "../services/query";
import { Modal, Tag, Spin } from "antd";
import { memo } from "react";

const ViewModal = ({
  header,
  onCancel,
}: {
  header: {
    open: boolean;
    id: string | null;
    type: "VIEW" | "EDIT" | null;
  };
  onCancel: () => void;
}) => {
  const { data: user, isLoading } = useGetUser(header.id!);

  return (
    <Modal open={header.open} onCancel={onCancel} footer={null} width={600} centered>
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold">
              {user?.data.userId.fullName?.charAt(0)}
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold">{user?.data.userId?.fullName}</h2>
              <p className="text-sm text-gray-500">{user?.data.userId?.email}</p>
            </div>

            <Tag color="blue">{user?.data.roleId?.name}</Tag>
          </div>

          {/* Account Info */}
          <Section title="ACCOUNT INFORMATION">
            <Row label="Username" value={user?.data.username} />
            <Row label="Role" value={`${user?.data.roleId?.name} (${user?.data.roleId?.code})`} />
          </Section>

          {/* Personal Info */}
          <Section title="PERSONAL INFORMATION">
            <Row label="Full name" value={user?.data.userId?.fullName} />
            <Row label="Email" value={user?.data.userId?.email} />
            <Row label="Phone" value={user?.data.userId?.phone || "--"} />
            <Row
              label="Status"
              value={
                user?.data.userId?.isActive ? (
                  <Tag color="green">Active</Tag>
                ) : (
                  <Tag color="red">Inactive</Tag>
                )
              }
            />
          </Section>

          {/* Dates */}
          {/* <Section title="SYSTEM">
            <Row label="Created at" value={new Date(user.data.createdAt).toLocaleString()} />
            <Row label="Updated at" value={new Date(user.data.updatedAt).toLocaleString()} />
          </Section> */}
        </div>
      )}
    </Modal>
  );
};

export default memo(ViewModal);

/* ----------------- Sub Components ---------------- */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="mb-2 text-xs font-semibold text-gray-400">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);
