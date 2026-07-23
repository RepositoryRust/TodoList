import { cn, validateEmail } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, type SyntheticEvent } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<"password" | "text">(
    "password",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmailValid = validateEmail(email);
  const emailError = email && !isEmailValid ? "Email is not valid" : "";
  const showResendVerification =
    error === "Please verify your email first" && isEmailValid;
  const [visibleEmailError, setVisibleEmailError] = useState(emailError);
  const [visibleError, setVisibleError] = useState(error);

  useEffect(() => {
    if (emailError) {
      setVisibleEmailError(emailError);
      return;
    }
    const timeout = window.setTimeout(() => setVisibleEmailError(""), 300);
    return () => window.clearTimeout(timeout);
  }, [emailError]);

  useEffect(() => {
    if (error) {
      setVisibleError(error);
      return;
    }
    const timeout = window.setTimeout(() => setVisibleError(""), 300);
    return () => window.clearTimeout(timeout);
  }, [error]);

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <img
              src="/assets/todolist-large.svg"
              alt="Logo"
              className="h-20 w-20"
            />
            <h1 className="text-xl font-bold">Login to your account</h1>
            <FieldDescription>
              Don&apos;t have an account? <Link to="/register">Sign up</Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                Boolean(emailError)
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                {visibleEmailError && (
                  <FieldDescription className="text-destructive">
                    {visibleEmailError}
                  </FieldDescription>
                )}
              </div>
            </div>
          </Field>
          <Field className="-mt-1.5">
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="text-xs shrink-0">
                <Field orientation="horizontal">
                  <Checkbox
                    id="show-password-checkbox"
                    className="size-3.5"
                    checked={showPassword === "text"}
                    onCheckedChange={(checked) =>
                      setShowPassword(checked === true ? "text" : "password")
                    }
                  />
                  <Label htmlFor="show-password-checkbox" className="-ml-1">
                    Show password
                  </Label>
                </Field>
              </div>
            </div>
            <Input
              id="password"
              type={showPassword}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                Boolean(error)
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                {visibleError && (
                  <div className="space-y-1">
                    <FieldDescription className="text-destructive">
                      {visibleError}
                    </FieldDescription>
                    {showResendVerification && (
                      <FieldDescription>
                        Didn&apos;t receive the email?{" "}
                        <Link
                          to={`/resend-verification?email=${encodeURIComponent(email)}`}
                        >
                          Resend verification link
                        </Link>
                      </FieldDescription>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Field>
          <Field>
            <Button type="submit" disabled={!isEmailValid || loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </Field>
          <FieldSeparator></FieldSeparator>
          <Field className="grid gap-4 grid-cols-2">
            <Button variant="outline" type="button">
              <img
                src="/assets/github.svg"
                alt="Github"
                className="w-6 dark:invert"
              />
            </Button>
            <Button variant="outline" type="button">
              <img src="/assets/google.svg" alt="Google" className="w-6" />
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
