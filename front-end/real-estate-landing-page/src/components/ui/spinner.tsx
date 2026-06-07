import { Loader2Icon } from "lucide-react";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const locale = useLocale();

  return (
    <Loader2Icon
      role="status"
      aria-label={locale === "vi" ? "Đang tải" : "Loading"}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
