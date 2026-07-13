import RegisterForm  from "@/components/form/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-5">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
