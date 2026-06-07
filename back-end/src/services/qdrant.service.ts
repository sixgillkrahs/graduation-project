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
  private collectionReady: Promise<void>;

  constructor() {
    this.client = new QdrantClient({
      url: ENV.QDRANT_URL,
      apiKey: ENV.QDRANT_API_KEY,
    });
    this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    this.collectionReady = this.initCollection();
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
            size: 3072, // gemini-embedding-001 outputs 3072 dimensions
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
        model: "gemini-embedding-001",
      });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      logger.error("Error generating embedding with Gemini API:", error);
      throw error;
    }
  };

  // Helper functions for MongoDB ObjectId <-> Qdrant UUID
  private mongoIdToUuid = (id: string) =>
    id.slice(0, 8) +
    "-" +
    id.slice(8, 12) +
    "-" +
    id.slice(12, 16) +
    "-" +
    id.slice(16, 20) +
    "-" +
    id.slice(20, 24) +
    "00000000";

  private uuidToMongoId = (uuid: string) =>
    String(uuid).replace(/-/g, "").slice(0, 24);

  public upsertPropertyEmbedding = async (
    propertyId: string,
    textData: string,
    payload: any = {},
  ) => {
    try {
      await this.collectionReady;
      const vector = await this.generateEmbedding(textData);
      const uuid = this.mongoIdToUuid(propertyId);

      await this.client.upsert(this.collectionName, {
        points: [
          {
            id: uuid,
            vector,
            payload: {
              ...payload,
              propertyId,
              text: textData,
            },
          },
        ],
      });
      logger.info(`Upserted embedding for property ${propertyId}`);
    } catch (error) {
      logger.error(`Error upserting embedding for ${propertyId}:`, error);
      throw error;
    }
  };

  public deletePropertyEmbedding = async (propertyId: string) => {
    try {
      await this.collectionReady;
      const uuid = this.mongoIdToUuid(propertyId);

      await this.client.delete(this.collectionName, {
        points: [uuid],
      });
      logger.info(`Deleted embedding for property ${propertyId}`);
    } catch (error) {
      logger.error(`Error deleting embedding for ${propertyId}:`, error);
      throw error;
    }
  };

  public searchSimilarProperties = async (
    propertyId: string,
    limit: number = 5,
  ) => {
    try {
      await this.collectionReady;
      // Recommend similar properties by looking up the existing property's vector
      // Alternatively, we can use search with the current property's embedding

      const uuid = this.mongoIdToUuid(propertyId);

      const record = await this.client.retrieve(this.collectionName, {
        ids: [uuid],
        with_vector: true,
      });

      if (!record || record.length === 0 || !record[0].vector) {
        return [];
      }

      const searchResults = await this.client.search(this.collectionName, {
        vector: record[0].vector as number[],
        limit: limit + 1, // Add 1 because it will likely retrieve itself
      });

      // Filter out the exact same property and map UUID back to Mongo ID
      return searchResults
        .filter((res) => res.id !== uuid)
        .map((res) => ({ ...res, id: this.uuidToMongoId(String(res.id)) }))
        .slice(0, limit);
    } catch (error) {
      logger.error(
        `Failed to search similar properties for ${propertyId}:`,
        error,
      );
      return [];
    }
  };

  public searchPropertiesByQuery = async (
    query: string,
    limit: number = 10,
  ) => {
    try {
      await this.collectionReady;
      const vector = await this.generateEmbedding(query);

      const searchResults = await this.client.search(this.collectionName, {
        vector,
        limit,
        with_payload: true,
      });

      return searchResults.map((res) => ({
        id: this.uuidToMongoId(String(res.id)),
        score: Number(res.score || 0),
        payload: res.payload || {},
      }));
    } catch (error) {
      logger.error(`Failed to search properties by query "${query}":`, error);
      return [];
    }
  };
}
