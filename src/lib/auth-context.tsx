"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";

interface AuthState {
  token: string | null;
  email: string | null;
  name: string | null;
  roles: string[];
  permissions: string[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

function readJsonArray(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setToken(localStorage.getItem("wbt_token"));
    setEmail(localStorage.getItem("wbt_email"));
    setName(localStorage.getItem("wbt_name"));
    setRoles(readJsonArray("wbt_roles"));
    setPermissions(readJsonArray("wbt_perms"));
    setIsLoading(false);
  }, []);

  const login = useCallback(async (loginEmail: string, password: string) => {
    const result = await api.post<LoginResponse>("/api/auth/login", {
      email: loginEmail,
      password,
    });
    localStorage.setItem("wbt_token", result.accessToken);
    localStorage.setItem("wbt_refresh", result.refreshToken);
    localStorage.setItem("wbt_email", result.user.email);
    localStorage.setItem("wbt_name", result.user.name);
    localStorage.setItem("wbt_roles", JSON.stringify(result.user.roles));
    localStorage.setItem("wbt_perms", JSON.stringify(result.user.permissions));
    setToken(result.accessToken);
    setEmail(result.user.email);
    setName(result.user.name);
    setRoles(result.user.roles);
    setPermissions(result.user.permissions);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem("wbt_refresh");
    if (refreshToken) {
      // Revoke server-side; fire-and-forget
      api.post("/api/auth/logout", { refreshToken }).catch(() => {});
    }
    for (const key of ["wbt_token", "wbt_refresh", "wbt_email", "wbt_name", "wbt_roles", "wbt_perms"])
      localStorage.removeItem(key);
    setToken(null);
    setEmail(null);
    setName(null);
    setRoles([]);
    setPermissions([]);
  }, []);

  const can = useCallback(
    (permission: string) =>
      roles.includes("Super Admin") || permissions.includes(permission),
    [roles, permissions]
  );

  return (
    <AuthContext.Provider
      value={{ token, email, name, roles, permissions, isLoading, login, logout, can }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
