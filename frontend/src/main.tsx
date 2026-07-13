import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./pages/App";
import LoginPage from "./pages/form/LoginPage";
import RegisterPage from "./pages/form/RegisterPage";
import NotFoundPage from "./pages/form/NotFoundPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
