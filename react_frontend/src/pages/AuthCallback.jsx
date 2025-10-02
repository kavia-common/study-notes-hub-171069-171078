import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import getSupabaseClient from '../lib/supabaseClient';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = getSupabaseClient();
      try {
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        if (error) {
          // eslint-disable-next-line no-console
          console.error('Auth callback error:', error);
          navigate('/auth/error');
          return;
        }
        if (data?.session) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Auth callback exception:', err);
        navigate('/auth/error');
      }
    };

    handleAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>Processing authentication...</div>;
};

export default AuthCallback;
