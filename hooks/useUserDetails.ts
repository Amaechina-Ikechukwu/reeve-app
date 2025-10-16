import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';

interface UserDetails {
  fullname: string;
  phone: string;
  email: string;
  hasTransactionPin: boolean;
  hasWallet: boolean;
  bvnVerified: boolean;
}

interface ApiResponse {
  success: boolean;
  data: UserDetails;
}

export const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const idToken = await user.getIdToken(true);

        // Assuming local_url is from env, for now placeholder
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ;
        const response = await fetch(`${API_BASE_URL}/accounts/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        if (data.success) {
          setUserDetails(data.data);
        } else {
          setError('Failed to fetch user details');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  return { userDetails, loading, error };
};