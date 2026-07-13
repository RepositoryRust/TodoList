import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div>
      <h1 className="text-8xl font-bold tracking-tight text-foreground sm:text-9xl">
        404
      </h1>

      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>

      <Button size="lg" className=" mt-5">
        <Link to="/" className="flex gap-2">
          <Home className="h-5 w-5" />
          <p>Go Home</p>
        </Link>
      </Button>
    </div>
  );
}
