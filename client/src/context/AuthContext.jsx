import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  logoutUser as apiLogout, getUserData } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const data = await getUserData();

            if (!data || !data.success) {
                setUser(null);
                return;
            }

            setUser(data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const setAuthUser = (userData) => {
        setUser(userData);
    };

    const logoutUser = async () => {
        try {
            const res = await apiLogout();
            if (!res || !res.success) {
                console.warn("Logout failed:", res?.message);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setUser(null);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                setAuthUser,
                logoutUser,
                checkAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);