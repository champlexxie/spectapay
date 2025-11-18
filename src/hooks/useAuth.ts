import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error);
            // Clear invalid session data for any auth error
            await supabase.auth.signOut({ scope: 'local' });
            localStorage.clear();
            sessionStorage.clear();
            setSession(null);
            setUser(null);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          // Clear any corrupted session data
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch (signOutError) {
            console.error('Error during cleanup signOut:', signOutError);
          }
          localStorage.clear();
          sessionStorage.clear();
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.error('Token refresh failed, signing out');
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch (error) {
            console.error('Error during signOut after token refresh failure:', error);
          }
          localStorage.clear();
          sessionStorage.clear();
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Initialize new user profile when they first sign in
        if (event === 'SIGNED_IN' && session?.user) {
          await initializeUserProfile(session.user);
        }

        // Clear data on sign out
        if (event === 'SIGNED_OUT') {
          localStorage.clear();
          sessionStorage.clear();
          setSession(null);
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const initializeUserProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking profile:', checkError);
        return;
      }

      if (!existingProfile) {
        // Create new profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        } else {
          console.log('New user profile created successfully');
        }
      }

      // Initialize wallet if it doesn't exist
      const { data: existingWallet, error: walletCheckError } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletCheckError && walletCheckError.code !== 'PGRST116') {
        console.error('Error checking wallet:', walletCheckError);
        return;
      }

      if (!existingWallet) {
        const { error: walletError } = await supabase.from('wallets').insert({
          user_id: user.id,
          balance: 0,
          currency: 'USD'
        });

        if (walletError) {
          console.error('Error creating wallet:', walletError);
        } else {
          console.log('New user wallet created successfully');
        }
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clear any existing corrupted session first
      try {
        await supabase.auth.signOut({ scope: 'local' });
        localStorage.clear();
        sessionStorage.clear();
      } catch (cleanupError) {
        console.error('Error during pre-signin cleanup:', cleanupError);
      }
      
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // For existing users, allow sign in regardless of email verification status
      if (result.data.user && !result.error) {
        // Ensure profile exists after successful login
        await initializeUserProfile(result.data.user);
      }

      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: { user: null, session: null }, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      return { data: { provider: null, url: null }, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local storage first
      localStorage.clear();
      sessionStorage.clear();
      
      // Then sign out from Supabase
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Sign out error:', error);
        // Continue even if signOut fails
      }
      
      // Clear user state
      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local data even if sign out fails
      setUser(null);
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
}
