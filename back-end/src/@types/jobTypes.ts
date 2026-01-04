export interface EmailJob {
  to: string;
  subject: string;
  body: string;
}

export type SendVerifyEmailJob = {
  email: string;
  name?: string;
  token: string;
};

export type SendPasswordResetEmailJob = {
  to: string;
  name: string;
  resetToken: string;
};

export type SendRejectEmailJob = {
  to: string;
  name: string;
  reason: string;
};

export type SendOTPEmailJob = {
  to: string;
  otp: string;
};
