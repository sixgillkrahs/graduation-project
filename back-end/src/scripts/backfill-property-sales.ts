import mongoDB from "@/config/database";
import { logger } from "@/config/logger";
import PropertyModel, {
  type IProperty,
  PropertyStatusEnum,
} from "@/models/property.model";
import PropertySaleModel from "@/models/property-sale.model";
import { PropertySaleService } from "@/services/property-sale.service";
import mongoose from "mongoose";

type ScriptOptions = {
  dryRun: boolean;
  limit?: number;
  batchSize: number;
};

type BackfillStats = {
  scanned: number;
  created: number;
  updated: number;
  failed: number;
};

const parseNumberArg = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error(`Invalid numeric argument: ${value}`);
  }

  return parsedValue;
};

const parseArgs = (argv: string[]): ScriptOptions => {
  const options: ScriptOptions = {
    dryRun: false,
    batchSize: 100,
  };

  argv.forEach((arg, index) => {
    if (arg === "--dry-run") {
      options.dryRun = true;
      return;
    }

    if (arg.startsWith("--limit=")) {
      options.limit = parseNumberArg(arg.split("=")[1]);
      return;
    }

    if (arg === "--limit") {
      options.limit = parseNumberArg(argv[index + 1]);
      return;
    }

    if (arg.startsWith("--batch-size=")) {
      options.batchSize = parseNumberArg(arg.split("=")[1]) || 100;
      return;
    }

    if (arg === "--batch-size") {
      options.batchSize = parseNumberArg(argv[index + 1]) || 100;
    }
  });

  return options;
};

const inferSoldAt = (property: IProperty) => {
  if (property.salesInfo?.soldAt) {
    return new Date(property.salesInfo.soldAt);
  }

  if (property.updatedAt) {
    return new Date(property.updatedAt);
  }

  if (property.createdAt) {
    return new Date(property.createdAt);
  }

  return new Date();
};

const buildSalePayload = (property: IProperty) => ({
  ...property.salesInfo,
  soldPrice:
    property.salesInfo?.soldPrice ?? String(property.features?.price ?? 0),
  soldAt: inferSoldAt(property),
});

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  const propertySaleService = new PropertySaleService();
  const stats: BackfillStats = {
    scanned: 0,
    created: 0,
    updated: 0,
    failed: 0,
  };
  const failures: string[] = [];

  logger.info("Starting property sales backfill", options);

  await mongoDB.connect();

  try {
    const existingSales = await PropertySaleModel.find({}, "propertyId")
      .lean()
      .exec();
    const existingSaleIds = new Set(
      existingSales.map((sale) => sale.propertyId.toString()),
    );

    const query = PropertyModel.find({ status: PropertyStatusEnum.SOLD })
      .sort({ _id: 1 })
      .lean();

    if (options.limit) {
      query.limit(options.limit);
    }

    const cursor = query.cursor({ batchSize: options.batchSize });

    while (true) {
      const property = (await cursor.next()) as
        | (IProperty & { _id: mongoose.Types.ObjectId | string })
        | null;

      if (!property) {
        break;
      }

      stats.scanned += 1;

      const propertyId = property._id?.toString();
      if (!propertyId) {
        stats.failed += 1;
        failures.push(`missing-property-id#${stats.scanned}`);
        continue;
      }

      const existedBefore = existingSaleIds.has(propertyId);

      if (options.dryRun) {
        if (existedBefore) {
          stats.updated += 1;
        } else {
          stats.created += 1;
        }
        continue;
      }

      try {
        const saleRecord = await propertySaleService.upsertPropertySale(
          property,
          buildSalePayload(property),
        );

        if (!saleRecord) {
          stats.failed += 1;
          failures.push(propertyId);
          continue;
        }

        if (existedBefore) {
          stats.updated += 1;
        } else {
          stats.created += 1;
          existingSaleIds.add(propertyId);
        }
      } catch (error) {
        stats.failed += 1;
        failures.push(propertyId);
        logger.error("Failed to backfill property sale", {
          propertyId,
          error,
        });
      }
    }

    logger.info("Property sales backfill completed", {
      dryRun: options.dryRun,
      ...stats,
      failureSample: failures.slice(0, 10),
    });
  } finally {
    await mongoDB.disconnect();
  }

  if (stats.failed > 0) {
    process.exitCode = 1;
  }
};

run().catch(async (error) => {
  logger.error("Property sales backfill crashed", { error });

  try {
    await mongoDB.disconnect();
  } catch (disconnectError) {
    logger.error("Failed to disconnect after backfill crash", {
      error: disconnectError,
    });
  }

  process.exit(1);
});
