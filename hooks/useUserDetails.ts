import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setUserDetails(null);
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const idToken = await user.getIdToken(true);

      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
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
      setUserDetails(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        // User is signed in and verified, fetch details
        fetchUserDetails();
      } else {
        // User is signed out or not verified
        setUserDetails(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserDetails, refreshTrigger]);

  return { userDetails, loading, error, refresh };
};