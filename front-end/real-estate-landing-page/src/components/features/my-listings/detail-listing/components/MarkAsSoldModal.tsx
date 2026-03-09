import React from "react";
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
            <DialogFooter>
              <CsButton
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  reset();
                }}
              >
                Cancel
              </CsButton>
              <CsButton
                type="submit"
                className="bg-blue-600 text-white"
                loading={isUpdating}
              >
                Confirm Sold
              </CsButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);

MarkAsSoldModal.displayName = "MarkAsSoldModal";
