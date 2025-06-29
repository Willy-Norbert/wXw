import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { SellerBlocked } from '@/components/seller/SellerBlocked';

interface SellerGuardProps {
  children: React.ReactNode;
}

export const SellerGuard: React.FC<SellerGuardProps> = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const userRole = user?.role?.toLowerCase();
  const isSeller = userRole === 'seller';
  const isAdmin = userRole === 'admin';

  // ✅ If the user is a seller, allow only if ACTIVE and isActive === true
  if (isSeller) {
    const isActiveSeller = user?.sellerStatus === 'ACTIVE' && user?.isActive === true;
    if (!isActiveSeller) {
      return <SellerBlocked />;
    }
  }

  // 🛡 If not seller or admin, block completely
  if (!isSeller && !isAdmin) {
    return null;
  }

  return <>{children}</>;
};
