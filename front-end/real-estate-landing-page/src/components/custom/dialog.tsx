import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../animate-ui/components/radix/dialog";
import { DialogFlipDirection } from "../animate-ui/primitives/radix/dialog";
import { CsButton } from "./button";

export interface CsDialogProps {
  /** Variables to control the dialog visibility */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Content props */
  title?: React.ReactNode;
  children?: React.ReactNode;

  /** Footer configuration */
  footer?: React.ReactNode | null; // Pass null to hide footer
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  onOk?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;

  /** Style and Animation props */
  from?: DialogFlipDirection;
  showCloseButton?: boolean;
  width?: string | number;
  className?: string;
}

export const CsDialog = ({
  open,
  onOpenChange,
  title,
  children,
  footer,
  okText = "OK",
  cancelText = "Cancel",
  onOk,
  onCancel,
  loading = false,
  from,
  showCloseButton = true,
  width,
  className,
}: CsDialogProps) => {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && onCancel) {
      // If closing via overlay click or escape, trigger onCancel
      // Note: This matches Antd behavior where mask click triggers onCancel
      // But we need to be careful with types. onCancel expects an event usually in Antd,
      // but here we might just call it without event or create a synthetic one if strictly needed.
      // For simplicity, we just call it.
      onCancel({} as React.MouseEvent<HTMLButtonElement>);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        from={from}
        showCloseButton={showCloseButton}
        className={`gap-0 p-0 overflow-hidden ${className || ""}`}
        style={width ? { maxWidth: width } : undefined}
      >
        {title && (
          <DialogHeader className="px-6 py-4 border-b border-border bg-background">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}

        <div className="p-6">{children}</div>

        {footer !== null && (
          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
            {footer ? (
              footer
            ) : (
              <div className="flex w-full items-center justify-end gap-2">
                <DialogClose asChild>
                  <CsButton onClick={onCancel} type="button">
                    {cancelText}
                  </CsButton>
                </DialogClose>
                <CsButton onClick={onOk} loading={loading} type="button">
                  {okText}
                </CsButton>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
