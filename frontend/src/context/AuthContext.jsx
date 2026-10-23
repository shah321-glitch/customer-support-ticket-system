import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [toast, setToast] = useState(null);

  // Apply theme to HTML root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Verify auth session on initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
          setToken(storedToken);
        } catch (err) {
          console.error("Auth session expired:", err.message);
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    const userObj = data.user || data;
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(userObj);
    showToast(`Welcome back, ${userObj?.name || "User"}! 👋`);
    return userObj;
  };

  const register = async (name, email, password, role = "customer") => {
    const data = await api.register({ name, email, password, role });
    const userObj = data.user || data;
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(userObj);
    showToast(`Account created successfully! Welcome, ${userObj?.name || "User"} 🚀`);
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    showToast("You have been signed out.", "info");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        toggleTheme,
        toast,
        showToast,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

