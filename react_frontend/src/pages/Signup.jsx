import React from 'react';
import AuthPage from './AuthPage.jsx';
import AuthForm from '../components/AuthForm.jsx';

/**
 * PUBLIC_INTERFACE
 * Signup page: Sign-up screen using AuthPage layout and AuthForm.
 * On successful signup, user is either redirected (if session active) or
 * prompted to confirm email (success message shown).
 */
export default function Signup() {
  return (
    <AuthPage
      title="Create your account"
      subtitle="Join Study Notes Hub to upload, browse, and bookmark notes."
    >
      <AuthForm mode="signup" />
    </AuthPage>
  );
}
