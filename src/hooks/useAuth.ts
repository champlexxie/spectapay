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
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Initialize new user profile when they first sign in
        if (event === 'SIGNED_IN' && session?.user) {
          await initializeUserProfile(session.user);
        }

        // Clear data on sign out
        if (event === 'SIGNED_OUT') {
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
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create new profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      // Initialize default USD wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .upsert({
          user_id: user.id,
          balance: 0,
          currency: 'USD',
          coin_symbol: 'USDT'
        }, {
          onConflict: 'user_id,coin_symbol',
          ignoreDuplicates: true
        });

      if (walletError) {
        console.error('Error initializing wallet:', walletError);
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
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

      if (!error && data.user) {
        // Initialize profile immediately after signup
        await initializeUserProfile(data.user);
      }

      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Ensure profile exists after successful login
      if (result.data.user && !result.error) {
        await initializeUserProfile(result.data.user);
      }

      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: { user: null, session: null }, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      return { data: { provider: null, url: null }, error };
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear everything even if there's an error
      setUser(null);
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      return { error: null };
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
