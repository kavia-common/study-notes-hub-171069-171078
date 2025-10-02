export const handleAuthError = (error, navigate) => {
  if (!error) return;
  // eslint-disable-next-line no-console
  console.error('Authentication error:', error);

  const message = (typeof error === 'string' ? error : error.message || '').toLowerCase();

  if (message.includes('redirect')) {
    navigate('/auth/error?type=redirect');
  } else if (message.includes('email')) {
    navigate('/auth/error?type=email');
  } else {
    navigate('/auth/error');
  }
};
