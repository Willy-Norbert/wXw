import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAllSellers } from '@/api/sellers';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, User } from 'lucide-react';

const SellersDropdown = () => {
  const navigate = useNavigate();
  
  const { data: sellersResponse, isLoading } = useQuery({
    queryKey: ['all-sellers'],
    queryFn: getAllSellers,
  });

  const sellers = sellersResponse?.data || [];
  const activeSellers = sellers.filter((seller: any) => seller.sellerStatus === 'ACTIVE');

  const handleSellerClick = (sellerId: number) => {
    navigate(`/products?seller=${sellerId}`);
  };

  if (isLoading) {
    return (
      <div className="p-3 text-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-xs text-gray-500 mt-1">Loading sellers...</p>
      </div>
    );
  }

  if (activeSellers.length === 0) {
    return (
      <div className="p-3 text-center">
        <Building2 className="w-6 h-6 text-gray-400 mx-auto mb-1" />
        <p className="text-sm text-gray-500">No active sellers found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-72">
      <div className="p-1">
        {activeSellers.map((seller: any) => (
          <DropdownMenuItem
            key={seller.id}
            className="p-3 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
            onClick={() => handleSellerClick(seller.id)}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {seller.businessName || seller.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {seller.name}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SellersDropdown;