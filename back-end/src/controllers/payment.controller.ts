import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import qs from "qs";
import { ENV } from "@/config/env";
import { BaseController } from "./base.controller";
import { AgentService } from "@/services/agent.service";
import { AuthService } from "@/services/auth.service";
import { TransactionService } from "@/services/transaction.service";
import { TransactionStatus, TransactionType } from "@/models/transaction.model";
import mongoose from "mongoose";

export class PaymentController extends BaseController {
  private agentService: AgentService;
  private authService: AuthService;
  private transactionService: TransactionService;

  constructor() {
    super();
    this.agentService = new AgentService();
    this.authService = new AuthService();
    this.transactionService = new TransactionService();
  }

  createPaymentUrl = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    this.handleRequest(req, res, next, async () => {
      const date = new Date();
      const createDate = this.formatDate(date);

      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "127.0.0.1";

      const tmnCode = ENV.VNP_TMN_CODE;
      const secretKey = ENV.VNP_HASH_SECRET;
      let vnpUrl = ENV.VNP_URL;
      const returnUrl = ENV.VNP_RETURN_URL;

      const orderId = `${date.getHours()}${date.getMinutes()}${date.getSeconds()}${Math.floor(Math.random() * 100)}`;
      const amount = req.body.amount || 500000;
      const bankCode = req.body.bankCode;

      let locale = req.body.language || "vn";
      const currCode = "VND";
      let vnp_Params: any = {};

      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = "Upgrade to Pro for Agent";
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;

      if (bankCode) {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = this.sortObject(vnp_Params);

      const signData = qs.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

      // Lưu giao dịch PENDING trước khi chuyển hướng sang VNPay
      const currentUser = req.user;
      if (currentUser) {
        const agent = await this.agentService.getAgentByUserId(
          currentUser.userId._id,
        );
        if (agent) {
          await this.transactionService.createTransaction({
            agentId: agent._id as unknown as mongoose.Schema.Types.ObjectId,
            userId: currentUser.userId
              ._id as unknown as mongoose.Schema.Types.ObjectId,
            transactionRef: orderId,
            amount,
            orderInfo: "Upgrade to Pro for Agent",
            type: TransactionType.UPGRADE_PRO,
            status: TransactionStatus.PENDING,
            planDurationMonths: 1,
          });
        }
      }

      return vnpUrl;
    });
  };

  vnpayReturn = async (req: Request, res: Response, next: NextFunction) => {
    this.handleRequest(req, res, next, async () => {
      let vnp_Params = req.query as Record<string, any>;
      const secureHash = vnp_Params["vnp_SecureHash"];
      const transactionRef = vnp_Params["vnp_TxnRef"];
      const orderInfo = vnp_Params["vnp_OrderInfo"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = this.sortObject(vnp_Params);

      const secretKey = ENV.VNP_HASH_SECRET;
      const signData = qs.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      if (secureHash === signed) {
        const responseCode = vnp_Params["vnp_ResponseCode"];
        const isSuccess = responseCode === "00";

        // Cập nhật trạng thái giao dịch đã lưu
        await this.transactionService.updateTransactionStatus(
          transactionRef as string,
          isSuccess ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
          {
            responseCode: responseCode as string,
            bankCode: vnp_Params["vnp_BankCode"] as string,
            bankTransNo: vnp_Params["vnp_BankTranNo"] as string,
            cardType: vnp_Params["vnp_CardType"] as string,
            payDate: vnp_Params["vnp_PayDate"] as string,
            rawVnpayResponse: req.query as Record<string, any>,
          },
        );

        if (isSuccess) {
          // Upgrade agent plan on successful payment
          const currentUser = req.user;
          if (currentUser) {
            const agent = await this.agentService.getAgentByUserId(
              currentUser.userId._id,
            );
            if (agent) {
              const now = new Date();
              const endDate = new Date(now);
              endDate.setMonth(endDate.getMonth() + 1);
              await this.transactionService.updateTransactionStatus(
                transactionRef as string,
                TransactionStatus.SUCCESS,
                { planStartDate: now, planEndDate: endDate },
              );
              await this.agentService.updateAgentRegistration(
                agent._id.toString(),
                {
                  planInfo: {
                    plan: "PRO",
                    startDate: now,
                    endDate,
                    transactionRef: transactionRef as string,
                  },
                },
              );
            }
          }
          return { message: "Payment Success", code: "00" };
        } else {
          return { message: "Payment Error", code: responseCode };
        }
      } else {
        return { message: "Invalid Signature", code: "97" };
      }
    });
  };

  private sortObject(obj: any) {
    let sorted: any = {};
    let str = [];
    let key;
    for (key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }

  private formatDate(date: Date) {
    const yyyy = date.getFullYear().toString();
    const MM = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    const HH = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    const ss = date.getSeconds().toString().padStart(2, "0");
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
  }
}
