import { useEffect, useState, type SyntheticEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { CircleCheck, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resendVerificationEmail } from "@/lib/api";
import { cn, validateEmail } from "@/lib/utils";

type ResendState = "idle" | "submitting" | "sent";

export default function ResendVerificationPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email")?.trim() ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<ResendState>("idle");
  const [error, setError] = useState("");
  const [visibleError, setVisibleError] = useState(error);

  const isEmailValid = validateEmail(email);
  const emailError = email && !isEmailValid ? "Email is not valid" : "";
  const formError = error || emailError;

  useEffect(() => {
    if (formError) {
      setVisibleError(formError);
      return;
    }

    const timeout = window.setTimeout(() => setVisibleError(""), 300);
    return () => window.clearTimeout(timeout);
  }, [formError]);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isEmailValid || state === "submitting") return;

    try {
      setError("");
      setState("submitting");
      await resendVerificationEmail(email.trim());
      setState("sent");
    } catch (err) {
      console.log("ini error", err.message);
      setState("idle");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again later.",
      );
    }
  }

  function handleUseAnotherEmail() {
    setEmail("");
    setError("");
    setState("idle");
  }

  if (state === "sent") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1B1B1B] px-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CircleCheck className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Check your inbox
            </h1>
            <p className="text-sm text-muted-foreground">
              If the email is registered and not verified, we sent a new
              verification link. Please check your inbox and spam folder.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              render={(props) => <Link to="/login" {...props} />}
              className="w-full"
              size="lg"
            >
              Go to Login
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleUseAnotherEmail}
              className="w-full"
              size="lg"
            >
              Use Another Email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1B1B1B] px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MailCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Resend verification email
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email address and confirm to request a new verification
              link.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(formError)}>
              <FieldLabel htmlFor="resend-email">Email</FieldLabel>
              <Input
                id="resend-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                disabled={state === "submitting"}
                aria-invalid={Boolean(formError)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
              <FieldDescription>
                We&apos;ll only send a new link if this account exists and is
                not verified yet.
              </FieldDescription>
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                  formError
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  {visibleError && <FieldError>{visibleError}</FieldError>}
                </div>
              </div>
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={!isEmailValid || state === "submitting"}
                className="w-full"
                size="lg"
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Confirm and Send Link"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Already verified? <Link to="/login">Go to login</Link>
        </p>
      </div>
    </div>
  );
}
