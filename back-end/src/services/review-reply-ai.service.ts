import { ENV } from "@/config/env";
import { logger } from "@/config/logger";
import { singleton } from "@/decorators/singleton";
import { GoogleGenerativeAI } from "@google/generative-ai";

type GenerateReviewReplyDraftInput = {
  rating: number;
  tags: string[];
  comment?: string;
  propertyName: string;
};

@singleton
export class ReviewReplyAiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
  }

  private normalizeDraft(text: string) {
    return text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/^["'\s]+|["'\s]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  async generateDraft(input: GenerateReviewReplyDraftInput) {
    const modelName = ENV.REVIEW_REPLY_GEMINI_MODEL;
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: [
        "You write public-facing review replies for a Vietnamese real estate agent.",
        "Return plain Vietnamese text only, no markdown, no bullets, no quotes.",
        "Keep it to 1-3 short sentences and under 320 characters.",
        "Sound warm, professional, and trustworthy.",
        "Do not mention private data, phone numbers, email, or personal addresses.",
        "Do not promise legal, financial, or guaranteed outcomes.",
        "If the rating is 1-3 stars, acknowledge feedback and apologize briefly.",
        "If the rating is 4-5 stars, thank the customer and wish them well.",
      ].join(" "),
    });

    const prompt = [
      "Generate one concise Vietnamese reply draft for this published review.",
      `Rating: ${input.rating}/5`,
      `Quick tags: ${input.tags.length > 0 ? input.tags.join(", ") : "none"}`,
      `Property: ${input.propertyName}`,
      `Customer comment: ${input.comment?.trim() || "No detailed comment provided."}`,
      "Reply should feel human and suitable for posting under a public review.",
    ].join("\n");

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 180,
        },
      });
      const draft = this.normalizeDraft(result.response.text());

      if (!draft) {
        throw new Error("Empty AI draft");
      }

      return {
        draft,
        model: modelName,
      };
    } catch (error) {
      logger.error("[ReviewReplyAiService] failed to generate draft", {
        context: "ReviewReplyAiService.generateDraft",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}
