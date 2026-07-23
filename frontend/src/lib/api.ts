import type { User } from "@/types/types-user";

const API_URL = import.meta.env.VITE_API_URL;
let accessToken: string | null = null;

async function parseErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data.message ?? res.statusText;
  } catch {
    return res.statusText || "Request failed";
  }
}

type VerifyEmailResponse = {
  verified: boolean;
  message?: string;
};

export async function verifyEmail(
  token: string,
  signal?: AbortSignal,
): Promise<VerifyEmailResponse> {
  const res = await fetch(
    `${API_URL}/users/verify-email?token=${encodeURIComponent(token)}`,
    { signal },
  );
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json();
}

export async function resendVerificationEmail(email: string) {
  const res = await fetch(`${API_URL}/users/resend-verification`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }
  return res.json();
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
  const data = await res.json();
  if (data.access_token) accessToken = data.access_token;
  return data;
}

export async function logoutUser() {
  try {
    const res = await fetch(`${API_URL}/users/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(await parseErrorMessage(res));
    }

    return await res.json();
  } finally {
    accessToken = null;
  }
}

async function refreshAccessToken() {
  const res = await fetch(`${API_URL}/users/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    accessToken = null;
    return false;
  }

  const data = await res.json();

  if (!data.access_token) {
    accessToken = null;
    return false;
  }

  accessToken = data.access_token;
  return true;
}

export async function fetchSession(): Promise<User | null> {
  if (!accessToken) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
  }

  let res = await fetch(`${API_URL}/users/me`, {
    credentials: "include",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;

    res = await fetch(`${API_URL}/users/me`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  if (!res.ok) return null;
  return await res.json();
}
