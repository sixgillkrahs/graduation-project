import mongoose from "mongoose";
import collections from "./config/collections";
import toJSON from "./plugins/toJSON.plugin";
import paginate from "./plugins/paginate.plugin";

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum TransactionType {
  UPGRADE_PRO = "UPGRADE_PRO",
  RENEWAL = "RENEWAL",
}

export interface ITransaction {
  agentId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  transactionRef: string; // vnp_TxnRef - mã giao dịch VNPay
  amount: number; // Số tiền (VND)
  bankCode?: string; // Ngân hàng thực hiện
  bankTransNo?: string; // Mã GD phía ngân hàng (vnp_BankTranNo)
  cardType?: string; // Loại thẻ (ATM, QRCODE...)
  orderInfo?: string; // Mô tả đơn hàng
  payDate?: string; // Ngày thanh toán từ VNPay
  responseCode?: string; // Mã phản hồi (Optional khi PENDING)
  type: TransactionType;
  status: TransactionStatus;
  planDurationMonths: number; // Số tháng đăng ký
  planStartDate?: Date;
  planEndDate?: Date;
  rawVnpayResponse?: Record<string, any>; // Lưu nguyên response gốc để audit
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionModel extends mongoose.Model<ITransaction> {
  paginate?: (
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      populate?: string;
    },
    filter: Record<string, any>,
    select?: string,
  ) => Promise<mongoose.HydratedDocument<ITransaction>[]>;
}

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.agents,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: collections.users,
      required: true,
    },
    transactionRef: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    bankCode: {
      type: String,
      trim: true,
    },
    bankTransNo: {
      type: String,
      trim: true,
    },
    cardType: {
      type: String,
      trim: true,
    },
    orderInfo: {
      type: String,
      trim: true,
    },
    payDate: {
      type: String,
      trim: true,
    },
    responseCode: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: TransactionType,
      default: TransactionType.UPGRADE_PRO,
    },
    status: {
      type: String,
      enum: TransactionStatus,
      default: TransactionStatus.PENDING,
    },
    planDurationMonths: {
      type: Number,
      default: 1,
    },
    planStartDate: {
      type: Date,
    },
    planEndDate: {
      type: Date,
    },
    rawVnpayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.plugin(toJSON as any);
transactionSchema.plugin(paginate as any);

const TransactionModel = mongoose.model<ITransaction>(
  collections.transactions,
  transactionSchema,
);

export default TransactionModel;
