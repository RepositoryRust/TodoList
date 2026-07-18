import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export function validateEmail(email: string) {
  const value = email.trim();

  if (!value) return false;
  if (value.length > 254) return false;
  if (value.includes(" ")) return false;

  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
}