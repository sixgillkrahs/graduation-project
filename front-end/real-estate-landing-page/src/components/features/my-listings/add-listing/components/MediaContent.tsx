"use client";

import { CsButton } from "@/components/custom";
import ImageUpload from "@/components/ui/image-upload";
import { nextStep, prevStep } from "@/store/listing.store";
import { ArrowLeft, ArrowRight, Images, LayoutGrid, Video } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useUploadImages } from "@/shared/upload/mutate";
import { ListingFormData } from "../../dto/listingformdata.dto";
import PropertyService from "../../services/service";
import { Input } from "@/components/ui/input";

const MediaContent = () => {
  const dispatch = useDispatch();
  const { mutateAsync: uploadImages, isPending: isUploadingImages } =
    useUploadImages();
  const { control, trigger } = useFormContext<ListingFormData>();

  const handleContinue = async () => {
    const isValid = await trigger(PropertyService.stepFields.step4);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5" />
              Thumbnail Image
            </h3>
            <Controller
              name="thumbnail"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  description="Upload a cover image that will be displayed on the listing card."
                  accept="image/*"
                  multiple={false}
                  maxSizeMB={5}
                  value={field.value ? [field.value] : []}
                  onChange={async (files) => {
                    if (files.length > 0) {
                      try {
                        const response = await uploadImages(files);
                        if (response && response.data.files?.[0]) {
                          field.onChange(response.data.files[0].url);
                        }
                      } catch (error) {
                        console.error("Thumbnail upload failed", error);
                      }
                    } else {
                      field.onChange("");
                    }
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              )}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video URL (Optional)
            </h3>
            <Controller
              name="videoLink"
              control={control}
              render={({ field }) => (
                <Input
                  label="Youtube/Vimeo Link"
                  placeholder="https://www.youtube.com/watch?v=..."
                  preIcon={<Video className="w-4 h-4" />}
                  {...field}
                />
              )}
            />
          </div>
        </div>
        <div className="flex justify-between pt-10">
          <CsButton onClick={onBack} icon={<ArrowLeft />} type="button">
            Back
          </CsButton>
          <div className="flex gap-4">
            <CsButton onClick={() => {}} type="button">
              Save Draft
            </CsButton>
            <CsButton
              onClick={handleContinue}
              type="button"
              loading={isUploadingImages}
            >
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
