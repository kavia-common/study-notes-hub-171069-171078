import { useAuth as useAuthFromContext } from '../context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * useAuth returns authentication state and actions from AuthContext.
 *
 * Example:
 * const { user, loading, signInWithPassword, signOut } = useAuth();
 */
export function useAuth() {
  return useAuthFromContext();
}

export default useAuth;
