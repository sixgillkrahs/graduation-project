"use client";

import { BrainCircuit, Search, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CsButton } from "@/components/custom";
import useDebounce from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface SemanticSearchComposerProps {
  initialQuery: string;
  initialExplain: boolean;
  syncKey: string;
  isSearching: boolean;
  onSubmit: (payload: { query: string; explain: boolean }) => void;
}

const EXAMPLE_QUERIES = [
  "căn hộ 2PN gần quận 1 dưới 3 tỷ",
  "nhà thuê có chỗ đậu xe ở Đà Nẵng",
  "villa có hồ bơi cho gia đình ở Thảo Điền",
] as const;

const SemanticSearchComposer = ({
  initialQuery,
  initialExplain,
  syncKey,
  isSearching,
  onSubmit,
}: SemanticSearchComposerProps) => {
  const t = useTranslations("PropertiesPage.semanticSearch");
  const [query, setQuery] = useState(initialQuery);
  const [explain, setExplain] = useState(initialExplain);
  const [error, setError] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 700);
  const autoSearchEnabledRef = useRef(Boolean(initialQuery.trim()));

  useEffect(() => {
    setQuery(initialQuery);
    setExplain(initialExplain);
    setError("");
  }, [initialExplain, initialQuery, syncKey]);

  useEffect(() => {
    if (!autoSearchEnabledRef.current) {
      return;
    }

    if (debouncedQuery.length < 2 || debouncedQuery === initialQuery.trim()) {
      return;
    }

    onSubmit({
      query: debouncedQuery,
      explain,
    });
  }, [debouncedQuery, explain, initialQuery, onSubmit]);

  const handleSearch = (nextQuery = query, nextExplain = explain) => {
    const trimmedQuery = nextQuery.trim();

    if (trimmedQuery.length < 2) {
      setError(t("validation"));
      return;
    }

    autoSearchEnabledRef.current = true;
    setError("");
    onSubmit({
      query: trimmedQuery,
      explain: nextExplain,
    });
  };

  return (
    <section className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 py-4 shadow-sm backdrop-blur">
      <div className="container mx-auto px-4 md:px-20">
        <div className="overflow-hidden rounded-[32px] border border-stone-200 bg-[linear-gradient(135deg,#fff8ef_0%,#ffffff_45%,#f6f3ff_100%)] p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.28)] md:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  {t("eyebrow")}
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  {t("description")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextExplain = !explain;
                  setExplain(nextExplain);

                  if (
                    autoSearchEnabledRef.current &&
                    query.trim().length >= 2
                  ) {
                    handleSearch(query, nextExplain);
                  }
                }}
                className={cn(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                  explain
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50",
                )}
              >
                <Sparkles className="h-4 w-4" />
                {t("explainToggle")}
              </button>
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-white/90 p-4 shadow-sm">
              <Textarea
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                placeholder={t("placeholder")}
                className="min-h-[108px] resize-none border-none bg-transparent px-0 py-0 text-base leading-7 shadow-none focus-visible:ring-0 md:text-lg"
              />

              <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span>{t("examplesLabel")}</span>
                  {EXAMPLE_QUERIES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setQuery(example);
                        handleSearch(example, explain);
                      }}
                      className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-100"
                    >
                      {example}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <CsButton
                    type="button"
                    onClick={() => handleSearch()}
                    loading={isSearching}
                    className="h-11 rounded-full px-6 text-sm font-semibold"
                    icon={<Search className="h-4 w-4" />}
                  >
                    {t("searchCta")}
                  </CsButton>
                  <span className="text-xs text-stone-500">
                    {t("debounceHint")}
                  </span>
                </div>
              </div>
            </div>

            {error ? (
              <p className="text-sm font-medium text-red-600">{error}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SemanticSearchComposer;
