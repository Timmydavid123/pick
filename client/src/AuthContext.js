import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds user info
  const [token, setToken] = useState(null); // Holds auth token
  const [loading, setLoading] = useState(false); // Loading state

  // Function to handle user login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post("https://pick-4.onrender.com/auth/login", {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("authToken", token); // Save token to local storage
      setToken(token);

      const user = jwtDecode(token); // Decode the token to get user info
      setUser(user);

      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message || "Error logging in" };
    }
  };

  // Function to handle user signup
  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      await axios.post("https://pick-4.onrender.com/auth/signup", {
        name,
        email,
        password,
      });

      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message || "Error signing up" };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  // Check if a token exists in localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
      const user = jwtDecode(savedToken);
      setUser(user);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const jwtDecode = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
  } catch {
    return null;
  }
};
