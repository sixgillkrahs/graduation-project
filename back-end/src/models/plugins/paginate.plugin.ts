import mongoose, { Schema, Model, Document, FilterQuery } from "mongoose";

/* =======================
 * Types
 * ======================= */

export interface PaginateOptions {
  sortBy?: string;
  populate?: string;
  limit?: number | string;
  page?: number | string;
}

export interface PaginateResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PaginateModel<T extends Document> extends Model<T> {
  paginate(
    options: PaginateOptions,
    filter: FilterQuery<T>,
    select?: string,
  ): Promise<PaginateResult<T>>;
}

/* =======================
 * Plugin
 * ======================= */

const paginate = <T extends Document>(schema: Schema<T>) => {
  schema.statics.paginate = async function (
    options: PaginateOptions,
    filter: FilterQuery<T>,
    select?: string,
  ): Promise<PaginateResult<T>> {
    /* -------- sort -------- */
    let sort = "createdAt";

    if (options.sortBy) {
      sort = options.sortBy
        .split(",")
        .map((sortOption) => {
          const [key, order] = sortOption.split(":");
          return `${order === "desc" ? "-" : ""}${key}`;
        })
        .join(" ");
    }

    /* -------- pagination -------- */
    const limit =
      options.limit && Number(options.limit) > 0 ? Number(options.limit) : 10;

    const page =
      options.page && Number(options.page) > 0 ? Number(options.page) : 1;

    const skip = (page - 1) * limit;

    /* -------- query -------- */
    const countPromise = this.countDocuments(filter).exec();

    let query = this.find(filter).sort(sort).skip(skip).limit(limit);
    if (select) {
      query = query.select(select);
    }

    /* -------- populate -------- */
    if (options.populate) {
      options.populate.split(",").forEach((item) => {
        if (item.includes(":")) {
          const [path, select] = item.split(":");
          query = query.populate({ path, select });
        } else {
          query = query.populate(item);
        }
      });
    }

    const docsPromise = query.exec();

    const [totalResults, results] = await Promise.all([
      countPromise,
      docsPromise,
    ]);

    return {
      results,
      page,
      limit,
      totalPages: Math.ceil(totalResults / limit),
      totalResults,
    };
  };
};

export default paginate;
