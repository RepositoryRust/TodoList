import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/context/auth-context";
import SkeletonLogin from "@/components/skeleton/skeleton-login";
import SkeletonRegister from "@/components/skeleton/skeleton-register";

export function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return location.pathname === "/register" ? (
      <SkeletonRegister />
    ) : (
      <SkeletonLogin />
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
