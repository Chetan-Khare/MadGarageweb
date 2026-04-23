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
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>("COOKIE_MANAGED"); // Token is now HttpOnly
  const [role, setRole] = useState<UserRole | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Function to fetch full profile (syncs profileImageUrl across devices)
  const refreshUserProfile = useCallback(async () => {
    // We no longer check for a local token. 
    // We attempt to fetch the profile; if the cookie is valid, it succeeds.

    try {
      const response = await apiClient.get('/users/me');
      if (response.data) {
        const u = response.data;
        const userRole = (u.role || 'CUSTOMER').toUpperCase();
        const standardizedRole = (userRole.startsWith('ROLE_') ? userRole : `ROLE_${userRole}`) as UserRole;

        const updatedUser: User = {
          id: u.id?.toString() || '',
          name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.name || 'User'),
          email: u.email || '',
          role: standardizedRole,
          profileImageUrl: u.profileImageUrl || null
        };

        setUser(updatedUser);
        setRole(standardizedRole);
        setToken("COOKIE_MANAGED");
      }
    } catch (error: any) {
      console.error('Failed to sync user profile:', error);
      if (error.response?.status === 401) {
          logout();
      }
    } finally {
        setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  const login = (userData: any, newToken: string) => {
    // Standardize Role
    let userRole = (userData.role || 'CUSTOMER').toUpperCase();
    if (!userRole.startsWith('ROLE_')) {
        userRole = 'ROLE_' + userRole;
    }

    setToken("COOKIE_MANAGED");
    setRole(userRole as UserRole);

    // Initial state from login response (will be perfected by refreshUserProfile immediately)
    setUser({
        id: (userData.userId || userData.id)?.toString() || '',
        name: userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : (userData.name || 'User'),
        email: userData.email || '',
        role: userRole as UserRole,
        profileImageUrl: userData.profileImageUrl || null
    });

    // Sync full profile
    refreshUserProfile();
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout sync failed');
    }
    localStorage.removeItem('token'); // Clear legacy token if present
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
      isAuthenticated: !!token && !!user,
      isInitializing
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
