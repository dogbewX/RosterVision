
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [splashLoading, setSplashLoading] = useState(false);

    const register = async (username, email, password) => {
        setIsLoading(true);
        try {
            await api.post('/auth/register', { username, email, password });
            return await login(username, password);
        } catch (e) {
            console.error(e);
            return { error: true, msg: e.response?.data?.error || 'Registration failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username, password) => {
        setIsLoading(true);
        try {
            // Updated to match backend response structure { user: { id, username }, token } if token exists
            const res = await api.post('/auth/login', { username, password });

            // Assuming backend returns { success: true, user: { ... } }
            // If we add JWT later, we store it here. For now, simple user object.
            const userInfo = res.data.user;
            setUser(userInfo);
            SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo));

            return { success: true };
        } catch (e) {
            return { error: true, msg: e.response?.data?.error || 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setIsLoading(true);
        setUser(null);
        SecureStore.deleteItemAsync('userInfo');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setSplashLoading(true);
            let userInfo = await SecureStore.getItemAsync('userInfo');

            if (userInfo) {
                userInfo = JSON.parse(userInfo);

                // Check for Biometrics (FaceID/TouchID)
                /* 
                try {
                    const hasHardware = await LocalAuthentication.hasHardwareAsync();
                    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

                    if (hasHardware && isEnrolled) {
                        const auth = await LocalAuthentication.authenticateAsync({
                            promptMessage: 'Login with FaceID',
                            fallbackLabel: 'Enter Password'
                        });

                        if (auth.success) {
                            setUser(userInfo);
                        } else {
                            // Failed biometrics, user stays on login screen
                        }
                    } else {
                        // No biometrics, auto-login
                        setUser(userInfo);
                    }
                } catch (bioError) {
                    console.warn("Biometric check failed, falling back to auto-login", bioError);
                    setUser(userInfo);
                }
                */
                // Check for Biometrics (FaceID/TouchID)
                try {
                    const hasHardware = await LocalAuthentication.hasHardwareAsync();
                    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

                    if (hasHardware && isEnrolled) {
                        const auth = await LocalAuthentication.authenticateAsync({
                            promptMessage: 'Login with FaceID',
                            fallbackLabel: 'Enter Password'
                        });

                        if (auth.success) {
                            setUser(userInfo);
                        } else {
                            // Failed biometrics, user stays on login screen
                        }
                    } else {
                        // No biometrics, auto-login
                        setUser(userInfo);
                    }
                } catch (bioError) {
                    console.warn("Biometric check failed, falling back to auto-login", bioError);
                    setUser(userInfo);
                }
            }
        } catch (e) {
            console.log(`isLoggedIn error ${e}`);
        } finally {
            setSplashLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                user,
                splashLoading,
                register,
                login,
                logout,
            }}>
            {children}
        </AuthContext.Provider>
    );
};
