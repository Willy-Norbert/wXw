
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '@/api/orders';
import api from '@/api/api';

export const useDashboardData = (userRole?: string) => {
  console.log('useDashboardData called with role:', userRole);
  
  // Only fetch admin data if user is admin
  const isAdmin = userRole?.toLowerCase() === 'admin';
  const isSeller = userRole?.toLowerCase() === 'seller';
  
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['dashboard-orders', userRole],
    queryFn: async () => {
      console.log('Fetching orders for role:', userRole);
      try {
        const result = await getAllOrders();
        console.log('Dashboard orders fetched:', result);
        return result;
      } catch (error) {
        console.error('Dashboard orders fetch error:', error);
        throw error;
      }
    },
    enabled: isAdmin || isSeller,
    retry: 2,
    staleTime: 30000,
  });

  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: async () => {
      console.log('Fetching users data');
      try {
        const result = await api.get('/auth/users');
        console.log('Dashboard users fetched:', result);
        return result;
      } catch (error) {
        console.error('Dashboard users fetch error:', error);
        throw error;
      }
    },
    enabled: isAdmin,
    retry: 2,
    staleTime: 30000,
  });

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['dashboard-products', userRole],
    queryFn: async () => {
      console.log('Fetching products data');
      try {
        const result = await api.get('/products');
        console.log('Dashboard products fetched:', result);
        return result;
      } catch (error) {
        console.error('Dashboard products fetch error:', error);
        throw error;
      }
    },
    enabled: isAdmin || isSeller,
    retry: 2,
    staleTime: 30000,
  });

  // For sellers, fetch their specific data
  const { data: sellerStatsData, isLoading: sellerStatsLoading, error: sellerStatsError } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: async () => {
      console.log('Fetching seller stats');
      try {
        const result = await api.get('/sellers/my-stats');
        console.log('Seller stats fetched:', result);
        return result;
      } catch (error) {
        console.error('Seller stats fetch error:', error);
        throw error;
      }
    },
    enabled: isSeller,
    retry: 2,
    staleTime: 30000,
  });

  const { data: sellerOrdersData, isLoading: sellerOrdersLoading, error: sellerOrdersError } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      console.log('Fetching seller orders');
      try {
        const result = await api.get('/sellers/my-orders');
        console.log('Seller orders fetched:', result);
        return result;
      } catch (error) {
        console.error('Seller orders fetch error:', error);
        throw error;
      }
    },
    enabled: isSeller,
    retry: 2,
    staleTime: 30000,
  });

  const { data: sellerProductsData, isLoading: sellerProductsLoading, error: sellerProductsError } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      console.log('Fetching seller products');
      try {
        const result = await api.get('/sellers/my-products');
        console.log('Seller products fetched:', result);
        return result;
      } catch (error) {
        console.error('Seller products fetch error:', error);
        throw error;
      }
    },
    enabled: isSeller,
    retry: 2,
    staleTime: 30000,
  });

  const { data: sellerCustomersData, isLoading: sellerCustomersLoading, error: sellerCustomersError } = useQuery({
    queryKey: ['seller-customers'],
    queryFn: async () => {
      console.log('Fetching seller customers');
      try {
        const result = await api.get('/sellers/my-customers');
        console.log('Seller customers fetched:', result);
        return result;
      } catch (error) {
        console.error('Seller customers fetch error:', error);
        throw error;
      }
    },
    enabled: isSeller,
    retry: 2,
    staleTime: 30000,
  });

  if (isSeller) {
    // Return seller-specific data with proper number calculation
    const sellerStats = sellerStatsData?.data || { totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalCustomers: 0 };
    const sellerOrders = Array.isArray(sellerOrdersData?.data) ? sellerOrdersData.data : [];
    const sellerProducts = Array.isArray(sellerProductsData?.data) ? sellerProductsData.data : [];
    const sellerCustomers = Array.isArray(sellerCustomersData?.data) ? sellerCustomersData.data : [];

    console.log('Seller data processed:', { 
      sellerStats, 
      sellerOrders: sellerOrders.length, 
      sellerProducts: sellerProducts.length, 
      sellerCustomers: sellerCustomers.length,
      errors: {
        stats: sellerStatsError,
        orders: sellerOrdersError,
        products: sellerProductsError,
        customers: sellerCustomersError
      }
    });

    // Calculate revenue properly with Number() to ensure addition not concatenation
    const totalRevenue = Number(sellerStats.totalRevenue) || 0;
    const paidRevenue = sellerOrders.filter((order: any) => order.isPaid).reduce((sum: number, order: any) => {
      return sum + Number(order.totalPrice || 0);
    }, 0);

    const hasSellerError = sellerStatsError || sellerOrdersError || sellerProductsError || sellerCustomersError;
    const isSellerLoading = sellerStatsLoading || sellerOrdersLoading || sellerProductsLoading || sellerCustomersLoading;

    if (hasSellerError) {
      console.error('Seller data fetch errors:', {
        stats: sellerStatsError,
        orders: sellerOrdersError,
        products: sellerProductsError,
        customers: sellerCustomersError,
      });
    }

    return {
      totalSales: Math.round(totalRevenue / 1000),
      dailySales: sellerOrders.filter((order: any) => {
        try {
          const orderDate = new Date(order.createdAt);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        } catch {
          return false;
        }
      }).length,
      dailyUsers: sellerCustomers.length,
      totalProducts: Number(sellerStats.totalProducts) || 0,
      recentOrders: sellerOrders.slice(0, 10),
      totalRevenue,
      paidRevenue,
      totalOrders: Number(sellerStats.totalOrders) || 0,
      totalUsers: Number(sellerStats.totalCustomers) || 0,
      buyers: Number(sellerStats.totalCustomers) || 0,
      sellers: 0,
      admins: 0,
      userRoleData: [
        { name: 'My Customers', value: Number(sellerStats.totalCustomers) || 0 }
      ],
      monthlyOrdersData: [],
      paymentStatusData: [
        { name: 'Paid', value: sellerOrders.filter((order: any) => order.isPaid).length },
        { name: 'Pending', value: sellerOrders.filter((order: any) => !order.isPaid).length }
      ],
      loading: isSellerLoading,
      error: hasSellerError ? 'Failed to load seller data' : null
    };
  }

  // Admin data with proper number calculation
  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];
  const users = Array.isArray(usersData?.data) ? usersData.data : [];
  const products = Array.isArray(productsData?.data) ? productsData.data : [];

  console.log('Admin data processed:', { 
    orders: orders.length, 
    users: users.length, 
    products: products.length,
    errors: {
      orders: ordersError,
      users: usersError,
      products: productsError
    }
  });

  // Calculate statistics with proper number handling
  const totalRevenue = orders.reduce((sum: number, order: any) => {
    return sum + Number(order.totalPrice || 0);
  }, 0);
  
  const paidOrders = orders.filter((order: any) => order.isPaid);
  const paidRevenue = paidOrders.reduce((sum: number, order: any) => {
    return sum + Number(order.totalPrice || 0);
  }, 0);
  
  const totalSales = Math.round(totalRevenue / 1000);
  const dailySales = orders.filter((order: any) => {
    try {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  }).length;
  
  const buyers = users.filter((user: any) => user.role?.toLowerCase() === 'buyer');
  const sellers = users.filter((user: any) => user.role?.toLowerCase() === 'seller');
  const admins = users.filter((user: any) => user.role?.toLowerCase() === 'admin');
  
  const dailyUsers = buyers.length;
  const totalProducts = products.length;
  const recentOrders = orders.slice(0, 10);

  // Chart data
  const userRoleData = [
    { name: 'Buyers', value: buyers.length },
    { name: 'Sellers', value: sellers.length },
    { name: 'Admins', value: admins.length }
  ];

  const monthlyOrdersData = (() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyData = monthNames.map((month, index) => {
      const monthOrders = orders.filter((order: any) => {
        try {
          const orderDate = new Date(order.createdAt);
          return orderDate.getFullYear() === currentYear && orderDate.getMonth() === index;
        } catch {
          return false;
        }
      });
      
      return {
        name: month,
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum: number, order: any) => sum + Number(order.totalPrice || 0), 0)
      };
    });
    
    return monthlyData;
  })();

  const paymentStatusData = [
    { name: 'Paid', value: paidOrders.length },
    { name: 'Pending', value: orders.length - paidOrders.length }
  ];

  const loading = ordersLoading || usersLoading || productsLoading;
  const error = ordersError || usersError || productsError;

  console.log('Final admin dashboard data:', {
    totalSales,
    dailySales,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue,
    paidRevenue,
    loading,
    error: error ? 'Failed to load dashboard data' : null
  });

  return {
    totalSales,
    dailySales,
    dailyUsers,
    totalProducts,
    recentOrders,
    totalRevenue,
    paidRevenue,
    totalOrders: orders.length,
    totalUsers: users.length,
    buyers: buyers.length,
    sellers: sellers.length,
    admins: admins.length,
    userRoleData,
    monthlyOrdersData,
    paymentStatusData,
    loading,
    error: error ? 'Failed to load dashboard data' : null
  };
};
