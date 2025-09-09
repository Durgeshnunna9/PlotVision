import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'manager';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data
const mockUsers: Record<string, { password: string; name: string; role: 'admin' | 'agent' | 'manager' }> = {
  'admin@test.com': {
    password: 'admin123',
    name: 'Sarah Admin',
    role: 'admin'
  },
  'agent@test.com': {
    password: 'agent123',
    name: 'Mike Agent',
    role: 'agent'
  },
  'manager@test.com': {
    password: 'manager123',
    name: 'Emma Manager',
    role: 'manager'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('realtyUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    const userData = mockUsers[email];
    if (userData && userData.password === password) {
      const user: User = {
        email,
        name: userData.name,
        role: userData.role
      };
      setUser(user);
      localStorage.setItem('realtyUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('realtyUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};