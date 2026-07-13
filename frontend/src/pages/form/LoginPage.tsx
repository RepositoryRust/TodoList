import LoginForm from "@/components/form/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
