import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import LoginPage from "./pages/form/LoginPage";
import RegisterPage from "./pages/form/RegisterPage";
import NotFoundPage from "./pages/form/NotFoundPage";
import TodolistPage from "./pages/todo/TodolistPage";
import LayoutForm from "./pages/LayoutForm";
import LayoutTodo from "./pages/LayoutTodo";
import { AuthProvider } from "./context/auth-context";
import { GuestRoute } from "./pages/routes/GuestRoute";
import { ProtectedRoute } from "./pages/routes/ProtectedRoute";
import VerifyEmailPage from "./components/dialog/dialog-verify-email";
import ResendVerificationPage from "./components/dialog/dialog-resend-verification";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<LayoutTodo />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<TodolistPage />} />
            </Route>
          </Route>

          <Route element={<LayoutForm />}>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/resend-verification"
                element={<ResendVerificationPage />}
              />
            </Route>
          </Route>

          <Route element={<LayoutForm />}>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
