import { singleton } from "@/decorators/singleton";
import TransactionModel, {
  ITransaction,
  TransactionStatus,
} from "@/models/transaction.model";
import mongoose from "mongoose";

@singleton
export class TransactionService {
  createTransaction = async (data: Partial<ITransaction>) => {
    return await TransactionModel.create(data);
  };

  getTransactionByRef = async (transactionRef: string) => {
    return await TransactionModel.findOne({ transactionRef }).lean().exec();
  };

  getTransactionsByAgent = async (
    agentId: string,
    options: { page: number; limit: number; sortBy?: string },
  ) => {
    return await (TransactionModel as any).paginate?.(
      { ...options, sortBy: options.sortBy || "createdAt:desc" },
      { agentId: new mongoose.Types.ObjectId(agentId) },
    );
  };

  updateTransactionStatus = async (
    transactionRef: string,
    status: TransactionStatus,
    additionalData?: Partial<ITransaction>,
  ) => {
    return await TransactionModel.findOneAndUpdate(
      { transactionRef },
      { status, ...additionalData },
      { new: true },
    ).exec();
  };
}
