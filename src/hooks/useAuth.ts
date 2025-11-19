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
          }
          setSession(session);
          setUser(session?.user ?? null);
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
        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

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
      
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        console.error('Sign in error:', result.error);
        setLoading(false);
        return result;
      }

      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
      return { data: { user: null, session: null }, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      return result;
    } catch (error) {
      console.error('Google sign in error:', error);
      return { data: { provider: null, url: null }, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear state immediately
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase (don't wait)
      supabase.auth.signOut().catch(err => console.error('Signout error:', err));
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
      localStorage.clear();
      sessionStorage.clear();
      
      return { error };
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
