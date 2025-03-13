import { createContext, useEffect, useState } from 'react';
import storage from '../utils/storage';

interface IAuthContext {
  isInitiated: boolean;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  accessToken: string | null;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

interface IAuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  const [isInitiated, setIsInitiated] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const token: string | null = storage.getAccessToken();

    setAccessToken(token);
    setIsAuthenticated(!!token);
    setIsInitiated(true);
  }, []);

  const login = (token: string, refreshToken: string): void => {
    storage.setAccessToken(token);
    storage.setRefreshToken(token);
    setAccessToken(token);
    setIsAuthenticated(true);
  };

  const logout = (): void => {
    storage.clear();
    setAccessToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isInitiated,
        isAuthenticated,
        login,
        logout,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
