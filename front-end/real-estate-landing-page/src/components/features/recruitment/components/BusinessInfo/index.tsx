import { Button, Icon, Input, Select, Upload } from "@/components/ui";
import { showToast } from "@/components/ui/Toast";
import { vietnamProvinces } from "@/const/vietnam-provinces";
import { BusinessInfo as BusinessInfoType } from "@/models/basicInfo.model";
import { AppDispatch, RootState } from "@/store";
import { nextStep, prevStep, updateBusinessInfo } from "@/store/store";
import { memo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useUploadImage } from "../../services/mutation";

type BusinessInfoFormType = BusinessInfoType & {
  certificateImage: File[];
};

const validateBusinessInfo = (values: BusinessInfoFormType) => {
  const errors: Record<string, string> = {};
  if (!values.certificateImage?.length) {
    errors.certificateImage = "Certificate image is required";
  }
  return errors;
};

const BusinessInfo = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: uploadImage } = useUploadImage();
  const { businessInfo, isSubmitting } = useSelector(
    (state: RootState) => state.form
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessInfoFormType>({
    defaultValues: {
      ...businessInfo,
      certificateImage: [],
    },
    mode: "onChange",
  });

  const onSubmit = (data: BusinessInfoFormType) => {
    const errors = validateBusinessInfo(data);
    if (Object.keys(errors).length > 0) return;
    const payload = {
      ...data,
      certificateImage: businessInfo.certificateImage,
    };

    dispatch(updateBusinessInfo(payload));
    dispatch(nextStep());
  };

  const handleUploadImage = async (files: File[]) => {
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const resp = await uploadImage(formData);

      if (resp?.success) {
        dispatch(
          updateBusinessInfo({
            certificateImage: [resp.filename],
          })
        );
      } else {
        showToast.error("Upload error");
      }
    } catch (err) {
      showToast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handlePrev = () => {
    dispatch(prevStep());
  };

  return (
    <div className="flex flex-col gap-4 pt-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="certificateNumber"
            control={control}
            rules={{
              required: "Certificate number is required",
            }}
            render={({ field }) => (
              <Input
                label="Certificate Number"
                placeholder="CCHN-HN-123456"
                error={errors.certificateNumber?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="taxCode"
            control={control}
            rules={{
              required: "Tax code is required",
            }}
            render={({ field }) => (
              <Input
                label="Tax code"
                placeholder="8888888888"
                error={errors.taxCode?.message}
                {...field}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Controller
            name="yearsOfExperience"
            control={control}
            rules={{
              required: "Year of experience is required",
              pattern: {
                value: /^[0-9]{0,}$/,
                message: "Please enter number",
              },
            }}
            render={({ field }) => (
              <Input
                label="Years Of Experience"
                placeholder="8888888888"
                suffix="Year"
                error={errors.yearsOfExperience?.message}
                {...field}
              />
            )}
          />
          <Controller
            name="specialization"
            control={control}
            rules={{
              required: "Specialization is required",
            }}
            render={({ field }) => (
              <Select
                label="Specialization"
                error={errors.specialization?.message}
                multiple
                options={[
                  {
                    value: "APARTMENT",
                    label: "APARTMENT",
                  },
                  {
                    value: "LAND",
                    label: "LAND",
                  },
                ]}
                {...field}
              />
            )}
          />
        </div>
        <div className="grid mt-3">
          <Controller
            name="workingArea"
            control={control}
            rules={{
              required: "Working area is required",
            }}
            render={({ field }) => (
              <Select
                multiple
                label="Working Area"
                error={errors.workingArea?.message}
                options={vietnamProvinces}
                {...field}
              />
            )}
          />
        </div>
        <div className="mt-3">
          <Controller
            name="certificateImage"
            control={control}
            rules={{
              required: "Certificate image is required",
              validate: (val) =>
                (val && val.length > 0) || "Certificate image is required",
            }}
            render={({
              field: { onChange, value, ...restField },
              fieldState: { error },
            }) => (
              <Upload
                label="Certificate Image"
                accept="image/jpeg,image/png"
                {...restField}
                value={value || []}
                onChange={(files) => {
                  onChange(files);
                  handleUploadImage(files);
                }}
                error={error?.message}
              />
            )}
          />
        </div>
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
            loading={uploading}
            disabled={uploading || isSubmitting}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  );
};

export default memo(BusinessInfo);
