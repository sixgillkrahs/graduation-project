import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { CheckCircle2, Mail } from "lucide-react";
import { CsButton } from "@/components/custom";
import { toast } from "sonner";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerData: {
    name?: string;
    email?: string;
  };
}

export const CelebrationModal = React.memo(
  ({ isOpen, onClose, customerData }: CelebrationModalProps) => {
    useEffect(() => {
      if (isOpen) {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 9999,
        };

        const randomInRange = (min: number, max: number) =>
          Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          });
        }, 250);

        return () => clearInterval(interval);
      }
    }, [isOpen]);

    const handleSendEmail = () => {
      toast.success(
        `Congratulation email has been sent to ${customerData.email}! 📧`,
      );
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center flex flex-col items-center justify-center border-none bg-white rounded-3xl shadow-2xl px-8 pt-12 pb-10">
          <DialogHeader className="sr-only">
            <DialogTitle>Celebration Success</DialogTitle>
            <DialogDescription>
              Property successfully marked as sold.
            </DialogDescription>
          </DialogHeader>

          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-8 ring-green-100/50">
            <CheckCircle2 className="w-12 h-12 text-green-500 transform animate-[bounce_1s_ease-in-out_infinite]" />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Deal Closed! 🚀
          </h2>
          <p className="text-gray-500 mb-8 max-w-[280px]">
            Congratulations! The property has been marked as{" "}
            <strong>SOLD</strong> and removed from the active public listings.
          </p>

          {customerData.email && (
            <div className="w-full bg-blue-50/80 border border-blue-100 p-5 rounded-2xl mb-8 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-white p-2.5 rounded-xl shadow-sm shrink-0 border border-blue-50">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-gray-900 mb-1">
                    Email đã được gửi tự động
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    Hệ thống đã tự động gửi email chúc mừng giao dịch thành công
                    đến{" "}
                    <strong>{customerData.name || customerData.email}</strong>.
                  </p>
                  <CsButton
                    onClick={handleSendEmail}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-medium text-sm transition-all duration-300"
                  >
                    Xác nhận & Đóng
                  </CsButton>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-sm font-semibold tracking-wide uppercase transition relative group"
          >
            Close Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gray-300 transition-all duration-300 group-hover:w-full"></span>
          </button>
        </DialogContent>
      </Dialog>
    );
  },
);

CelebrationModal.displayName = "CelebrationModal";
