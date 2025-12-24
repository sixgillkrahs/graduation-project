import { Checkbox, Input, Select } from "@/components/ui";
import {
  BusinessInfo,
  Verification as VerificationType,
} from "@/models/basicInfo.model";
import { AppDispatch, RootState } from "@/store";
import { updateVerification } from "@/store/store";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import ExtractService from "../../services/service";

const Verification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { businessInfo, verification } = useSelector(
    (state: RootState) => state.form
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<BusinessInfo & VerificationType>({
    defaultValues: businessInfo,
    mode: "onChange",
  });

  const onSubmit = (agreeToTerms: boolean) => {
    console.log(agreeToTerms);
    dispatch(updateVerification({ agreeToTerms }));
    console.log(verification);
  };

  return (
    <form>
      <div className="grid grid-cols-2 gap-4 my-4 ">
        <Input
          label="Full Name"
          placeholder="e.g. John Doe"
          value={businessInfo.agentName}
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
          label="ID Number"
          placeholder="e.g. 124xxxxxxxx"
          value={businessInfo.IDNumber}
          error={errors.IDNumber?.message}
          {...register("IDNumber", {
            required: "ID Number is required",
            minLength: {
              value: 12,
              message: "ID Number must be 12 characters",
            },
          })}
        />
        <Select
          label="Gender"
          placeholder="Select gender"
          options={ExtractService.options}
          value={businessInfo.gender}
          error={errors.gender?.message}
          {...register("gender", { required: "Please select gender" })}
        />
        <Input
          label="Birthday"
          placeholder="e.g. 01/01/2000"
          value={businessInfo.dateOfBirth}
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth", {
            required: "Birthday is required",
          })}
        />
        <Input
          label="Nationality"
          placeholder="e.g. Vietnamese"
          value={businessInfo.nationality}
          error={errors.nationality?.message}
          {...register("nationality", {
            required: "Nationality is required",
          })}
        />
        <Input
          label="Address"
          placeholder="e.g. 123 Main St"
          value={businessInfo.address}
          error={errors.address?.message}
          {...register("address", {
            required: "Address is required",
          })}
        />
      </div>
      <div className="p-4 bg-black/5 w-full rounded-lg border border-black/10 mt-8">
        <Checkbox
          label="I agree to the Terms and Conditions and Privacy Policy"
          subtext="I certify that all information I have provided is true and correct. 
          I authorize the company to contact me regarding my application and verify my real estate license status."
          {...register("agreeToTerms", {
            required:
              "You must agree to the Terms and Conditions and Privacy Policy",
          })}
          onChange={(e) => {
            onSubmit(e.target.checked);
          }}
        />
      </div>
    </form>
  );
};

export default Verification;
