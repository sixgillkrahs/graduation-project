declare namespace IAccountLockAppealService {
  interface Context {
    fullName: string;
    email: string;
    lockType: "TEMPORARY" | "PERMANENT";
    lockReason?: string | null;
    lockedAt: string;
    lockedUntil?: string | null;
    hasPendingRequest: boolean;
  }

  interface SubmitPayload {
    token: string;
    reason: string;
    contactEmail?: string;
  }
}
