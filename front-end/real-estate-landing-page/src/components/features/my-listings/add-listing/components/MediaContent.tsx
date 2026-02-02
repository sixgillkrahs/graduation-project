"use client";

import { CsButton } from "@/components/custom";
import ImageUpload from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { useUploadImages } from "@/shared/upload/mutate";
import { nextStep, prevStep } from "@/store/listing.store";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Images,
  LayoutGrid,
  Rotate3d,
  Video,
} from "lucide-react";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { useDispatch } from "react-redux";
import { ListingFormData } from "../../dto/listingformdata.dto";
import PropertyService from "../../services/service";

const MediaContent = () => {
  const dispatch = useDispatch();
  const { mutateAsync: uploadImages, isPending: isUploadingImages } =
    useUploadImages();
  const { control, trigger, watch } = useFormContext<ListingFormData>();
  const virtualTourUrls = watch("virtualTourUrls");
  const [active360Index, setActive360Index] = React.useState(0);

  // If active index is out of bounds, reset to 0
  React.useEffect(() => {
    if (
      virtualTourUrls &&
      virtualTourUrls.length > 0 &&
      active360Index >= virtualTourUrls.length
    ) {
      setActive360Index(0);
    }
  }, [virtualTourUrls, active360Index]);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Rotate3d className="w-5 h-5" />
              360° Virtual Tour Images
            </h3>
            <Controller
              name="virtualTourUrls"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  description="Upload 360° panorama images (equirectangular projection)."
                  accept="image/*"
                  multiple={true}
                  maxSizeMB={10}
                  value={field.value || []}
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
                        console.error("Virtual tour upload failed", error);
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
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex justify-between items-center">
              <span>Preview</span>
              {virtualTourUrls && virtualTourUrls.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {active360Index + 1} / {virtualTourUrls.length}
                </span>
              )}
            </h3>
            <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-200 relative group">
              {virtualTourUrls && virtualTourUrls.length > 0 ? (
                <>
                  <ReactPhotoSphereViewer
                    src={virtualTourUrls[active360Index]}
                    height={"100%"}
                    width={"100%"}
                  />
                  {virtualTourUrls.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 px-2">
                      {virtualTourUrls.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActive360Index(idx);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === active360Index
                              ? "bg-white w-4"
                              : "bg-white/50 hover:bg-white/80"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex gap-2 items-center justify-center text-gray-400">
                  <Box className="w-8 h-8 opacity-50" />
                  <span className="text-lg font-semibold">Preview 360</span>
                </div>
              )}
            </div>
            {virtualTourUrls && virtualTourUrls.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {virtualTourUrls.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActive360Index(idx)}
                    className={`relative w-16 h-10 flex-shrink-0 cursor-pointer rounded overflow-hidden border-2 transition-all ${
                      idx === active360Index
                        ? "border-primary"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`360 thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
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
