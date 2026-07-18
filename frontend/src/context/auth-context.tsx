import { fetchSession, loginUser, logoutUser } from "@/lib/api";
import type { AuthContextType } from "@/types/types-context";
import type { User } from "@/types/types-user";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function checkSession() {
    try {
      const data = await fetchSession();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    await loginUser(email, password);
    await checkSession();
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, checkSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus berada di dalam AuthProvider");
  }
  return context;
}
