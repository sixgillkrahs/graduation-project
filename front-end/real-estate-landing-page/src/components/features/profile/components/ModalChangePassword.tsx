import { Modal } from "@/components/ui";
import { Controller, useForm } from "react-hook-form";
import { useChangePassword } from "../services/mutate";
import { Password } from "@/components/ui/password";
import { CsButton } from "@/components/custom";

export const ModalChangePassword = ({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) => {
  const { mutateAsync: changePassword, isPending } = useChangePassword();
  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<IProfileService.ChangePasswordRequest>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: IProfileService.ChangePasswordRequest) => {
    await changePassword(data);
    reset({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    onCancel();
  };

  return (
    <Modal open={open} onCancel={onCancel} title="Change Password">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="oldPassword"
          control={control}
          rules={{
            required: "Old password is required",
          }}
          render={({ field }) => (
            <Password
              label="Old Password"
              placeholder="Old Password"
              error={errors.oldPassword?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="newPassword"
          control={control}
          rules={{
            required: "New password is required",
          }}
          render={({ field }) => (
            <Password
              label="New Password"
              placeholder="New Password"
              type={"password"}
              error={errors.newPassword?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: "Confirm password is required",
          }}
          render={({ field }) => (
            <Password
              label="Confirm Password"
              placeholder="Confirm Password"
              type={"password"}
              error={errors.confirmPassword?.message}
              {...field}
            />
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <CsButton type="submit" className="text-black " onClick={onCancel}>
            Cancel
          </CsButton>
          <CsButton
            type="submit"
            className="cs-bg-black text-white"
            loading={isPending}
          >
            Change Password
          </CsButton>
        </div>
      </form>
    </Modal>
  );
};
