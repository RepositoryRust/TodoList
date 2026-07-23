import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CircleCheck, Loader2 } from "lucide-react";

import { verifyEmail } from "@/lib/api";
import { Button } from "@/components/ui/button";

type VerifyState = "loading" | "success";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token")?.trim() ?? "";
  const [state, setState] = useState<VerifyState>("loading");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const controller = new AbortController();

    async function verify() {
      try {
        const result = await verifyEmail(token, controller.signal);

        if (result.verified) {
          setState("success");
          return;
        }

        navigate("/login", { replace: true });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        navigate("/login", { replace: true });
      }
    }

    verify();
    return () => controller.abort();
  }, [token, navigate]);

  useEffect(() => {
    if (state !== "success") return;
    const timeout = window.setTimeout(() => navigate("/login"), 2000);
    return () => window.clearTimeout(timeout);
  }, [navigate, state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1B1B1B] px-6">
      <div className="w-full max-w-md text-center space-y-6">
        {state === "loading" && (
          <>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Verifying your email
              </h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we confirm your email address...
              </p>
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CircleCheck className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Email verified
              </h1>
              <p className="text-sm text-muted-foreground">
                Your email has been successfully verified. Redirecting you to
                the login page...
              </p>
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full"
              size="lg"
            >
              Go to Login Now
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
