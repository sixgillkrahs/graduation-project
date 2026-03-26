"use client";

import { toast } from "@/lib/toast";
import { useState } from "react";
import { useGetAccountLockAppealContext } from "./services/query";
import { useSubmitAccountLockAppeal } from "./services/mutate";

type AccountLockAppealProps = {
  token: string;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Forever";
  }

  return new Date(value).toLocaleString("vi-VN");
};

const AccountLockAppeal = ({ token }: AccountLockAppealProps) => {
  const { data, isLoading, error } = useGetAccountLockAppealContext(token);
  const { mutateAsync: submitAppeal, isPending } = useSubmitAccountLockAppeal();
  const [reason, setReason] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const context = data?.data;
  const lockReason = context?.lockReason?.trim() || "No reason provided";

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please enter your explanation.");
      return;
    }

    await submitAppeal({
      token,
      reason: reason.trim(),
      contactEmail: contactEmail.trim() || undefined,
    });

    setIsSubmitted(true);
    toast.success("Your explanation has been sent to the admin team.");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-[28px] border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">Loading account lock information...</p>
        </div>
      </div>
    );
  }

  if (error || !context) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-[28px] border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-foreground">This link is no longer valid</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The account may already be unlocked or the appeal link has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-14">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">
            Account Review
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Submit an explanation for your locked agent account
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            The admin team will review your explanation and decide whether the account should be
            unlocked.
          </p>

          <div className="mt-8 rounded-[26px] border border-rose-200 bg-rose-950 px-5 py-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-200">
              Lock reason
            </p>
            <p className="mt-3 text-base font-medium leading-7 text-rose-50">{lockReason}</p>
          </div>

          <div className="mt-8 space-y-4 rounded-[24px] border border-rose-100 bg-white/80 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Agent</p>
              <p className="mt-1 font-medium text-slate-900">{context.fullName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
              <p className="mt-1 font-medium text-slate-900">{context.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Lock type</p>
              <p className="mt-1 font-medium text-slate-900">
                {context.lockType === "PERMANENT" ? "Permanent" : "Temporary"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Lock reason</p>
              <p className="mt-1 font-medium text-slate-900">{lockReason}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Locked until</p>
              <p className="mt-1 font-medium text-slate-900">
                {context.lockType === "PERMANENT"
                  ? "Forever"
                  : formatDateTime(context.lockedUntil)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-border bg-card p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Explain your case</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Write clearly what happened, why the account should be reopened, and any relevant
            evidence or context.
          </p>

          {context.hasPendingRequest || isSubmitted ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              Your explanation has already been submitted and is waiting for admin review.
            </div>
          ) : (
            <>
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Contact email
                </label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                  placeholder="your-email@example.com"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Explanation
                </label>
                <textarea
                  className="min-h-[180px] w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
                  placeholder="Explain why the account should be unlocked..."
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>

              <button
                type="button"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? "Sending..." : "Send explanation to admin"}
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AccountLockAppeal;
