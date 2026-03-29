import { Modal } from "@/components/ui";
import { getAgentCmsCopy } from "@/lib/agent-cms-copy";
import { useLocale } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { useChangePassword } from "../../profile/services/mutate";
import { Password } from "@/components/ui/password";
import { CsButton } from "@/components/custom";

export const ModalChangePassword = ({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) => {
  const copy = getAgentCmsCopy(useLocale()).profile.passwordModal;
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
    <Modal open={open} onCancel={onCancel} title={copy.title}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="oldPassword"
          control={control}
          rules={{
            required: copy.oldPasswordRequired,
          }}
          render={({ field }) => (
            <Password
              label={copy.oldPassword}
              placeholder={copy.oldPassword}
              error={errors.oldPassword?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="newPassword"
          control={control}
          rules={{
            required: copy.newPasswordRequired,
          }}
          render={({ field }) => (
            <Password
              label={copy.newPassword}
              placeholder={copy.newPassword}
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
            required: copy.confirmPasswordRequired,
          }}
          render={({ field }) => (
            <Password
              label={copy.confirmPassword}
              placeholder={copy.confirmPassword}
              type={"password"}
              error={errors.confirmPassword?.message}
              {...field}
            />
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <CsButton type="button" className="text-black " onClick={onCancel}>
            {copy.cancel}
          </CsButton>
          <CsButton
            type="submit"
            className="cs-bg-black text-white"
            loading={isPending}
          >
            {copy.submit}
          </CsButton>
        </div>
      </form>
    </Modal>
  );
};
