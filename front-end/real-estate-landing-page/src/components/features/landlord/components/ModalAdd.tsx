import { CsDialog } from "@/components/custom/dialog";
import { Icon } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { CreateLandlordRequest } from "@/components/features/landlord/dto/landlord.model";
import { memo, useEffect } from "react";
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
      title={id ? "Update Landlord" : "Add Landlord"}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit(onSubmit)}
      okText={id ? "Update Landlord" : "Add Landlord"}
      loading={isCreating || isUpdating || isLoadingLandlordDetail}
    >
      <form className="flex flex-col gap-4">
        <Controller
          name="name"
          control={control}
          rules={{ required: "Full name is required" }}
          render={({ field }) => (
            <Input
              preIcon={<Icon.User className="main-color-gray w-5 h-5" />}
              label="Full Name"
              placeholder="e.g. John Doe"
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
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email address",
              },
            }}
            render={({ field }) => (
              <Input
                label="Email Address"
                placeholder="john.doe@example.com"
                preIcon={<Icon.Mail className="main-color-gray w-5 h-5" />}
                error={errors.email?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="phoneNumber"
            control={control}
            rules={{ required: "Phone number is required" }}
            render={({ field }) => (
              <Input
                label="Phone Number"
                placeholder="0123456789"
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
          rules={{ required: "Address is required" }}
          render={({ field }) => (
            <Input
              label="Address"
              placeholder="e.g. 123 Main St, Springfield"
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
