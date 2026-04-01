declare namespace IPaymentService {
  interface UpgradeTransaction {
    id: string;
    _id: string;
    transactionRef: string;
    amount: number;
    orderInfo?: string;
    status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
    type: "UPGRADE_PRO" | "RENEWAL";
    planDurationMonths: number;
    planStartDate?: string | null;
    planEndDate?: string | null;
    payDate?: string;
    responseCode?: string;
    bankCode?: string;
    bankTransNo?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
      id?: string | null;
      fullName?: string;
      email?: string;
      phone?: string;
    };
    agent?: {
      id?: string | null;
      status?: string;
      currentPlan?: string;
      currentPlanStartDate?: string | null;
      currentPlanEndDate?: string | null;
    };
  }

  interface UpgradeTransactionSummary {
    totalRevenue: number;
    totalPurchases: number;
    totalBuyers: number;
    monthlyRevenue: number;
    monthlyPurchases: number;
    activeProAgents: number;
  }
}
