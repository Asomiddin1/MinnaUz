'use client';

import * as React from 'react';
import { api, User, DeviceSession, AuthResponse } from './api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  devices: DeviceSession[];
  loginWithOtp: (email: string, code: string) => Promise<AuthResponse>;
  sendOtp: (email: string) => Promise<{ success: boolean; devCode?: string; message: string }>;
  loginWithGoogle: (token: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  fetchDevices: () => Promise<void>;
  revokeDevice: (deviceId: string) => Promise<void>;
  updateUser: (updated: Partial<User> | User) => void;
  uploadAvatar: (file: File) => Promise<User>;
  selectGoogleAvatar: () => Promise<User>;
  removeAvatar: () => Promise<User>;
  updateProfile: (data: { fullName?: string }) => Promise<User>;
  equipFrame: (frameKey: string | null) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [devices, setDevices] = React.useState<DeviceSession[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const sessionCheckRef = React.useRef<Promise<void> | null>(null);

  // Restore user from localStorage and verify with /auth/me on mount + heartbeat check
  React.useEffect(() => {
    const checkSession = async () => {
      if (sessionCheckRef.current) return sessionCheckRef.current;

      sessionCheckRef.current = (async () => {
        const token = localStorage.getItem('minna_access_token');
        const savedUser = localStorage.getItem('minna_user');

        if (token && savedUser) {
          try {
            const freshUser = await api.getMe();
            if (localStorage.getItem('minna_access_token') === token) {
              setUser(freshUser);
              localStorage.setItem('minna_user', JSON.stringify(freshUser));
            }
          } catch {
            // A stale check must not clear a session created while it was in flight.
            if (localStorage.getItem('minna_access_token') === token) {
              setUser(null);
            }
          }
        }
      })();

      try {
        await sessionCheckRef.current;
      } finally {
        sessionCheckRef.current = null;
      }
    };

    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('minna_user');
        const token = localStorage.getItem('minna_access_token');

        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
          await checkSession();
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Check session on tab focus and every 15 seconds
    const handleFocus = () => checkSession();
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(checkSession, 15000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const saveAuthSession = React.useCallback((authData: AuthResponse) => {
    setUser(authData.user);
    localStorage.setItem('minna_access_token', authData.accessToken);
    localStorage.setItem('minna_refresh_token', authData.refreshToken);
    localStorage.setItem('minna_user', JSON.stringify(authData.user));
  }, []);

  const sendOtp = React.useCallback(async (email: string) => {
    return api.sendOtp(email);
  }, []);

  const loginWithOtp = React.useCallback(async (email: string, code: string) => {
    const res = await api.verifyOtp(email, code);
    saveAuthSession(res);
    return res;
  }, [saveAuthSession]);

  const loginWithGoogle = React.useCallback(async (token: string) => {
    const res = await api.googleAuth(token);
    saveAuthSession(res);
    return res;
  }, [saveAuthSession]);

  const logout = React.useCallback(async () => {
    await api.logout();
    setUser(null);
    setDevices([]);
  }, []);

  const fetchDevices = React.useCallback(async () => {
    try {
      const activeDevices = await api.getDevices();
      setDevices(activeDevices);
    } catch (e) {
      console.error('Failed to fetch devices:', e);
    }
  }, []);

  const revokeDevice = React.useCallback(async (deviceId: string) => {
    await api.revokeDevice(deviceId);
    setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
  }, []);

  const updateUser = React.useCallback((updated: Partial<User> | User) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updated };
      localStorage.setItem('minna_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const uploadAvatar = React.useCallback(async (file: File) => {
    const updated = await api.uploadAvatar(file);
    setUser(updated);
    localStorage.setItem('minna_user', JSON.stringify(updated));
    return updated;
  }, []);

  const selectGoogleAvatar = React.useCallback(async () => {
    const updated = await api.selectGoogleAvatar();
    setUser(updated);
    localStorage.setItem('minna_user', JSON.stringify(updated));
    return updated;
  }, []);

  const removeAvatar = React.useCallback(async () => {
    const updated = await api.removeAvatar();
    setUser(updated);
    localStorage.setItem('minna_user', JSON.stringify(updated));
    return updated;
  }, []);

  const updateProfile = React.useCallback(async (data: { fullName?: string }) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
    localStorage.setItem('minna_user', JSON.stringify(updated));
    return updated;
  }, []);

  const equipFrame = React.useCallback(async (frameKey: string | null) => {
    const res = await api.equipAvatarFrame(frameKey);
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, avatarFrame: res.avatarFrame };
      localStorage.setItem('minna_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        devices,
        sendOtp,
        loginWithOtp,
        loginWithGoogle,
        logout,
        fetchDevices,
        revokeDevice,
        updateUser,
        uploadAvatar,
        selectGoogleAvatar,
        removeAvatar,
        updateProfile,
        equipFrame,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
