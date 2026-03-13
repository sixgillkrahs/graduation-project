import FAQ from "@/components/features/faq";
import {
  buildFaqBreadcrumbSchema,
  buildFaqMetadata,
  buildFaqSchema,
} from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const FAQ_QUESTION_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FAQ");
  const title = t("header.title");
  const description = t("header.description");

  return buildFaqMetadata(title, description);
}

export default async function FAQPage() {
  const t = await getTranslations("FAQ");
  const faqs = FAQ_QUESTION_KEYS.map((key) => ({
    question: t(`questions.${key}.question`),
    answer: t(`questions.${key}.answer`),
  }));
  const breadcrumbSchema = buildFaqBreadcrumbSchema(t("header.title"));
  const faqSchema = buildFaqSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <FAQ />
    </>
  );
}
