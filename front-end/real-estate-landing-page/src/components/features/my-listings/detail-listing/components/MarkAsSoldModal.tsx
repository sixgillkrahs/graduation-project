import React, { useEffect, useRef, useState } from "react";
import { CsButton } from "@/components/custom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

interface MarkAsSoldModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  handleSubmit: any;
  handleConfirmSold: (data: any) => void;
  control: any;
  errors: any;
  reset: () => void;
  isUpdating: boolean;
  currency: string;
  priceUnit: string;
}

const SlideToSubmit = ({
  isUpdating,
  onSubmitTrigger,
}: {
  isUpdating: boolean;
  onSubmitTrigger: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }

    // Update container width on resize
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Snap back when isUpdating completes (to reset state for error cases)
  useEffect(() => {
    if (!isUpdating && hasTriggered) {
      controls.start({ x: 0 });
      setHasTriggered(false);
    }
  }, [isUpdating, hasTriggered, controls]);

  const handleDragEnd = async (e: any, info: any) => {
    if (!containerWidth) return;
    const thumbWidth = 48; // width of thumb
    const threshold = containerWidth - thumbWidth - 10;

    if (info.offset.x >= threshold * 0.8) {
      // Snaps to the very end
      await controls.start({ x: containerWidth - thumbWidth - 4 });
      setHasTriggered(true);
      onSubmitTrigger();
    } else {
      // Spring back
      controls.start({ x: 0 });
    }
  };

  const textOpacity = useTransform(x, [0, containerWidth / 2], [1, 0]);
  const bgColor = useTransform(
    x,
    [0, containerWidth - 50],
    ["#f3f4f6", "#e0e7ff"], // from gray-100 to indigo-100
  );
  const progressBg = useTransform(
    x,
    [0, containerWidth - 50],
    ["#e5e7eb", "#4f46e5"], // from gray-200 to indigo-600
  );

  return (
    <motion.div
      ref={containerRef}
      style={{ backgroundColor: bgColor }}
      className="relative flex h-[52px] w-full items-center overflow-hidden rounded-full shadow-inner"
    >
      <motion.div
        style={{
          width: useTransform(x, (val) => val + 24),
          backgroundColor: progressBg,
        }}
        className="absolute bottom-0 left-0 top-0 rounded-full opacity-20"
      />

      <motion.span
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-500 pointer-events-none"
      >
        {isUpdating ? "Confirming..." : "Slide to confirm"}
      </motion.span>

      <motion.div
        drag={isUpdating ? false : "x"}
        dragConstraints={{
          left: 0,
          right: containerWidth ? containerWidth - 52 : 0,
        }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="absolute left-1 z-10 flex h-[44px] w-[44px] cursor-grab items-center justify-center rounded-full bg-blue-600 text-white shadow-md active:cursor-grabbing"
      >
        {isUpdating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ArrowRight className="h-5 w-5" />
        )}
      </motion.div>
    </motion.div>
  );
};

export const MarkAsSoldModal = React.memo(
  ({
    isOpen,
    onOpenChange,
    handleSubmit,
    handleConfirmSold,
    control,
    errors,
    reset,
    isUpdating,
    currency,
    priceUnit,
  }: MarkAsSoldModalProps) => {
    const submitBtnRef = useRef<HTMLButtonElement>(null);

    const triggerSubmit = () => {
      if (submitBtnRef.current) {
        submitBtnRef.current.click();
      }
    };

    return (
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Property as Sold</DialogTitle>
            <DialogDescription>
              To help track your sales KPIs and generate better analytics,
              please provide the sale price and the customer's name (optional).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleConfirmSold)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Total Sale Price ({currency}){" "}
                  <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="soldPrice"
                  control={control}
                  rules={{ required: "Please enter the sale price." }}
                  render={({ field }) => (
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="E.g. 1800700000"
                      error={errors.soldPrice?.message as string}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Sold To (Customer Name / Phone)
                </label>
                <Controller
                  name="soldTo"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="text"
                      placeholder="E.g. John Doe 0987654321"
                      error={errors.soldTo?.message as string}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Customer Email <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="soldToEmail"
                  control={control}
                  rules={{
                    required: "Please enter the customer's email.",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Invalid email format",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      type="email"
                      placeholder="E.g. customer@example.com"
                      error={errors.soldToEmail?.message as string}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            {/* Hidden submit button to trigger react-hook-form properly */}
            <button type="submit" ref={submitBtnRef} className="hidden" />

            <div className="mt-4 flex flex-col gap-3">
              <SlideToSubmit
                isUpdating={isUpdating}
                onSubmitTrigger={triggerSubmit}
              />
              <CsButton
                type="button"
                variant="ghost"
                className="w-full text-gray-500"
                onClick={() => {
                  onOpenChange(false);
                  reset();
                }}
              >
                Cancel
              </CsButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

MarkAsSoldModal.displayName = "MarkAsSoldModal";
