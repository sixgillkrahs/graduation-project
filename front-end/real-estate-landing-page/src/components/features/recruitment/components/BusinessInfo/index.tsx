import { Input, Upload } from "@/components/ui";
import { AppDispatch, RootState } from "@/store";
import { updateBusinessInfo } from "@/store/store";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useExtractID } from "../../services/mutation";

interface BusinessInfoForm {
  agentName: string;
  area: string;
  businessName: string;
}

const BusinessInfo = () => {
  const { mutateAsync: extractID, isPending } = useExtractID();
  const dispatch = useDispatch<AppDispatch>();
  const businessInfo = useSelector(
    (state: RootState) => state.form.businessInfo
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<BusinessInfoForm>({
    defaultValues: {
      agentName: businessInfo.agentName,
      area: businessInfo.area.join(", "),
      businessName: businessInfo.businessName,
    },
    mode: "onChange",
  });
  const onSubmit = (data: BusinessInfoForm) => {
    // dispatch(updateBusinessInfo(data));
  };

  const onFileChange = (files: File[]) => {
    const formData = new FormData();
    if (files.length > 0) {
      formData.append("file", files[0]);
      extractID(formData).then((res) => {
        if (res) {
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
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-3">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 my-4 ">
          <Input
            label="Agent Name"
            placeholder="e.g. John Doe"
            error={errors.agentName?.message}
            {...register("agentName", {
              required: "Agent name is required",
              minLength: {
                value: 2,
                message: "Agent name must be at least 2 characters",
              },
            })}
          />

          <Input
            label="Area of Operation"
            placeholder="e.g. Ha Noi"
            error={errors.area?.message}
            {...register("area", {
              required: "Area is required",
              minLength: {
                value: 2,
                message: "Area must be at least 2 characters",
              },
            })}
          />
        </div>
        <Upload
          label="Identity Card"
          accept="image/jpeg,image/png"
          onFileChange={onFileChange}
        />
      </form>
    </div>
  );
};

export default BusinessInfo;
