import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { User, LoginInput, RegisterInput, useLogin, useRegister, useLogout, useGetCurrentUser } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<User>;
  register: (data: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("alis_token"));
  const [user, setUser] = useState<User | null>(null);
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  
  const { data: currentUser, isLoading, error } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
    } as any
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
    if (error) {
      setToken(null);
      setUser(null);
      localStorage.removeItem("alis_token");
    }
  }, [currentUser, error]);

  const login = async (data: LoginInput): Promise<User> => {
    const res = await loginMutation.mutateAsync({ data });
    localStorage.setItem("alis_token", res.token);
    setToken(res.token);
    setUser(res.user as User);
    return res.user as User;
  };

  const register = async (data: RegisterInput): Promise<User> => {
    const res = await registerMutation.mutateAsync({ data });
    localStorage.setItem("alis_token", res.token);
    setToken(res.token);
    setUser(res.user as User);
    return res.user as User;
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("alis_token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth(allowedRole?: string) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (allowedRole && user.role !== allowedRole) {
        setLocation(`/${user.role}`);
      }
    }
  }, [user, isLoading, allowedRole, setLocation]);

  return { user, isLoading };
}
