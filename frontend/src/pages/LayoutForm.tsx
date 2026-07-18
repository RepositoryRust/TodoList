import { ThemeProvider } from "@/components/dark_theme/theme-provider";
import { Outlet } from "react-router";

export default function LayoutForm() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  );
}
