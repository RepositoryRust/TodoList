import NotFound from "@/components/form/page-not-found";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <NotFound />
      </div>
    </div>
  );
}
