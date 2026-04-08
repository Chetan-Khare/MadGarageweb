import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'ROLE_ADMIN' | 'ROLE_SELLER' | 'ROLE_CUSTOMER' | 'ROLE_GARAGE';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  login: (userData: any, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<UserRole | null>(localStorage.getItem('role') as UserRole);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role') as UserRole;
    
    if (savedUser && savedToken && savedRole) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        setRole(savedRole);
      } catch (e) {
        console.error('Auth Initialization Error:', e);
        logout();
      }
    }
  }, []);

  const login = (userData: any, newToken: string) => {
    // Standardize Role: Ensure ROLE_ prefix exists and is uppercase
    let userRole = (userData.role || 'CUSTOMER').toUpperCase();
    if (!userRole.startsWith('ROLE_')) {
        userRole = 'ROLE_' + userRole;
    }

    const payload: User = {
        id: userData.userId || userData.id,
        name: userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : (userData.name || 'User'),
        email: userData.email || '',
        role: userRole as UserRole
    };

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(payload));
    localStorage.setItem('role', userRole);
    
    setUser(payload);
    setToken(newToken);
    setRole(userRole as UserRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      role,
      login, 
      logout, 
      isAuthenticated: !!token 
    }}>
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
