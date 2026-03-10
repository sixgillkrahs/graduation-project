"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  getPropertyAmenityLabel,
  isSamePropertyAmenity,
  normalizePropertyAmenity,
  PROPERTY_AMENITIES,
} from "@/lib/property-amenities";
import { cn } from "@/lib/utils";

interface AmenitiesFieldProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  description?: string;
  error?: string;
}

const AmenitiesField = ({
  value = [],
  onChange,
  label = "Amenities",
  placeholder = "Type an amenity and press Enter",
  description = "You can add your own amenities for each property.",
  error,
}: AmenitiesFieldProps) => {
  const [draftAmenity, setDraftAmenity] = useState("");

  const updateAmenities = (rawAmenity: string) => {
    const nextAmenities = rawAmenity
      .split(",")
      .map(normalizePropertyAmenity)
      .filter(Boolean);

    if (nextAmenities.length === 0) {
      setDraftAmenity("");
      return;
    }

    const mergedAmenities = [...value];

    for (const amenity of nextAmenities) {
      if (
        !mergedAmenities.some((existingAmenity) =>
          isSamePropertyAmenity(existingAmenity, amenity),
        )
      ) {
        mergedAmenities.push(amenity);
      }
    }

    onChange?.(mergedAmenities);
    setDraftAmenity("");
  };

  const handleRemoveAmenity = (amenityToRemove: string) => {
    onChange?.(
      value.filter(
        (existingAmenity) =>
          !isSamePropertyAmenity(existingAmenity, amenityToRemove),
      ),
    );
  };

  const suggestedAmenities = PROPERTY_AMENITIES.filter(
    (option) =>
      !value.some((selectedAmenity) =>
        isSamePropertyAmenity(selectedAmenity, option.label),
      ),
  );

  return (
    <Field data-invalid={!!error}>
      <FieldLabel>{label}</FieldLabel>

      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={draftAmenity}
            placeholder={placeholder}
            onChange={(event) => setDraftAmenity(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== ",") {
                return;
              }

              event.preventDefault();
              updateAmenities(draftAmenity);
            }}
            className={cn(
              "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-9 w-full min-w-0 rounded-xl border bg-transparent px-3 py-5 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            )}
            aria-invalid={!!error}
          />

          <button
            type="button"
            onClick={() => updateAmenities(draftAmenity)}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <FieldDescription>{description}</FieldDescription>

        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((amenity) => (
              <Badge
                key={`${amenity}-${getPropertyAmenityLabel(amenity)}`}
                variant="secondary"
                className="gap-1 px-3 py-1"
              >
                {getPropertyAmenityLabel(amenity)}
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(amenity)}
                  className="inline-flex items-center justify-center rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {suggestedAmenities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Suggested
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedAmenities.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateAmenities(option.label)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
};

export default AmenitiesField;
