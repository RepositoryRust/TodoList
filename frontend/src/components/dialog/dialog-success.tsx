import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

export function SuccessDialog({
  open,
  onOpenChange,
  email,
}: SuccessDialogProps) {
  const navigate = useNavigate();

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      navigate("/login", { replace: true });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-50% border-zinc-800 text-center bg-card"
      >
        <div className="flex flex-col items-center gap-5 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <CircleCheck className="h-10 w-10 text-green-600" />
          </div>
          <DialogHeader className="items-center gap-2 text-center">
            <DialogTitle className="text-xl font-bold">
              Registration Successful
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-center">
              We&apos;ve sent a verification link to
            </DialogDescription>
          </DialogHeader>
          <div className="-mt-3 space-y-2">
            <p className="font-semibold">{email}</p>
            <p className="text-xs text-muted-foreground">
              Click the link in the email to activate your account. <br />
              If you don&apos;t see it, check your spam folder.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
