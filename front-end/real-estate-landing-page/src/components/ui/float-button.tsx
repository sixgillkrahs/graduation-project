"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { CsButton } from "../custom";

interface FloatButtonProps extends React.ComponentProps<"button"> {
  href?: string;
}

function FloatButton({ className, href, onClick, ...props }: FloatButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (href) {
      router.push(href);
    }
    onClick?.(e);
  };

  return (
    <CsButton
      className={cn(
        "fixed bottom-6 right-6 h-6 w-6 rounded-full shadow-lg flex items-center justify-center z-50",
        className,
      )}
      onClick={handleClick}
      {...props}
    />
  );
}

export { FloatButton };
