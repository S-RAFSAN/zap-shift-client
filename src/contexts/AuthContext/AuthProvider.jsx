import React from 'react';
import { AuthContext } from './AuthContext';

const AuthProvider = ({children}) => {
    const authInfo = {
        user: null,
        loading: true,
        error: null,
        signIn: () => {},
        signOut: () => {},
        signUp: () => {},
        signInWithGoogle: () => {},
        signInWithFacebook: () => {},
        signInWithTwitter: () => {},
    }
    return (
        <AuthContext.Provider value={authInfo}>
            {children}
                        </AuthContext.Provider>
                    );
};

export default AuthProvider;