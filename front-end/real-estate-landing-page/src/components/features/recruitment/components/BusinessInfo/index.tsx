import { Button, Icon, Input, Select, Upload } from "@/components/ui";
import { AppDispatch, RootState } from "@/store";
import { nextStep, prevStep, updateBusinessInfo } from "@/store/store";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useExtractID } from "../../services/mutation";
import { memo } from "react";
import ExtractService from "../../services/service";

interface BusinessInfoForm {
  agentName: string;
  area: string[];
  IDNumber: string;
  businessName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  nationality: string;
}

const validateBusinessInfo = (
  values: BusinessInfoForm & { identityCard: File[] }
) => {
  const errors: Partial<BusinessInfoForm & { identityCard: string[] }> = {};
  if (!values.agentName) {
    errors.agentName = "Agent name is required";
  }
  if (!values.area || values.area.length === 0) {
    errors.area = ["Area is required"];
  }
  if (!values.identityCard || values.identityCard.length === 0) {
    errors.identityCard = ["Identity card is required"];
  }
  return errors;
};

const BusinessInfo = () => {
  const { mutateAsync: extractID } = useExtractID();
  const dispatch = useDispatch<AppDispatch>();
  const { businessInfo, isSubmitting } = useSelector(
    (state: RootState) => state.form
  );
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BusinessInfoForm & { identityCard: File[] }>({
    defaultValues: {
      agentName: businessInfo.agentName,
      area: businessInfo.area,
      identityCard: [],
    },
    mode: "onChange",
  });
  const onSubmit = (data: BusinessInfoForm & { identityCard: File[] }) => {
    dispatch(updateBusinessInfo(data));
    const errors = validateBusinessInfo({
      ...data,
    });
    if (Object.keys(errors).length > 0) {
      return;
    }
    dispatch(nextStep());
  };

  const handlePrev = () => {
    dispatch(prevStep());
  };

  const handleOCRLogic = (files: File[]) => {
    const formData = new FormData();
    if (files.length > 0) {
      formData.append("file", files[0]);
      extractID(formData).then((res) => {
        if (res && res.data) {
          dispatch(
            updateBusinessInfo({
              IDNumber: res.data[1],
              agentName: res.data[2],
              dateOfBirth: res.data[3],
              gender: res.data[4],
              nationality: res.data[5],
              address: res.data[6],
            })
          );

          setValue("agentName", res.data[2], { shouldValidate: true });
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 my-4 ">
          <Controller
            name="agentName"
            control={control}
            rules={{ required: "Agent name is required" }}
            render={({ field }) => (
              <Input
                preIcon={<Icon.User className="main-color-gray w-5 h-5" />}
                label="Agent Name"
                placeholder="e.g. 123 Main St"
                error={errors.agentName?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="area"
            control={control}
            rules={{ required: "Area is required" }}
            render={({ field }) => (
              <Select
                label="Area of Operation"
                placeholder="e.g. Ha Noi"
                multiple
                options={ExtractService.vietnamProvinces}
                error={errors.area?.message}
                {...field}
              />
            )}
          />
        </div>
        <Controller
          name="identityCard"
          control={control}
          rules={{
            required: "Identity card is required",
            validate: (val) =>
              (val && val.length > 0) || "Identity card is required",
          }}
          render={({
            field: { onChange, value, ...restField },
            fieldState: { error },
          }) => (
            <Upload
              label="Identity Card"
              accept="image/jpeg,image/png"
              {...restField}
              value={value || []}
              onChange={(files) => {
                onChange(files);
                handleOCRLogic(files);
              }}
              error={error?.message}
            />
          )}
        />
        <div className="flex justify-between pt-6">
          <Button
            className="text-black px-6 py-2 rounded-full"
            onClick={handlePrev}
            type="button"
            icon={<Icon.ArrowLeft className="w-5 h-5" />}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            className="cs-bg-black text-white px-6 py-2 rounded-full"
            type="submit"
            disabled={isSubmitting}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default memo(BusinessInfo);
