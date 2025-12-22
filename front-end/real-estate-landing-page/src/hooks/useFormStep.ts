import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  updateBasicInfo,
  updateBusinessInfo,
  updateVerification,
} from "@/store/store";

export const useFormStep = (
  step: "basicInfo" | "businessInfo" | "verification"
) => {
  const dispatch = useDispatch<AppDispatch>();
  const formData = useSelector((state: RootState) => state.form[step]);

  const updateData = (data: any) => {
    switch (step) {
      case "basicInfo":
        dispatch(updateBasicInfo(data));
        break;
      case "businessInfo":
        dispatch(updateBusinessInfo(data));
        break;
      case "verification":
        dispatch(updateVerification(data));
        break;
    }
  };

  return { formData, updateData };
};
