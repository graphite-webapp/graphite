'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Session, User, AuthError } from '@supabase/supabase-js';

export type SettingsType = {
  [key: string]: string | number | boolean | null;
};

type UserContextType = {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  settings: SettingsType;
  setSetting: (key: string, value: string | number | boolean | null) => Promise<void>;
  signUpNewUser: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{
    success: boolean;
    error?: AuthError;
    data?: { user: User | null; session: Session | null };
  }>;
  signOutUser: () => Promise<void>;
  signInUser: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: AuthError;
    data?: { user: User | null; session: Session | null };
  }>;
};

type UserProviderProps = {
  children: React.ReactNode;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SettingsType>({});
  const [loading, setLoading] = useState(true);

  const signUpNewUser: UserContextType['signUpNewUser'] = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          display_name: displayName.trim(), // Supabase stores extra metadata here
        },
      },
    });

    if (error) {
      console.error('There was a problem signing up.', error);
      return { success: false, error };
    }

    return { success: true, data };
  };

  const signInUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    if (error) {
      console.error('Sign in error:', error);
      return { success: false, error };
    }
    setCurrentUser(data.user);
    return { success: true };
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    setCurrentUser(null);
  };

  const setSetting = async (key: string, value: string | number | boolean | null) => {
    if (!currentUser) return;

    // Update local state first
    setSettings(prev => ({ ...prev, [key]: value }));

    // Upsert to the settings table
    await supabase
      .from('settings')
      .upsert({ user_id: currentUser.id, [key]: value }, { onConflict: 'user_id' });
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user ?? null;
      setCurrentUser(user);

      if (user && user.id) {
        const { data: settingsData } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .single<{ user_id: string } & SettingsType>();
        setSettings(settingsData ?? {});
      }
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const theme = settings.theme ?? 'system';

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [settings.theme]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        settings,
        setSetting,
        signUpNewUser,
        signInUser,
        signOutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
