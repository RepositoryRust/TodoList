import type { User } from "@/types/types-user";

const API_URL = import.meta.env.VITE_API_URL;

async function parseErrorMessage(res: Response) {
  const data = await res.json();
  return data.message;
}

export async function registerUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}/users/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json();
}

export async function fetchSession(): Promise<User | null> {
  const res = await fetch(`${API_URL}/users/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
    return res.json();
}
