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
import { useState } from "react";
import { CheckCircle2, CircleX } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/api";
import { SuccessDialog } from "../dialog/dialog-success";
import { PASSWORD_RULES } from "@/lib/constants_password";

export default function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState<"password" | "text">(
    "password",
  );
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(form.password),
  }));

  const isEmailValid = validateEmail(form.email);
  const isPasswordValid = passwordChecks.every((c) => c.passed);
  const isConfirmValid =
    form.confirmPassword.length > 0 && form.confirmPassword === form.password;

  const isFormValid = isEmailValid && isPasswordValid && isConfirmValid;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setError("");
      await registerUser(form.email, form.password);
      setOpen(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Create your account</h1>
            <FieldDescription>
              Already have an account? <Link to="/">Sign in</Link>
            </FieldDescription>
          </div>

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

          <FieldSeparator />

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setError("");
              }}
            />
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                (form.email && !isEmailValid) || error
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                {!isEmailValid && form.email && (
                  <FieldDescription className="text-destructive">
                    Email is not valid
                  </FieldDescription>
                )}
                {error && (
                  <FieldDescription className="text-destructive">
                    {error}
                  </FieldDescription>
                )}
              </div>
            </div>
          </Field>

          <Field className="-mt-1.5">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type={showPassword}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>

          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
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
              id="confirm-password"
              type={showPassword}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                form.confirmPassword && !isConfirmValid
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <FieldDescription className="text-destructive mb-2">
                  Confirm password does not match
                </FieldDescription>
              </div>
            </div>
          </Field>
          <FieldDescription >
            <ul className="space-y-1 sm:text-xs text-[11px] -mt-4">
              {passwordChecks.map((rule) => (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors duration-300",
                    rule.passed ? "text-green-600" : "text-muted-foreground",
                  )}
                >
                  <span className="relative h-3 w-3">
                    <CheckCircle2
                      className={cn(
                        "absolute inset-0 h-3 w-3 transition-all duration-300",
                        rule.passed
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-75",
                      )}
                    />{" "}
                    <CircleX
                      className={cn(
                        "absolute inset-0 h-3 w-3 transition-all duration-300",
                        rule.passed
                          ? "opacity-0 scale-75"
                          : "opacity-100 scale-100",
                      )}
                    />
                  </span>{" "}
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
          </FieldDescription>

          <Field>
            <Button type="submit" disabled={!isFormValid}>
              Register
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <SuccessDialog open={open} onOpenChange={setOpen} email={form.email} />
    </div>
  );
}
