import { CsDialog } from "@/components/ui/dialog";
import { Password } from "@/components/ui/password";
import { Controller, useForm } from "react-hook-form";
import { useChangePassword } from "../../profile/services/mutate";

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
    <CsDialog
      open={open}
      title="Change Password"
      description="Please enter your old password and new password to change your password."
      onCancel={onCancel}
      formId="form-change-pass"
      okProps={{
        okText: "Change Password",
        type: "submit",
        loading: isPending,
      }}
      cancelProps={{
        cancelText: "Cancel",
        type: "button",
      }}
      closeOnClickOutside={false}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        id="form-change-pass"
      >
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
              error={errors.confirmPassword?.message}
              {...field}
            />
          )}
        />
      </form>
    </CsDialog>
  );
};
