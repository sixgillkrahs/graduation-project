import { singleton } from "@/decorators/singleton";
import { QdrantClient } from "@qdrant/js-client-rest";
import { logger } from "@/config/logger";
import { ENV } from "@/config/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

@singleton
export class QdrantService {
  private client: QdrantClient;
  private collectionName = ENV.QDRANT_COLLECTION;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.client = new QdrantClient({
      url: ENV.QDRANT_URL,
      apiKey: ENV.QDRANT_API_KEY,
    });
    this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    this.initCollection();
  }

  private initCollection = async () => {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === this.collectionName,
      );

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 768, // text-embedding-004 from Gemini outputs 768 dimensions
            distance: "Cosine",
          },
        });
        logger.info(`Created Qdrant collection: ${this.collectionName}`);
      } else {
        logger.info(`Qdrant collection ${this.collectionName} already exists`);
      }
    } catch (error) {
      logger.error("Error initializing Qdrant collection:", error);
    }
  };

  public generateEmbedding = async (text: string): Promise<number[]> => {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "text-embedding-004",
      });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      logger.error("Error generating embedding with Gemini API:", error);
      throw error;
    }
  };

  public upsertPropertyEmbedding = async (
    propertyId: string,
    textData: string,
    payload: any = {},
  ) => {
    try {
      const vector = await this.generateEmbedding(textData);

      await this.client.upsert(this.collectionName, {
        points: [
          {
            id: propertyId,
            vector,
            payload: {
              ...payload,
              text: textData,
            },
          },
        ],
      });
      logger.info(`Upserted embedding for property ${propertyId}`);
    } catch (error) {
      logger.error(`Error upserting embedding for ${propertyId}:`, error);
    }
  };

  public searchSimilarProperties = async (
    propertyId: string,
    limit: number = 5,
  ) => {
    try {
      // Recommend similar properties by looking up the existing property's vector
      // Alternatively, we can use search with the current property's embedding

      const record = await this.client.retrieve(this.collectionName, {
        ids: [propertyId],
        with_vector: true,
      });

      if (!record || record.length === 0 || !record[0].vector) {
        return [];
      }

      const searchResults = await this.client.search(this.collectionName, {
        vector: record[0].vector as number[],
        limit: limit + 1, // Add 1 because it will likely retrieve itself
      });

      // Filter out the exact same property
      return searchResults
        .filter((res) => res.id !== propertyId)
        .slice(0, limit);
    } catch (error) {
      logger.error(
        `Failed to search similar properties for ${propertyId}:`,
        error,
      );
      return [];
    }
  };
}
