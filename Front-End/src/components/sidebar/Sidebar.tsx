
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, Package, FileText, ShoppingCart, TrendingUp, MessageSquare, UserCheck, FolderOpen, Settings } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
}

const getMenuItems = (userRole: string) => {
  const baseItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard', roles: ['admin', 'seller'] }
  ];

  // Add role-specific menu items
  if (userRole === 'seller') {
    baseItems.push(
      { id: 'customers', label: 'Customers', icon: Users, path: '/customers', roles: ['seller'] }
    );
  } else if (userRole === 'admin') {
    baseItems.push(
      { id: 'customers', label: 'Users', icon: Users, path: '/user-management', roles: ['admin'] }
    );
  }

  // Add common items
  baseItems.push(
    { id: 'seller-management', label: 'Vendor', icon: Settings, path: '/seller-management', roles: ['admin'] },
    { id: 'community-chat', label: 'Community Chat', icon: MessageSquare, path: '/community-chat', roles: ['admin', 'seller'] }
  );

  return baseItems;
};

const managementItems = [
  { label: 'Products', path: '/admin-products', roles: ['admin', 'seller'] },
  { label: 'Categories', path: '/admin-categories', roles: ['admin', 'seller'] },
  { label: 'Orders', path: '/orders', roles: ['admin', 'seller'] },
  { label: 'Reports', path: '/reports', roles: ['admin', 'seller'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  if (!user) return null;

  const userRole = user.role?.toLowerCase();
  const menuItems = getMenuItems(userRole);
  
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );
  
  const filteredManagementItems = managementItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="w-64 bg-gradient-to-b from-purple-400 to-purple-600 text-white p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          w<span className="text-purple-200">X</span>c
        </h1>
        <p className="text-purple-200 text-sm">Change Potential</p>
      </div>

      <nav className="space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || currentPage === item.id;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'text-purple-100 hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {filteredManagementItems.length > 0 && (
        <div className="mt-8 pt-8 border-t border-purple-300">
          <h3 className="text-purple-200 text-sm font-semibold mb-4">Management</h3>
          <div className="space-y-2">
            {filteredManagementItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`block px-4 py-2 transition-colors rounded-lg ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'text-purple-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-auto pt-8">
        <div className="flex items-center space-x-3 px-4 py-3 bg-white bg-opacity-10 rounded-lg">
          <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center">
            <span className="text-purple-800 font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-medium">{user.name}</p>
            <p className="text-purple-200 text-sm capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
