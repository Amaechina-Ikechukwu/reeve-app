import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';

import { auth } from '@/firebase';
import { useUserDetails } from '../hooks/useUserDetails';
import { TransactionPinModal } from './ui/transaction-pin-modal';

/**
 * UserStatusChecker component manages the verification flow:
 * 1. Check if user's email is verified (Firebase)
 * 2. If email verified, check if BVN is verified (API)
 * 3. Check if user has transaction pin
 * 
 * Redirects user to appropriate verification screens as needed.
 */
export function UserStatusChecker() {
  const { userDetails, loading, error } = useUserDetails();
  const [showPinModal, setShowPinModal] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const router = useRouter();

  // Check email verification status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmailVerified(user.emailVerified);
        
        // If email is not verified, redirect to email verification page
        if (!user.emailVerified) {
          router.replace('/auth/verify-email');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Check BVN and transaction pin status
  useEffect(() => {
    if (emailVerified && userDetails) {
      // If email is verified but BVN is not, redirect to BVN verification
      if (!userDetails.bvnVerified) {
        router.replace('/bvn');
        return;
      }

      // If BVN is verified but no transaction pin, show pin modal
      if (!userDetails.hasTransactionPin) {
        setShowPinModal(true);
      }
    }
  }, [emailVerified, userDetails, router]);

  const handleSetPin = (pin: string) => {
    // TODO: Call API to set pin
    console.log('Setting transaction pin:', pin);
    setShowPinModal(false);
  };

  if (loading || emailVerified === null) {
    return null; // Loading state
  }

  if (error) {
    console.error('Error fetching user details:', error);
    return null;
  }

  return (
    <>
      <TransactionPinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSetPin={handleSetPin}
      />
    </>
  );
}