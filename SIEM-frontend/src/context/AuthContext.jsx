import { createContext, useContext, useState } from 'react';

// Create the AuthContext
const AuthContext = createContext(null);

// AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);

  // Login function - saves user, tenant, and token
  const login = (userData, tenantData, authToken) => {
    setUser(userData);
    setTenant(tenantData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  // Logout function - clears all auth state
  const logout = () => {
    setUser(null);
    setTenant(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Set auth state (used for session restore)
  const setAuth = (userData, tenantData) => {
    setUser(userData);
    setTenant(tenantData);
  };

  const value = {
    user,
    tenant,
    token,
    isLoading,
    setIsLoading,
    login,
    logout,
    setAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
