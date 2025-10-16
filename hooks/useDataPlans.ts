import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';

interface DataPlan {
  variation_id: number;
  service_name: string;
  service_id: string;
  data_plan: string;
  price: string;
  availability: string;
}

interface ApiResponse {
  code: string;
  message: string;
  product: string;
  data: DataPlan[];
}

export const useDataPlans = (serviceId: string) => {
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataPlans = async () => {
      if (!serviceId) return;

      try {
        setLoading(true);
        setError(null);

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError('User not authenticated');
          return;
        }

        const idToken = await user.getIdToken(true);

        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
        const response = await fetch(`${API_BASE_URL}/vtu/data-plans/${serviceId}`, {
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
        if (data.code === 'success') {
          setDataPlans(data.data);
        } else {
          setError('Failed to fetch data plans');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDataPlans();
  }, [serviceId]);

  return { dataPlans, loading, error };
};