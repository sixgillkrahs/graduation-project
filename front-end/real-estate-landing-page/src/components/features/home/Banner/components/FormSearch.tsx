"use client";

import { CsButton } from "@/components/custom";
import { Tabs } from "@/components/ui";
import { CsSelect } from "@/components/ui/select";
import { memo, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/const/routes";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import {
  buildSemanticSearchQueryString,
  DEFAULT_SEMANTIC_LIMIT,
  DEFAULT_SEMANTIC_PAGE,
} from "@/components/features/properties/semantic-search/url-state";

interface BannerSearchValues {
  query: string;
  demandType: string;
  propertyType: string;
  explain: boolean;
}

const TYPE_SPEED_MS = 55;
const DELETE_SPEED_MS = 28;
const HOLD_TYPED_MS = 1500;
const HOLD_EMPTY_MS = 320;

const FormSearch = () => {
  const t = useTranslations("Banner");
  const router = useRouter();

  const optionsType = [
    { label: t("allPropertyTypes"), value: "" },
    { label: t("apartment"), value: "APARTMENT" },
    { label: t("house"), value: "HOUSE" },
    { label: t("villa"), value: "VILLA" },
    { label: t("land"), value: "LAND" },
  ];

  const suggestedPrompts = [t("prompt1"), t("prompt2"), t("prompt3")];
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [isDeletingPrompt, setIsDeletingPrompt] = useState(false);

  const { control, handleSubmit, setValue, watch } =
    useForm<BannerSearchValues>({
      defaultValues: {
        query: "",
        demandType: "RENT",
        propertyType: "",
        explain: true,
      },
    });

  const demandType = watch("demandType");
  const explain = watch("explain");
  const query = watch("query");

  useEffect(() => {
    const prompts = suggestedPrompts.filter(Boolean);

    if (prompts.length === 0) {
      return;
    }

    const currentPrompt = prompts[activePromptIndex % prompts.length] || "";
    let timeoutId: ReturnType<typeof setTimeout>;

    if (!isDeletingPrompt && animatedPlaceholder === currentPrompt) {
      timeoutId = setTimeout(() => {
        setIsDeletingPrompt(true);
      }, HOLD_TYPED_MS);
      return () => clearTimeout(timeoutId);
    }

    if (isDeletingPrompt && animatedPlaceholder.length === 0) {
      timeoutId = setTimeout(() => {
        setIsDeletingPrompt(false);
        setActivePromptIndex((prev) => (prev + 1) % prompts.length);
      }, HOLD_EMPTY_MS);
      return () => clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(
      () => {
        setAnimatedPlaceholder((prev) =>
          isDeletingPrompt
            ? prev.slice(0, -1)
            : currentPrompt.slice(0, prev.length + 1),
        );
      },
      isDeletingPrompt ? DELETE_SPEED_MS : TYPE_SPEED_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [
    activePromptIndex,
    animatedPlaceholder,
    isDeletingPrompt,
    suggestedPrompts,
  ]);

  const onSubmit = (data: BannerSearchValues) => {
    const query = data.query.trim();

    const queryString = buildSemanticSearchQueryString({
      query,
      page: DEFAULT_SEMANTIC_PAGE,
      limit: DEFAULT_SEMANTIC_LIMIT,
      explain: data.explain,
      filters: {
        demandType:
          data.demandType === "RENT" || data.demandType === "SALE"
            ? data.demandType
            : undefined,
        propertyType: data.propertyType
          ? (data.propertyType as "APARTMENT" | "HOUSE" | "VILLA" | "LAND")
          : undefined,
      },
    });

    router.push(`${ROUTES.PROPERTIES}?${queryString}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      className="absolute bottom-4 left-4 right-4 z-10 max-w-sm rounded-[28px] border border-white/50 bg-white/90 p-4 shadow-2xl backdrop-blur-md md:bottom-20 md:left-auto md:right-20 md:max-w-lg md:p-7"
    >
      <h2 className="mb-3 text-2xl font-bold leading-tight text-black md:text-3xl">
        {t("title")}
      </h2>
      <p className="mb-4 text-sm leading-6 text-stone-600">
        {t("description")}
      </p>
      <Tabs
        fullWidth
        current={demandType === "RENT" ? 0 : 1}
        onChange={(index) =>
          setValue("demandType", index === 0 ? "RENT" : "SALE")
        }
        items={[{ title: t("rent") }, { title: t("sell") }]}
      />
      <div className="my-4 h-px bg-black/10"></div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <Controller
          name="query"
          control={control}
          render={({ field }) => (
            <Textarea
              value={field.value}
              rows={2}
              onChange={field.onChange}
              placeholder={
                query.trim() ? t("enterLocation") : animatedPlaceholder
              }
              className="min-h-20 rounded-2xl border-stone-200 bg-white px-4 py-3 text-sm leading-6 shadow-none focus-visible:ring-0 md:text-base"
            />
          )}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Controller
            name="propertyType"
            control={control}
            render={({ field }) => (
              <CsSelect
                placeholder={t("propertyType")}
                options={optionsType}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="explain"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition-colors ${
                  explain
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                {t("explainToggle")}
              </button>
            )}
          />
        </div>
        <CsButton
          type="submit"
          className="h-11 rounded-2xl bg-stone-950 text-white hover:bg-stone-800"
        >
          {t("search")}
        </CsButton>
      </form>
    </motion.div>
  );
};

export default memo(FormSearch);
