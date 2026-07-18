import RegisterForm  from "@/components/form/register-form";
import {useTitle} from "@/lib/utils";

export default function RegisterPage() {
  useTitle("Register - TodoList");
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#1B1B1B] p-6 md:p-0">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
