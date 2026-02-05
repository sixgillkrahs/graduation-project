import { memo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../animate-ui/components/radix/alert-dialog";

interface CsAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  action: string;
  cancel: string;
  actionClick: () => void;
  cancelClick: () => void;
  actionClassName?: string;
}

export const CsAlert = memo(
  ({
    open,
    onOpenChange,
    title,
    description,
    action,
    cancel,
    actionClick,
    cancelClick,
    actionClassName,
  }: CsAlertProps) => {
    console.log("open", open);
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelClick}>
              {cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={actionClick}
              className={actionClassName}
            >
              {action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
