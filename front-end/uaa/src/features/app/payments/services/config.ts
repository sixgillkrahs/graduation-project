export const PaymentQueryKey = {
  getUpgradeTransactions: "payments/getUpgradeTransactions",
  getUpgradeSummary: "payments/getUpgradeSummary",
};

export const PaymentEndpoint = {
  getUpgradeTransactions: () => "/payment/admin/transactions",
  getUpgradeSummary: () => "/payment/admin/summary",
};
