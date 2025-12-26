import { Button, Icon, Upload } from "@/components/ui";
import { AppDispatch, RootState } from "@/store";
import { nextStep, prevStep, updateBusinessInfo } from "@/store/store";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useExtractID } from "../../services/mutation";
import { BusinessInfo as BusinessInfoType } from "@/models/basicInfo.model";

const validateBusinessInfo = (values: BusinessInfoType) => {
  const errors: Partial<BusinessInfoType & { identityCard: string[] }> = {};
  // if (!values.identityCard || values.identityCard.length === 0) {
  //   errors.identityCard = ["Identity card is required"];
  // }
  return errors;
};

const BusinessInfo = () => {
  const { mutateAsync: extractID } = useExtractID();
  const dispatch = useDispatch<AppDispatch>();
  const { basicInfo, businessInfo, isSubmitting } = useSelector(
    (state: RootState) => state.form
  );
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BusinessInfoType & { identityCard: File[] }>({
    defaultValues: businessInfo,
    mode: "onChange",
  });
  const onSubmit = (data: BusinessInfoType) => {
    dispatch(updateBusinessInfo(data));
    const errors = validateBusinessInfo({
      ...data,
    });
    if (Object.keys(errors).length > 0) {
      return;
    }
    dispatch(nextStep());
  };

  console.log(basicInfo);

  const handlePrev = () => {
    dispatch(prevStep());
  };

  return (
    <div className="flex flex-col gap-4 pt-3">
      <form onSubmit={handleSubmit(onSubmit)}>
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
                // handleOCRLogic(files);
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
