import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export const useUser = () => {
	const { auth, isReady } = useAuth();
	
	const fetchUserProfile = useCallback(async () => {
		if (!auth?.user?.id) return null;
		
		try {
			const response = await fetch(`/api/users/profile?userId=${auth.user.id}`);
			if (!response.ok) {
				// If profile doesn't exist, return basic auth user data
				if (response.status === 404) {
					console.log('User profile not found, returning basic auth data');
					return {
						...auth.user,
						// Add default values to indicate incomplete profile
						profileComplete: false,
					};
				}
				throw new Error('Failed to fetch user profile');
			}
			const profileData = await response.json();
			
			// Merge auth user data with profile data
			return {
				...auth.user,
				...profileData,
				profileComplete: true,
			};
		} catch (error) {
			console.error('Error fetching user profile:', error);
			// Return basic auth user data as fallback with incomplete flag
			return {
				...auth.user,
				profileComplete: false,
			};
		}
	}, [auth?.user]);

	const { data: user, isLoading, refetch } = useQuery({
		queryKey: ['user', auth?.user?.id],
		queryFn: fetchUserProfile,
		enabled: !!auth?.user?.id && isReady,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return { 
		user, 
		data: user, 
		loading: !isReady || isLoading, 
		refetch 
	};
};
export default useUser;
