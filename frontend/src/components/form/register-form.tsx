import { cn } from "@/lib/utils";
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
import { Checkbox } from "@/components//ui/checkbox";
import { Label } from "@/components//ui/label";

const PASSWORD_RULES = [
  {
    label: "Panjang 8–20 karakter",
    test: (pw: string) => pw.length >= 8 && pw.length <= 20,
  },
  {
    label: "Mengandung huruf besar (A–Z) dan kecil (a–z)",
    test: (pw: string) => /[A-Z]/.test(pw) && /[a-z]/.test(pw),
  },
  {
    label: "Mengandung minimal 1 angka atau simbol",
    test: (pw: string) => /[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw),
  },
];

function validateEmail(email: string) {
  const value = email.trim();

  if (!value) return false;
  if (value.length > 254) return false;
  if (value.includes(" ")) return false;

  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
}

export default function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState("password");

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(form.password),
  }));

  const isEmailValid = validateEmail(form.email);
  const isPasswordValid = passwordChecks.every((c) => c.passed);
  const isConfirmValid =
    form.confirmPassword.length > 0 && form.confirmPassword === form.password;

  const isFormValid = isEmailValid && isPasswordValid && isConfirmValid;

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isFormValid) return;

    // TODO: panggil API register di sini
    console.log("submit", form);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Create your account</h1>
            <FieldDescription>
              Don&apos;t have an account? <Link to="/">Sign in</Link>
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

          <FieldSeparator></FieldSeparator>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                form.email && !isEmailValid
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <FieldDescription className="text-destructive">
                  Email is not valid
                </FieldDescription>
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
            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
            <Input
              id="confirm-password"
              type={showPassword}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            <div className="flex justify-between">
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                  form.confirmPassword && !isConfirmValid
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <FieldDescription className="text-destructive">
                    Confirm password does not match
                  </FieldDescription>
                </div>
              </div>
              <div className="mb-2 text-xs">
                <Field orientation="horizontal">
                  <Checkbox
                    id="terms-checkbox"
                    className="size-3.5"
                    onClick={() =>
                      setShowPassword(
                        showPassword === "password" ? "text" : "password",
                      )
                    }
                  />
                  <Label htmlFor="terms-checkbox" className="-ml-1">
                    Show password
                  </Label>
                </Field>
              </div>
            </div>
          </Field>
          <FieldDescription>
            <ul className="space-y-1 text-xs -mt-4">
              {passwordChecks.map((rule) => (
                <li
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
                    />

                    <CircleX
                      className={cn(
                        "absolute inset-0 h-3 w-3 transition-all duration-300",
                        rule.passed
                          ? "opacity-0 scale-75"
                          : "opacity-100 scale-100",
                      )}
                    />
                  </span>

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
    </div>
  );
}
