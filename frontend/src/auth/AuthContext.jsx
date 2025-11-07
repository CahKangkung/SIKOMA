// src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Ganti URL sesuai backend kamu: /api/auth/me atau /api/auth/check
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setUser(data ?? null);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
        console.log(e)
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // panggil ini setelah login/logout untuk sinkronkan state
  const refreshAuth = async () => {
    setLoading(true);
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
