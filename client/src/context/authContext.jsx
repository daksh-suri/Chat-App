/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";
import { authApi } from "../api/authApi";
import auth from "../lib/auth";

const context = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(auth.user || null);
  const [loading, setLoading] = useState(false);

  async function signin({ email, password }) {
    setLoading(true);
    const { user, token } = await authApi.signin({ email, password }).finally(() => {
      setLoading(false);
    });
    setUser(user);
    return { user, token };
  }

  async function signup({ name, email, password }) {
    setLoading(true);
    const { user, token } = await authApi.signup({ name, email, password }).finally(() => {
      setLoading(false);
    });
    setUser(user);
    return { user, token };
  }

  function logout() {
    auth.logout();
    setUser(null);
  }

  return (
    <context.Provider
      value={{
        user,
        token: auth.token || "",
        signin,
        signup,
        isLoggedIn: user ? true : false,
        loading,
        logout,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default function useAuth() {
  return useContext(context);
}
