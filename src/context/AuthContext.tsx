// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import type { AuthError, UserData } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const userData = await userService.getUserById(user.uid);
          if (!userData) {
            // Create user document if it doesn't exist
            await userService.createUserDocument(user.uid, {
              email: user.email!,
              displayName: user.displayName || '',
              role: 'user',
              emailVerified: user.emailVerified,
              photoURL: user.photoURL || undefined
            });
          }
          setUserData(userData ? { 
            ...userData, 
            displayName: userData.displayName || '',
          } : null);
        } catch (error: any) {
          setError({ code: error.code, message: error.message });
        }
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { user } = await authService.createUser(email, password);
      await userService.createUserDocument(user.uid, {
        email,
        displayName: name,
        role: 'user'
      });
    } catch (error: any) {
      setError({ code: error.code, message: error.message });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
    } catch (error: any) {
      setError({ code: error.code, message: error.message });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error: any) {
      setError({ code: error.code, message: error.message });
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      await authService.signInWithGithub();
    } catch (error: any) {
      setError({ code: error.code, message: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error: any) {
      setError({ code: error.code, message: error.message });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    isLoading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    resetPassword: authService.resetPassword,
    sendVerificationEmail: () => user ? authService.sendVerificationEmail(user) : Promise.reject('No user'),
    updateUserEmail: (email: string) => user ? authService.updateUserEmail(user, email) : Promise.reject('No user'),
    updateUserPassword: (password: string) => user ? authService.updateUserPassword(user, password) : Promise.reject('No user'),
    updateUserProfile: async (data: Partial<UserData>) => {
      if (!user) throw new Error('No user');
      await userService.updateUser(user.uid, data);
      setUserData(curr => curr ? { ...curr, ...data } : null);
    },
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};