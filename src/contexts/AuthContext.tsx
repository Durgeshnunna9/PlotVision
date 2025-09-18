import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/integrations/supabase/client";

interface User extends SupabaseUser {
  name?: string;
  role?: "admin" | "agent" | "manager";
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

  // 🔹 helper function to load user profile
  const loadUserProfile = async (session: Session) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
      }

      setUser({
        ...session.user,
        name: profile?.full_name,
        role: profile?.role as "admin" | "agent" | "manager",
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      setUser({
        ...session.user,
        name: undefined,
        role: undefined,
      });
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      // 1️⃣ Get current session immediately
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) console.error("Error getting session:", error);

      if (session?.user) {
        await loadUserProfile(session);
      } else {
        setUser(null);
      }
      setSession(session);
      setIsLoading(false);
    };

    // 2️⃣ Subscribe to future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    initAuth();

    return () => subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
