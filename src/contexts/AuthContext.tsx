import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ user: null, error: null }),
  signIn: async () => ({ user: null, error: null }),
  signInWithGoogle: async () => ({ user: null, error: null }),
  signOut: async () => {},
});

// Add the missing useAuthContext hook
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Create profile and wallets for new user
  const createUserProfileAndWallets = async (userId: string, email: string, fullName?: string) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (existingProfile) {
        console.log('Profile already exists');
        return;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: fullName || email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }

      // Create wallets for all currencies
      const currencies = ['BTC', 'ETH', 'USDT', 'BNB'];
      const walletsToInsert = currencies.map(currency => ({
        user_id: userId,
        currency: currency,
        balance: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: walletsError } = await supabase
        .from('wallets')
        .insert(walletsToInsert);

      if (walletsError) {
        console.error('Error creating wallets:', walletsError);
        throw walletsError;
      }

      console.log('Profile and wallets created successfully');
    } catch (error) {
      console.error('Error in createUserProfileAndWallets:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        // Clear invalid session data
        localStorage.clear();
        sessionStorage.clear();
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to get session:', err);
      // Clear invalid session data
      localStorage.clear();
      sessionStorage.clear();
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // When user signs in, check and create profile/wallets if needed
      if (session?.user && _event === 'SIGNED_IN') {
        try {
          await createUserProfileAndWallets(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.full_name
          );
        } catch (error) {
          console.error('Failed to create profile/wallets:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { user: null, error };
      }

      // Create profile and wallets immediately after signup
      if (data.user) {
        try {
          await createUserProfileAndWallets(data.user.id, email, fullName);
        } catch (profileError) {
          console.error('Failed to create profile/wallets during signup:', profileError);
          // Don't return error here - user is created, profile creation can be retried on sign in
        }
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error };
      }

      // Check and create profile/wallets if they don't exist
      if (data.user) {
        try {
          await createUserProfileAndWallets(
            data.user.id,
            data.user.email!,
            data.user.user_metadata?.full_name
          );
        } catch (profileError) {
          console.error('Failed to create profile/wallets during sign in:', profileError);
        }
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        return { user: null, error };
      }

      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    // Clear state immediately
    setUser(null);
    setSession(null);
    
    // Clear storage immediately
    localStorage.clear();
    sessionStorage.clear();
    
    // Sign out from Supabase in background (don't wait)
    supabase.auth.signOut().catch(err => console.error('Signout error:', err));
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
