import NotFound from "@/components/form/page-not-found";
import {useTitle} from "@/lib/utils";

export default function NotFoundPage() {
  useTitle("Page Not Found - TodoList");
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1B1B1B] px-6">
      <div className="w-full max-w-md text-center">
        <NotFound />
      </div>
    </div>
  );
}
