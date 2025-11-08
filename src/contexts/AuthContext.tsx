import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  age: number;
  mobileNumber: string;
  email: string;
  role: "ADMIN" | "AGENT" | "MANAGER" | string;
  rating: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  logStatus: string; // 👈 to trace internal status
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logStatus, setLogStatus] = useState("Initializing...");

  // --- Load user from DB or fallback to localStorage ---
  useEffect(() => {
    const initUser = async () => {
      setIsLoading(true);
      setLogStatus("Starting user initialization...");

      try {
        // ✅ Try reading from localStorage first
        const cachedUser = localStorage.getItem("user");
        let parsedUser: User | null = cachedUser ? JSON.parse(cachedUser) : null;

        if (parsedUser?.userId) {
          setLogStatus("Found cached user. Verifying with backend...");
          // ✅ Verify user still exists in DB
          const verify = await fetch(`http://localhost:8090/users/${parsedUser.userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });

          if (verify.ok) {
            const freshUser = await verify.json();
            setUser(freshUser);
            setLogStatus("User verified successfully from DB.");
          } else {
            setLogStatus(`User verification failed with status ${verify.status}. Removing cache.`);
            localStorage.removeItem("user");
            setUser(null);
          }
        } else {
          setLogStatus("No cached user found. User is not logged in.");
          setUser(null);
        }
      } catch (err) {
        console.error("User initialization failed:", err);
        setLogStatus("Error during initialization. See console for details.");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  // --- Login ---
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setLogStatus("Attempting login...");
  
    try {
      // 🔹 1. Send login request
      const response = await fetch("http://localhost:8090/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
  
      // 🔹 2. Handle invalid credentials
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const message = error.error || "Invalid email or password";
        setLogStatus(`Login failed: ${message}`);
        setIsLoading(false);
        return { success: false, error: message };
      }
  
      // 🔹 3. Parse and normalize user data
      const user = await response.json();
      setLogStatus("Login successful. Preparing session...");
  
      const normalizedUser = {
        userId: user.userId ?? user.id ?? null,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        age: user.age ?? null,
        mobileNumber: user.mobileNumber ?? user.mobile_number ?? "",
        email: user.email ?? "",
        role: user.role ?? "AGENT",
        rating: user.rating ?? 0,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      };
  
      // 🔹 4. Save user in state and localStorage
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
  
      console.log("✅ User Logged In:", normalizedUser);
      setLogStatus("User logged in successfully.");
      setIsLoading(false);
  
      return { success: true };
    } catch (err) {
      console.error("❌ Login error:", err);
      setLogStatus("Network or server error during login.");
      setIsLoading(false);
      return { success: false, error: "Network or server error" };
    }
  };
  
  // --- Logout ---
  const logout = async () => {
    setLogStatus("Logging out...");
    localStorage.removeItem("user");
    setUser(null);
    setLogStatus("Logged out successfully.");
  };  

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, logStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
