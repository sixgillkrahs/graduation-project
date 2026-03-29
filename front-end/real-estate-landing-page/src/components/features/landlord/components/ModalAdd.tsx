import { CsDialog } from "@/components/custom/dialog";
import { Icon } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { CreateLandlordRequest } from "@/components/features/landlord/dto/landlord.model";
import { getAgentCmsCopy } from "@/lib/agent-cms-copy";
import { memo, useEffect } from "react";
import { useLocale } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { useCreateLandlord, useUpdateLandlord } from "../services/mutate";
import { useLandlordDetail } from "../services/query";

const ModalAdd = ({
  open,
  onCancel,
  id,
}: {
  open: boolean;
  onCancel: () => void;
  id?: string;
}) => {
  const copy = getAgentCmsCopy(useLocale()).landlord.modal;
  const { data: landlordDetail, isLoading: isLoadingLandlordDetail } =
    useLandlordDetail(id || "");
  const { mutateAsync: createLandlord, isPending: isCreating } =
    useCreateLandlord();
  const { mutateAsync: updateLandlord, isPending: isUpdating } =
    useUpdateLandlord();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLandlordRequest>({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
    },
  });

  useEffect(() => {
    if (landlordDetail && id) {
      reset({
        name: landlordDetail.data.name,
        email: landlordDetail.data.email,
        phoneNumber: landlordDetail.data.phoneNumber,
        address: landlordDetail.data.address,
      });
    }
  }, [landlordDetail, id, reset]);

  const onSubmit = async (data: CreateLandlordRequest) => {
    if (id) {
      await updateLandlord({ id, data });
    } else {
      await createLandlord(data);
    }
    reset();
    onCancel();
  };

  return (
    <CsDialog
      title={id ? copy.editTitle : copy.addTitle}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit(onSubmit)}
      okText={id ? copy.editAction : copy.addAction}
      loading={isCreating || isUpdating || isLoadingLandlordDetail}
    >
      <form className="flex flex-col gap-4">
        <Controller
          name="name"
          control={control}
          rules={{ required: copy.validation.fullName }}
          render={({ field }) => (
            <Input
              preIcon={<Icon.User className="main-color-gray w-5 h-5" />}
              label={copy.fullName}
              placeholder={copy.placeholders.fullName}
              error={errors.name?.message}
              {...field}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="email"
            control={control}
            rules={{
              required: copy.validation.email,
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: copy.validation.emailInvalid,
              },
            }}
            render={({ field }) => (
              <Input
                label={copy.emailAddress}
                placeholder={copy.placeholders.emailAddress}
                preIcon={<Icon.Mail className="main-color-gray w-5 h-5" />}
                error={errors.email?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="phoneNumber"
            control={control}
            rules={{ required: copy.validation.phoneNumber }}
            render={({ field }) => (
              <Input
                label={copy.phoneNumber}
                placeholder={copy.placeholders.phoneNumber}
                preIcon={<Icon.Phone className="main-color-gray w-5 h-5" />}
                error={errors.phoneNumber?.message}
                {...field}
              />
            )}
          />
        </div>

        <Controller
          name="address"
          control={control}
          rules={{ required: copy.validation.address }}
          render={({ field }) => (
            <Input
              label={copy.address}
              placeholder={copy.placeholders.address}
              preIcon={<Icon.MapPin className="main-color-gray w-5 h-5" />}
              error={errors.address?.message}
              {...field}
            />
          )}
        />
      </form>
    </CsDialog>
  );
};

export default memo(ModalAdd);
