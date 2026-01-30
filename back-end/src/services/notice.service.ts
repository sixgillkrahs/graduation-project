import { singleton } from "@/decorators/singleton";
import NoticeModel, { INotice } from "@/models/notice.model";
import { PopulateOptions } from "mongoose";

@singleton
export class NoticeService {
  constructor() {}

  createNotice = async (noticeData: INotice) => {
    return await NoticeModel.create(noticeData);
  };

  getNoticeById = async (
    id: string,
    populate?: string | PopulateOptions | (string | PopulateOptions)[],
    select?: string,
  ) => {
    const query = NoticeModel.findById(id);

    if (populate) {
      query.populate(Array.isArray(populate) ? populate : [populate]);
    }

    if (select) {
      query.select(select);
    }
    return query.lean().exec() as Promise<INotice | null>;
  };

  updateNotice = async (id: string, updateData: Partial<INotice>) => {
    return await NoticeModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();
  };

  deleteNotice = async (id: string) => {
    return await NoticeModel.findByIdAndDelete(id).lean().exec();
  };

  getNotices = async (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any> = {},
    select?: string,
  ) => {
    return await NoticeModel.paginate?.(options, filter, select);
  };
}
