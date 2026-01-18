import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [tenant, setTenant] = useState();
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    const login = (userData, tenantData, authToken) => {
        setUser(userData);
        setTenant(tenantData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
    };

    const logout = () => {
        setUser();
        setTenant();
        setToken();
        localStorage.removeItem('token');
    };

    const setAuth = (userData, tenantData) => {
        setUser(userData);
        setTenant(tenantData);
    };

    useEffect(() => {
        const restoreSession = async () => {
            const savedToken = localStorage.getItem('token');

            if (!savedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await getCurrentUser();
                setUser(data.user);
                setTenant(data.tenant);
            } catch (error) {
                console.error('Session restore failed:', error);
                localStorage.removeItem('token');
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
