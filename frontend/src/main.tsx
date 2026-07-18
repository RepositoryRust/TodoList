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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<LayoutTodo />}>
            <Route path="/" element={<TodolistPage />} />
          </Route>
          <Route element={<LayoutForm />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
