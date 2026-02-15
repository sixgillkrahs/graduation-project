"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { LockKeyhole, LogIn } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface AuthActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  triggerElement?: React.ReactNode;
  redirectUrl?: string; // URL để redirect sau khi login thành công (thường truyền qua query param)
}

export function AuthActionDialog({
  open,
  onOpenChange,
  title = "Yêu cầu đăng nhập",
  description = "Bạn cần đăng nhập để thực hiện tính năng này. Hãy đăng nhập ngay để trải nghiệm đầy đủ nhé!",
  redirectUrl,
}: AuthActionDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const returnUrl = redirectUrl || pathname;
      const loginUrl = `/sign-in?callbackUrl=${encodeURIComponent(returnUrl)}`;

      onOpenChange(false);
      router.push(loginUrl);
      setIsLoading(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden gap-0 border-none shadow-2xl bg-white dark:bg-zinc-950">
        {/* Header với Background Gradient nhẹ & Icon Animation */}
        <div className="relative flex flex-col items-center justify-center p-8 pb-6 bg-linear-to-b from-primary/5 to-transparent dark:from-primary/10">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                }}
                className="relative"
              >
                {/* Vòng tròn nền icon hiệu ứng pulse */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />

                {/* Icon chính */}
                <div className="relative flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-full ring-4 ring-white dark:ring-zinc-950 shadow-lg">
                  <LockKeyhole size={32} strokeWidth={2.5} />
                </div>

                {/* Decor items nhỏ bay quanh (optional) */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-1 -right-1 bg-yellow-400 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <DialogHeader className="mt-6 text-center space-y-2">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground max-w-full mx-auto leading-relaxed text-center">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex flex-col sm:flex-col gap-3 p-6 pt-2 bg-background">
          <Button
            size="lg"
            className={cn(
              "w-full text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300",
              "bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
            )}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Đang chuyển hướng...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={18} />
                Đăng nhập ngay
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={() => onOpenChange(false)}
          >
            Để sau, tôi chỉ đang xem thôi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
