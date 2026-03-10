import { env } from "@/config/env";
import { useEffect } from "react";
import { UseFormClearErrors, UseFormSetError } from "react-hook-form";

interface UseAIModerationProps {
  description: string;
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
  errorType?: string;
  delay?: number;
  fieldName?: string;
}

const toPlainText = (value: string) => {
  if (!value) return "";

  const container = document.createElement("div");
  container.innerHTML = value;

  return (container.textContent || container.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
};

export const useAIModeration = ({
  description,
  setError,
  clearErrors,
  errorType,
  delay = 600,
  fieldName = "description",
}: UseAIModerationProps) => {
  useEffect(() => {
    const checkModeration = async () => {
      const strippedDesc = toPlainText(description || "");
      if (!strippedDesc) return;

      const apiUrl = env.NEXT_PUBLIC_MODERATION_API_URL;
      if (!apiUrl) {
        console.warn(
          "AI Moderation is disabled because NEXT_PUBLIC_MODERATION_API_URL is missing.",
        );
        return;
      }

      try {
        const modRes = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: strippedDesc }),
        });
        if (modRes.ok) {
          const modData = await modRes.json();
          if (modData.is_inappropriate) {
            setError(fieldName, {
              type: "manual",
              message: "Mô tả chứa từ ngữ nhạy cảm/không phù hợp.",
            });
          } else {
            // Only clear manual error
            if (errorType === "manual") {
              clearErrors(fieldName);
            }
          }
        }
      } catch (error) {
        console.error("Moderation API error:", error);
      }
    };

    const debounceTimer = setTimeout(() => {
      checkModeration();
    }, delay);

    return () => clearTimeout(debounceTimer);
  }, [description, setError, clearErrors, errorType, delay, fieldName]);
};
