"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageSquare, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

// --- Mock Data ---

interface FAQItem {
  id: string;
  categoryIndex: number;
  question: string;
  answer: string;
}

// --- Components ---

function FAQAccordionItem({
  item,
  isOpen,
  onClick,
}: {
  item: FAQItem;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={false}
      className="border-b-[1px] border-[var(--color-black)] overflow-hidden"
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] rounded-none bg-transparent"
        aria-expanded={isOpen}
      >
        <span className="cs-typography group-hover:text-[var(--color-red)] transition-colors pr-8">
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="shrink-0 main-color-red"
        >
          <ChevronDown size={24} strokeWidth={2.5} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="pb-8 pr-12 cs-paragraph-gray max-w-3xl">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const t = useTranslations("FAQ");

  const CATEGORIES = useMemo(
    () => [
      t("categories.forHomeBuyers"),
      t("categories.forAgentsSellers"),
      t("categories.accountSecurity"),
    ],
    [t],
  );

  const FAQS: FAQItem[] = useMemo(
    () => [
      {
        id: "q1",
        categoryIndex: 0,
        question: t("questions.q1.question"),
        answer: t("questions.q1.answer"),
      },
      {
        id: "q2",
        categoryIndex: 0,
        question: t("questions.q2.question"),
        answer: t("questions.q2.answer"),
      },
      {
        id: "q3",
        categoryIndex: 0,
        question: t("questions.q3.question"),
        answer: t("questions.q3.answer"),
      },
      {
        id: "q4",
        categoryIndex: 1,
        question: t("questions.q4.question"),
        answer: t("questions.q4.answer"),
      },
      {
        id: "q5",
        categoryIndex: 1,
        question: t("questions.q5.question"),
        answer: t("questions.q5.answer"),
      },
      {
        id: "q6",
        categoryIndex: 2,
        question: t("questions.q6.question"),
        answer: t("questions.q6.answer"),
      },
      {
        id: "q7",
        categoryIndex: 2,
        question: t("questions.q7.question"),
        answer: t("questions.q7.answer"),
      },
    ],
    [t],
  );

  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Handle accordion toggle
  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter items based on active category and search
  const filteredFAQs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory = faq.categoryIndex === activeCategoryIndex;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

      // If searching, ignore category filter to show all matches
      return searchQuery ? matchesSearch : matchesCategory;
    });
  }, [FAQS, activeCategoryIndex, searchQuery]);

  return (
    <main className="min-h-screen bg-[var(--color-white)] selection:cs-bg-red selection:main-color-white">
      {/* 
        1. Hero Header 
        Using background white and outline black to match the sharp aesthetic
      */}
      <section className="relative w-full bg-[var(--color-white)] border-b-[1px] border-[var(--color-black)] pt-24 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-bold tracking-tighter text-[var(--color-black)] mb-6"
          >
            {t("header.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="cs-paragraph max-w-2xl mb-12"
          >
            {t("header.description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl relative"
          >
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-[var(--color-black)]">
              <Search size={24} strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-white)] cs-outline-black py-5 pl-16 pr-6 text-lg font-medium text-[var(--color-black)] placeholder:text-[var(--color-gray)] focus:outline-none focus:ring-4 focus:ring-[var(--color-red)]/20 transition-shadow rounded-none"
            />
          </motion.div>
        </div>
      </section>

      {/* 
        2. Content Area (Asymmetric Tension 25/75)
      */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 flex flex-col md:flex-row gap-16 lg:gap-24 relative">
        {/* Left Column: Categories */}
        <div className="md:w-1/4 shrink-0">
          <div className="md:sticky md:top-32 flex flex-row md:flex-col gap-8 md:gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide border-b-[1px] border-[var(--color-gray)] md:border-b-0">
            {CATEGORIES.map((category, index) => {
              const isActive = activeCategoryIndex === index && !searchQuery;
              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => {
                    setActiveCategoryIndex(index);
                    setSearchQuery(""); // Clear search when switching tabs manually
                  }}
                  className={`relative text-left py-2 font-bold tracking-tight text-xl transition-colors whitespace-nowrap focus:outline-none rounded-none ${
                    isActive
                      ? "main-color-red"
                      : "main-color-gray hover:text-[var(--color-black)]"
                  }`}
                >
                  {category}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryIndicator"
                      className="absolute -bottom-[2px] md:-left-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-full md:w-1 h-1 md:h-full cs-bg-red"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Accordion List */}
        <div className="md:w-3/4 grow min-h-[400px]">
          {searchQuery && (
            <div className="mb-8 pb-4 border-b-[1px] border-[var(--color-gray)]">
              <span className="main-color-red font-medium">
                {filteredFAQs.length !== 1
                  ? t("search.searchingForPlural", {
                      query: searchQuery,
                      count: filteredFAQs.length,
                    })
                  : t("search.searchingFor", {
                      query: searchQuery,
                      count: filteredFAQs.length,
                    })}
              </span>
            </div>
          )}

          <div className="flex flex-col">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <FAQAccordionItem
                  key={faq.id}
                  item={faq}
                  isOpen={openItems.has(faq.id)}
                  onClick={() => toggleItem(faq.id)}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <MessageSquare className="mx-auto h-12 w-12 text-[var(--color-gray)] mb-4" />
                <h3 className="cs-typography mb-2">
                  {t("search.noResultsFound")}
                </h3>
                <p className="cs-paragraph-gray">
                  {t("search.noResultsMessage", { query: searchQuery })}
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-6 font-bold main-color-red hover:text-[var(--color-black)] underline transition-colors"
                >
                  {t("search.clearSearch")}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* 
        3. Contact Footer 
      */}
      <section className="cs-bg-black main-color-white py-24 px-6 lg:px-12 mt-12 border-t-8 border-[var(--color-red)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-[var(--color-white)]">
              {t("footer.stillHaveQuestions")}
            </h2>
            <p className="cs-paragraph-white max-w-lg">
              {t("footer.supportMessage")}
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 cs-bg-red hover:bg-[var(--color-white)] text-[var(--color-white)] hover:text-[var(--color-black)] font-bold text-lg px-8 py-5 transition-colors focus:outline-none focus:ring-4 focus:ring-[var(--color-red)]/30 rounded-none shadow-[4px_4px_0px_0px_var(--color-gray)] hover:shadow-[2px_2px_0px_0px_var(--color-gray)] md:shadow-[8px_8px_0px_0px_var(--color-gray)] md:hover:shadow-[4px_4px_0px_0px_var(--color-gray)]"
          >
            {t("footer.contactSupport")}
          </motion.button>
        </div>
      </section>
    </main>
  );
}
