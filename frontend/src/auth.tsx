import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type UserType = 'company' | 'admin' | null;

type AuthContextValue = {
  userType: UserType;
  login: (type: Exclude<UserType, null>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserType] = useState<UserType>(() => (localStorage.getItem('tb-user-type') as UserType) ?? null);

  useEffect(() => {
    if (userType) {
      localStorage.setItem('tb-user-type', userType);
    } else {
      localStorage.removeItem('tb-user-type');
    }
  }, [userType]);

  const value = useMemo<AuthContextValue>(
    () => ({
      userType,
      login: (type: Exclude<UserType, null>) => setUserType(type),
      logout: () => setUserType(null),
    }),
    [userType],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
