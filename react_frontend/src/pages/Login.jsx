import React from 'react';
import AuthPage from './AuthPage.jsx';
import AuthForm from '../components/AuthForm.jsx';

/**
 * PUBLIC_INTERFACE
 * Login page: Sign-in screen using AuthPage layout and AuthForm.
 * On successful login, AuthForm will redirect the user to the dashboard (/).
 */
export default function Login() {
  return (
    <AuthPage
      title="Welcome back"
      subtitle="Sign in to upload, bookmark, and manage your study notes."
    >
      <AuthForm mode="signin" />
    </AuthPage>
  );
}
