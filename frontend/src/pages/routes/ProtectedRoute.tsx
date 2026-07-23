import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/auth-context";
import SkeletonTodo from "@/components/skeleton/skeleton-todo";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SkeletonTodo />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
