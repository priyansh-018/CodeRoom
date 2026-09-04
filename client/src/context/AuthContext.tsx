import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch, safeJson } from '../services/api';
import type { UserRole } from '../types';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  avatarUrl?: string;
  bio?: string;
  title?: string;
  company?: string;
  organization?: string;
  position?: string;
  university?: string;
  qualificationStatus?: string;
  degree?: string;
  skills?: string | string[];
  resumeUrl?: string;
  resumeFileName?: string;
  github?: string;
  linkedin?: string;
  createdAt?: string;
}

export interface UpdateProfileData {
  name?: string;
  avatarUrl?: string;
  bio?: string;
  title?: string;
  phone?: string;
  company?: string;
  organization?: string;
  position?: string;
  university?: string;
  qualificationStatus?: string;
  degree?: string;
  skills?: string | string[];
  resumeUrl?: string;
  resumeFileName?: string;
  github?: string;
  linkedin?: string;
  role?: UserRole;
  currentPassword?: string;
  newPassword?: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  otp: string;
  qualificationStatus?: string;
  degree?: string;
  skills?: string[];
  resumeUrl?: string;
  resumeFileName?: string;
  github?: string;
  linkedin?: string;
  organization?: string;
  position?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  sendSignupOtp: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  verifyOtpAndRegister: (payload: SignupPayload) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('coderoom_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('coderoom_token'));

  useEffect(() => {
    if (token) {
      apiFetch('/api/auth/me')
        .then((res) => safeJson(res))
        .then(({ ok, data }) => {
          if (ok && data && data.user) {
            setUser(data.user);
            localStorage.setItem('coderoom_user', JSON.stringify(data.user));
            localStorage.setItem('coderoom_username', data.user.name);
          } else {
            logout();
          }
        })
        .catch(() => {
          // Offline or network error
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const { ok, data } = await safeJson(res);
      if (!ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('coderoom_token', data.token);
      localStorage.setItem('coderoom_user', JSON.stringify(data.user));
      localStorage.setItem('coderoom_username', data.user.name);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login network error' };
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'CANDIDATE') => {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });

      const { ok, data } = await safeJson(res);
      if (!ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('coderoom_token', data.token);
      localStorage.setItem('coderoom_user', JSON.stringify(data.user));
      localStorage.setItem('coderoom_username', data.user.name);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration network error' };
    }
  };

  const sendSignupOtp = async (email: string) => {
    try {
      const res = await apiFetch('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      const { ok, data } = await safeJson(res);
      if (!ok) {
        return { success: false, error: data.error || 'Failed to dispatch verification email' };
      }

      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error sending OTP' };
    }
  };

  const verifyOtpAndRegister = async (payload: SignupPayload) => {
    try {
      const res = await apiFetch('/api/auth/verify-otp-and-register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const { ok, data } = await safeJson(res);
      if (!ok) {
        return { success: false, error: data.error || 'Verification failed' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('coderoom_token', data.token);
      localStorage.setItem('coderoom_user', JSON.stringify(data.user));
      localStorage.setItem('coderoom_username', data.user.name);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration network error' };
    }
  };

  const updateProfile = async (updateData: UpdateProfileData) => {
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      const { ok, data } = await safeJson(res);
      if (!ok) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }

      setUser(data.user);
      localStorage.setItem('coderoom_user', JSON.stringify(data.user));
      if (data.user?.name) {
        localStorage.setItem('coderoom_username', data.user.name);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating profile' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('coderoom_token');
    localStorage.removeItem('coderoom_user');
    localStorage.removeItem('coderoom_username');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        sendSignupOtp,
        verifyOtpAndRegister,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
