import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface User extends SupabaseUser {
  avatar_url?: string | null; // correct
  // avatar_url(avatar_url: any): unknown;
  name?: string;
  role?: "admin" | "agent" | "manager" | string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ helper for fetching profile
  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle();
  
      if (!profile) {
        // create a default profile for new users
        const { error: insertError } = await supabase.from("profiles").insert({
          id: supabaseUser.id,
          full_name: supabaseUser.user_metadata?.full_name,
          role: "agent",
          phone: supabaseUser.user_metadata?.phone ?? "",
          avatar_url: supabaseUser.user_metadata?.avatar_url ?? null,
        });
  
        if (insertError) console.error("Profile creation error:", insertError.message);
      }
  
      setUser({
        ...supabaseUser,
        name: profile?.full_name ?? supabaseUser.user_metadata?.full_name ?? supabaseUser.email,
        role: (profile?.role as "admin" | "agent" | "manager") ?? "agent",
        avatar_url: profile?.avatar_url ?? null,
      });
    } catch (err) {
      console.error("Unexpected error loading profile:", err);
      setUser({ ...supabaseUser });
    }
  };

  // ✅ initialize session once
  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);

      if (session?.user) {
        loadUserProfile(session.user); // don’t await → avoids blocking
      } else {
        setUser(null);
      }

      setIsLoading(false);
    };

    initSession();

    // ✅ subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ✅ login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }

    if (data.user) {
      loadUserProfile(data.user); // don’t block login
    }

    setIsLoading(false);
    return { success: true };
  };

  // ✅ logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
