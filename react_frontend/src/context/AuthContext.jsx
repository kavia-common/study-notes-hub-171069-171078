import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import getSupabaseClient from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * AuthContext provides authentication state and helpers for the application.
 * It exposes:
 * - user: current authenticated user object (or null)
 * - session: current Supabase session
 * - loading: boolean indicating if auth status is being resolved
 * - signUp({ email, password, options? })
 * - signInWithPassword({ email, password })
 * - signInWithOAuth(provider, options?)
 * - signOut()
 * - refreshSession()
 *
 * Notes:
 * - Ensure the environment variables REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set.
 * - For email redirects during sign up, consider using REACT_APP_SITE_URL if needed by flows.
 */

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signInWithPassword: async () => {},
  signInWithOAuth: async () => {},
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }) {
  const supabase = getSupabaseClient();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          // eslint-disable-next-line no-console
          console.error('Error fetching session:', error.message);
        }

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Unexpected auth init error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();

    // Subscribe to auth changes
    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PUBLIC_INTERFACE
  const signUp = useCallback(
    async ({ email, password, options = {} }) => {
      /**
       * Sign up with email/password
       * options can include emailRedirectTo. If not provided, we will not set it automatically here.
       * Best practice: Pass emailRedirectTo using your site URL from env:
       *   const emailRedirectTo = process.env.REACT_APP_SITE_URL
       *     ? `${process.env.REACT_APP_SITE_URL}/auth/callback`
       *     : undefined;
       */
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });
      if (error) throw error;
      return data;
    },
    [supabase]
  );

  // PUBLIC_INTERFACE
  const signInWithPassword = useCallback(
    async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    [supabase]
  );

  // PUBLIC_INTERFACE
  const signInWithOAuth = useCallback(
    async (provider, options = {}) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });
      if (error) throw error;
      return data;
    },
    [supabase]
  );

  // PUBLIC_INTERFACE
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [supabase]);

  // PUBLIC_INTERFACE
  const refreshSession = useCallback(async () => {
    const {
      data: { session: refreshed },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    setSession(refreshed);
    setUser(refreshed?.user ?? null);
    return refreshed;
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signUp,
      signInWithPassword,
      signInWithOAuth,
      signOut,
      refreshSession,
    }),
    [user, session, loading, signUp, signInWithPassword, signInWithOAuth, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useAuth hook to access authentication state and actions.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
