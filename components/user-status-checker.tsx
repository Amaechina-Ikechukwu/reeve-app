import React, { useEffect, useState } from 'react';

import { useUserDetails } from '../hooks/useUserDetails';
import { BVNModal } from './ui/bvn-modal';
import { TransactionPinModal } from './ui/transaction-pin-modal';

export function UserStatusChecker() {
  const { userDetails, loading, error } = useUserDetails();
  const [showBVNModal, setShowBVNModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    if (userDetails) {
      if (!userDetails.bvnVerified) {
        setShowBVNModal(true);
      }
      if (!userDetails.hasTransactionPin) {
        setShowPinModal(true);
      }
    }
  }, [userDetails]);

  const handleSetPin = (pin: string) => {
    // TODO: Call API to set pin
   
  };

  if (loading) {
    return null; // Or a loading indicator
  }

  if (error) {
    console.error('Error fetching user details:', error);
    return null;
  }

  return (
    <>
      <BVNModal
        visible={showBVNModal}
        onClose={() => setShowBVNModal(false)}
      />
      <TransactionPinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSetPin={handleSetPin}
      />
    </>
  );
}