import { useCallback, useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import API from '../utils/axios';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    const syncUser = useCallback((userData, userToken) => {
        const nextToken = userToken ?? localStorage.getItem('token') ?? token;

        setUser(userData);
        setToken(nextToken ?? null);

        if (nextToken) {
            localStorage.setItem('token', nextToken);
        } else {
            localStorage.removeItem('token');
        }

        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    }, [token]);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    useEffect(() => {
        const restoreSession = async () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (!savedToken) {
                setUser(null);
                setToken(null);
                setLoading(false);
                return;
            }

            setToken(savedToken);

            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                } catch (error) {
                    console.error('Saved user JSON is invalid:', error);
                    localStorage.removeItem('user');
                }
            }

            try {
                const response = await API.get('/api/auth/me');
                const freshUser = response.data.user;
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));
            } catch (error) {
                console.error('Session restore failed:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, refreshUser: syncUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;