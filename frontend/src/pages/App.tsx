import { ThemeProvider } from "@/components/dark_theme/theme-provider";
import { ModeToggle } from "@/components/dark_theme/mode-toggle";
import { Outlet } from "react-router";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="fixed top-4 right-4">
        <ModeToggle />
      </div>
      <Outlet />
    </ThemeProvider>
  );
}
