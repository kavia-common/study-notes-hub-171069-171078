import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * AuthForm renders a sign-in or sign-up form using react-hook-form.
 * It handles validation, calls into AuthContext for Supabase auth, displays
 * error/success messages with Ocean Professional styling, and redirects
 * to the dashboard (/) on successful authentication.
 *
 * Props:
 * - mode: 'signin' | 'signup'  (default: 'signin')
 * - allowOAuth: boolean to show OAuth buttons in future (not implemented UI here)
 */
export default function AuthForm({ mode = 'signin' }) {
  const navigate = useNavigate();
  const { signInWithPassword, signUp } = useAuth();
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');

  const isSignup = useMemo(() => mode === 'signup', [mode]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const passwordValue = watch('password');

  async function onSubmit(values) {
    setServerError('');
    setServerSuccess('');

    try {
      if (isSignup) {
        // For sign up, optionally pass emailRedirectTo if available via env
        const siteUrl = process.env.REACT_APP_SITE_URL;
        const options = siteUrl
          ? { emailRedirectTo: `${siteUrl.replace(/\/$/, '')}/auth/callback` }
          : {};
        const { user } = await signUp({
          email: values.email,
          password: values.password,
          options,
        });

        // Supabase may require email confirmation before session is active
        if (!user) {
          setServerSuccess(
            'Success! Please check your email to confirm your account before logging in.'
          );
          reset({ email: values.email, password: '', confirmPassword: '' });
          return;
        }

        // If sign up returns an active session, navigate to dashboard
        navigate('/', { replace: true });
      } else {
        await signInWithPassword({
          email: values.email,
          password: values.password,
        });
        navigate('/', { replace: true });
      }
    } catch (err) {
      setServerError(err?.message || 'An unexpected error occurred.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label={isSignup ? 'Sign up form' : 'Sign in form'}>
      {/* Alerts */}
      {serverError ? (
        <div
          role="alert"
          className="surface"
          style={{
            borderColor: 'var(--color-error)',
            color: 'var(--color-text)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
            background:
              'linear-gradient(180deg, rgba(239,68,68,0.08), rgba(255,255,255,0.6))',
          }}
        >
          <strong style={{ color: 'var(--color-error)' }}>Error: </strong>
          <span>{serverError}</span>
        </div>
      ) : null}
      {serverSuccess ? (
        <div
          role="status"
          className="surface"
          style={{
            borderColor: 'var(--color-success)',
            color: 'var(--color-text)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
            background:
              'linear-gradient(180deg, rgba(245,158,11,0.10), rgba(255,255,255,0.6))',
          }}
        >
          <strong style={{ color: 'var(--color-success)' }}>Success: </strong>
          <span>{serverSuccess}</span>
        </div>
      ) : null}

      {/* Email */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label htmlFor="email" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /.+@.+\..+/i,
              message: 'Please enter a valid email address',
            },
          })}
          style={{
            width: '100%',
            padding: '0.65rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            outline: 'none',
            boxShadow: 'var(--shadow-xs)',
          }}
          onFocus={e => (e.currentTarget.style.boxShadow = 'var(--focus-ring)')}
          onBlur={e => (e.currentTarget.style.boxShadow = 'var(--shadow-xs)')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <div id="email-error" className="text-muted" style={{ color: 'var(--color-error)', marginTop: 6 }}>
            {errors.email.message}
          </div>
        )}
      </div>

      {/* Password */}
      <div style={{ marginBottom: isSignup ? '0.75rem' : '1rem' }}>
        <label htmlFor="password" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
          style={{
            width: '100%',
            padding: '0.65rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            outline: 'none',
            boxShadow: 'var(--shadow-xs)',
          }}
          onFocus={e => (e.currentTarget.style.boxShadow = 'var(--focus-ring)')}
          onBlur={e => (e.currentTarget.style.boxShadow = 'var(--shadow-xs)')}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <div id="password-error" className="text-muted" style={{ color: 'var(--color-error)', marginTop: 6 }}>
            {errors.password.message}
          </div>
        )}
      </div>

      {/* Confirm Password for Signup */}
      {isSignup && (
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === passwordValue || 'Passwords do not match',
            })}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              outline: 'none',
              boxShadow: 'var(--shadow-xs)',
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = 'var(--focus-ring)')}
            onBlur={e => (e.currentTarget.style.boxShadow = 'var(--shadow-xs)')}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          {errors.confirmPassword && (
            <div id="confirmPassword-error" className="text-muted" style={{ color: 'var(--color-error)', marginTop: 6 }}>
              {errors.confirmPassword.message}
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="btn"
        disabled={isSubmitting}
        style={{ width: '100%', height: 44, marginTop: '0.25rem' }}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (isSignup ? 'Creating account…' : 'Signing in…') : (isSignup ? 'Create account' : 'Sign in')}
      </button>

      {/* Helper Text */}
      <div className="text-muted" style={{ marginTop: '0.75rem', fontSize: 14 }}>
        {isSignup ? (
          <span>
            By creating an account, you agree to our Terms & Privacy Policy.
          </span>
        ) : (
          <span>
            Forgot your password? Reset it from the sign-in window after a failed attempt.
          </span>
        )}
      </div>
    </form>
  );
}
