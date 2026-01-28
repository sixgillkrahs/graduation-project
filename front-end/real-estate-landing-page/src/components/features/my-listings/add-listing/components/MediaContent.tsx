"use client";

import { CsButton } from "@/components/custom";
import ImageUpload from "@/components/ui/image-upload";
import { nextStep, prevStep } from "@/store/listing.store";
import { ArrowLeft, ArrowRight, Images } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import { ListingFormData, stepFields } from "../types";
import { useUploadImages } from "@/shared/upload/mutate";

const MediaContent = () => {
  const dispatch = useDispatch();
  const { mutateAsync: uploadImages, isPending } = useUploadImages();
  const { control, trigger } = useFormContext<ListingFormData>();

  const handleContinue = async () => {
    const isValid = await trigger(stepFields.step4);
    if (isValid) {
      dispatch(nextStep());
    }
  };

  const onBack = () => {
    dispatch(prevStep());
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[700px]">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Images />
          Step 4: Media
        </h2>

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUpload
              description="Upload high-quality images of your property. You can upload multiple images at once."
              accept="image/*"
              multiple
              maxSizeMB={10}
              value={field.value}
              onChange={async (files) => {
                if (files.length > 0) {
                  try {
                    const response = await uploadImages(files);
                    if (response && response.data.files) {
                      const newUrls = response.data.files.map((f) => f.url);
                      const currentUrls = field.value || [];
                      field.onChange([...currentUrls, ...newUrls]);
                    }
                    debugger;
                  } catch (error) {
                    console.error("Upload failed", error);
                  }
                } else {
                  field.onChange([]);
                }
              }}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
        <div className="flex justify-between pt-10">
          <CsButton onClick={onBack} icon={<ArrowLeft />} type="button">
            Back
          </CsButton>
          <div className="flex gap-4">
            <CsButton onClick={() => {}} type="button">
              Save Draft
            </CsButton>
            <CsButton onClick={handleContinue} type="button">
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </CsButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaContent;
