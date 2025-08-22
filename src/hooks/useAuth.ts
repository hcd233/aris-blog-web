import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { arisSDK } from '@/lib/sdk';
import {
  CurrentUser,
  UpdateUserRequestDTO,
  OAuthProvider,
  RefreshTokenRequestDTO,
  AuthTokens,
} from '@/types/dto';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  return useQuery<CurrentUser>(
    ['currentUser'],
    () => arisSDK.auth.getCurrentUser(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      onError: (error) => {
        // Don't show error toast for unauthenticated users
        if ((error as any).statusCode !== 401) {
          toast.error('Failed to fetch user information');
        }
      },
    }
  );
}

/**
 * Hook to update current user
 */
export function useUpdateUser() {
  const { refetch } = useCurrentUser();
  
  return useMutation<void, any, UpdateUserRequestDTO>(
    (data) => arisSDK.auth.updateCurrentUser(data),
    {
      onSuccess: async () => {
        toast.success('Profile updated successfully');
        await refetch(); // Refetch current user data
      },
      onError: (error) => {
        toast.error('Failed to update profile');
      },
    }
  );
}

/**
 * Hook to initiate OAuth login
 */
export function useOAuthLogin() {
  const router = useRouter();
  
  return useMutation<{ redirectURL: string }, any, OAuthProvider>(
    (provider) => arisSDK.auth.initiateOAuth(provider),
    {
      onSuccess: (data) => {
        // Redirect to OAuth provider
        window.location.href = data.redirectURL;
      },
      onError: (error) => {
        toast.error('Failed to initiate login');
      },
    }
  );
}

/**
 * Hook to handle OAuth callback
 */
export function useOAuthCallback() {
  const router = useRouter();
  
  return useMutation<
    AuthTokens,
    any,
    { provider: OAuthProvider; code: string; state: string }
  >(
    ({ provider, code, state }) => 
      arisSDK.auth.handleOAuthCallback(provider, code, state),
    {
      onSuccess: (tokens) => {
        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        toast.success('Login successful');
        router.push('/dashboard');
      },
      onError: (error) => {
        toast.error('Login failed');
        router.push('/login');
      },
    }
  );
}

/**
 * Hook to logout
 */
export function useLogout() {
  const router = useRouter();
  
  return useMutation<void, any, void>(
    () => arisSDK.auth.logout(),
    {
      onSuccess: () => {
        toast.success('Logged out successfully');
      },
      onError: (error) => {
        // Even if logout fails, clear local data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      },
    }
  );
}

/**
 * Hook to refresh auth token
 */
export function useRefreshToken() {
  return useMutation<AuthTokens, any, string>(
    (refreshToken) => arisSDK.auth.refreshToken({ refreshToken }),
    {
      onSuccess: (tokens) => {
        // Update stored tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      },
      onError: (error) => {
        // Token refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      },
    }
  );
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { data: user } = useCurrentUser();
  return !!user;
}