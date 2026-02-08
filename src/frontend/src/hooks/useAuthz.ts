import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile } from './useQueries';

export function useAuthz() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const displayName = userProfile?.name || 'Guest';
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return {
    isAuthenticated,
    identity,
    displayName,
    userProfile,
    profileLoading,
    showProfileSetup,
    loginStatus,
  };
}

