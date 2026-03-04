export const PaymentEndpoint = {
  VNPay: () => `/payment/create_payment_url`,
  MoMo: () => `/payment/create_momo_payment_url`,
  Downgrade: () => `/payment/downgrade`,
} as const;
