"use client";

import { useRouter } from "next/navigation";

const LocaleSwitcher = ({
  className = "",
}: {
  className?: string;
}) => {
  const router = useRouter();

  const setLocale = async (locale: "en" | "vi") => {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    router.refresh();
  };

  return (
    <div className={`flex gap-3 items-center ${className}`}>
      <button
        type="button"
        className="underline text-[16px]! cs-paragraph cursor-pointer"
        onClick={() => setLocale("vi")}
      >
        vi
      </button>
      <button
        type="button"
        className="underline text-[16px]! cs-paragraph cursor-pointer"
        onClick={() => setLocale("en")}
      >
        en
      </button>
    </div>
  );
};

export default LocaleSwitcher;
