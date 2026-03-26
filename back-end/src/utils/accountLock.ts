import type { IUser } from "@/models/user.model";

type LockInfo = IUser["lockInfo"];

export const ACCOUNT_LOCK_TYPE = {
  TEMPORARY: "TEMPORARY",
  PERMANENT: "PERMANENT",
} as const;

export type AccountLockState = {
  isLocked: boolean;
  isExpired: boolean;
  isPermanent: boolean;
  lockedAt: Date | null;
  lockedUntil: Date | null;
};

const toDateOrNull = (value?: Date | string | null) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const getAccountLockState = (
  lockInfo?: LockInfo,
  now: Date = new Date(),
): AccountLockState => {
  const lockedAt = toDateOrNull(lockInfo?.lockedAt);
  const lockedUntil = toDateOrNull(lockInfo?.lockedUntil);
  const isPermanent = lockInfo?.lockType === ACCOUNT_LOCK_TYPE.PERMANENT;
  const isExpired =
    lockInfo?.lockType === ACCOUNT_LOCK_TYPE.TEMPORARY &&
    !!lockedUntil &&
    lockedUntil.getTime() <= now.getTime();
  const isLocked =
    !!lockInfo &&
    (isPermanent ||
      (lockInfo.lockType === ACCOUNT_LOCK_TYPE.TEMPORARY &&
        !!lockedUntil &&
        lockedUntil.getTime() > now.getTime()));

  return {
    isLocked,
    isExpired,
    isPermanent,
    lockedAt,
    lockedUntil,
  };
};
