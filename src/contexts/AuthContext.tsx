// import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";


// interface User extends SupabaseUser {
//   avatar_url?: string | null; // correct
//   // avatar_url(avatar_url: any): unknown;
//   name?: string;
//   role?: "admin" | "agent" | "manager" | string;
// }

interface User {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  age: number;
  mobileNumber: string;
  email: string;
  role: "admin" | "agent" | "manager" | string;
}


interface AuthContextType {
  user: User | null;
  // session: Session | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  // const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ helper for fetching profile
  // const loadUserProfile = async (supabaseUser: SupabaseUser) => {
  //   try {
  //     const { data: profile, error } = await supabase
  //       .from("profiles")
  //       .select("*")
  //       .eq("id", supabaseUser.id)
  //       .maybeSingle();
  
  //     if (!profile) {
  //       // create a default profile for new users
  //       const { error: insertError } = await supabase.from("profiles").insert({
  //         id: supabaseUser.id,
  //         full_name: supabaseUser.user_metadata?.full_name,
  //         phone: supabaseUser.user_metadata?.phone ? parseInt(supabaseUser.user_metadata.phone) : 0,
  //         avatar_url: supabaseUser.user_metadata?.avatar_url ?? null,
  //       });
  
  //       if (insertError) console.error("Profile creation error:", insertError.message);
        
  //       // Create default agent role
  //       await supabase.from("user_roles").insert({
  //         user_id: supabaseUser.id,
  //         role: "agent"
  //       });
  //     }

  //     // Fetch user role from user_roles table
  //     const { data: roleData } = await supabase
  //       .from("profiles")
  //       .select("role")
  //       .eq("id", supabaseUser.id)
  //       .maybeSingle();
  
  //     setUser({
  //       name: profile?.full_name ?? supabaseUser.user_metadata?.full_name ?? supabaseUser.email,
  //       role: (roleData?.role as "admin" | "agent" | "manager") ?? "agent",
       
  //     });
  //   } catch (err) {
  //     console.error("Unexpected error loading profile:", err);
  //     setUser({
  //       id: supabaseUser.id,
  //       email: supabaseUser.email ?? "",
  //       name: profile?.full_name ?? supabaseUser.user_metadata?.full_name ?? supabaseUser.email,
  //       role: (roleData?.role as "admin" | "agent" | "manager") ?? "agent",
  //     });
      
  //   }
  // };

  // ✅ initialize session once
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    console.log("Loading user from localStorage:", savedUser);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    console.log("User Logged In:", user);
    setIsLoading(false);
  }, []);
  

  // ✅ login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8090/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // keep if you’ll add sessions later
      });
  
      if (!response.ok) {
        const error = await response.json();
        setIsLoading(false);
        return { success: false, error: error.message || "Login failed" };
      }
  
      const user = await response.json();
      console.log("User Logged In:", user);
  
      // ✅ Fetch Agent by User ID
      const agentResponse = await fetch(`http://localhost:8090/agents/user/${user.userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      let agent = null;
      if (agentResponse.ok) {
        agent = await agentResponse.json();
        console.log("Agent data fetched:", agent);
      } else {
        console.warn("Agent not found for user ID:", user.userId);
      }
  
      // ✅ Save both to context + local storage
      const userData = {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        age: user.age,
        mobileNumber: user.mobile_number,
        email: user.email,
        role: user.role || "AGENT",
      };
  
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
  
      if (agent) {
        localStorage.setItem("agent", JSON.stringify(agent));
      }
  
      setIsLoading(false);
      console.log("User Logged In:", userData);
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      setIsLoading(false);
      return { success: false, error: "Network error" };
    }
  };

  // const fetchUser = async (userId: string) => {
  //   const response = await fetch(`http://localhost:8090/users/${userId}`, {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" }
  //   });
  //   if (!response.ok) throw new Error("Failed to fetch user");
  //   const user = await response.json();
  //   return user;
  // };

  // ✅ logout
  const logout = async () => {
    // await fetch("http://localhost:8090/api/auth/logout", { method: "POST" });
    localStorage.removeItem("user");
    setUser(null);
    // setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
