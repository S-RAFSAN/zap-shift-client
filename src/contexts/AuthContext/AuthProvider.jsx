import React, { useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase.init';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const createUser = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password)
    }
    const signIn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password)
    }
    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider)
    }

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    localStorage.setItem('token', token);
                    // Sync user to backend users collection (role, profile) – works for email/password and social login
                    const apiUrl = import.meta.env.VITE_API_URL ||
                        (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://zap-shift-server-taupe-six.vercel.app');
                    const res = await fetch(`${apiUrl}/users`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            email: currentUser.email,
                            displayName: currentUser.displayName ?? null,
                            photoURL: currentUser.photoURL ?? null,
                        }),
                    });
                    if (!res.ok) {
                        const errBody = await res.text();
                        console.error('User sync failed:', res.status, errBody);
                    }
                } catch (err) {
                    console.error('Failed to get auth token or sync user:', err);
                    localStorage.removeItem('token');
                }
            } else {
                localStorage.removeItem('token');
            }
            setLoading(false);
        });
        return () => {
            unSubscribe();
        };
    }, []);
    

    const authInfo = {
        user,
        loading,
        createUser,
        signInWithGoogle,
        signIn,
        logOut,
    }
    return (
        <AuthContext.Provider value={authInfo}>
            {children}
                        </AuthContext.Provider>
                    );
};

export default AuthProvider;