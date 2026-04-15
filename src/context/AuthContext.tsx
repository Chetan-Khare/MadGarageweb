import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

export type UserRole = 'ROLE_ADMIN' | 'ROLE_SELLER' | 'ROLE_CUSTOMER' | 'ROLE_GARAGE';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImageUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  login: (userData: any, token: string) => void;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<UserRole | null>(localStorage.getItem('role') as UserRole);

  // Function to fetch full profile (syncs profileImageUrl across devices)
  const refreshUserProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    try {
      const response = await apiClient.get('/users/me');
      if (response.data) {
        const u = response.data;
        const userRole = (u.role || localStorage.getItem('role') || 'CUSTOMER').toUpperCase();
        const standardizedRole = userRole.startsWith('ROLE_') ? userRole : `ROLE_${userRole}`;

        const updatedUser: User = {
          id: u.id?.toString() || '',
          name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.name || 'User'),
          email: u.email || '',
          role: standardizedRole as UserRole,
          profileImageUrl: u.profileImageUrl || null
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to sync user profile:', error);
      // If 401, token is invalid
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role') as UserRole;
    
    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      // Always verify/sync with backend on mount
      refreshUserProfile();
    }
  }, [refreshUserProfile]);

  const login = (userData: any, newToken: string) => {
    // Standardize Role
    let userRole = (userData.role || 'CUSTOMER').toUpperCase();
    if (!userRole.startsWith('ROLE_')) {
        userRole = 'ROLE_' + userRole;
    }

    const payload: User = {
        id: (userData.userId || userData.id)?.toString() || '',
        name: userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : (userData.name || 'User'),
        email: userData.email || '',
        role: userRole as UserRole,
        profileImageUrl: userData.profileImageUrl || null
    };

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(payload));
    localStorage.setItem('role', userRole);
    
    setUser(payload);
    setToken(newToken);
    setRole(userRole as UserRole);

    // Trigger background refresh to get missing fields like profileImageUrl
    refreshUserProfile();
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
      refreshUserProfile,
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
