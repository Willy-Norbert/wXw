import { Search, User, Menu, Settings, LogOut, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import TopBanner from './TopBanner';
import LanguageSwitcher from './LanguageSwitcher';
import CartBadge from './CartBadge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
  };

  const handleChatClick = (e: React.MouseEvent) => {
    // If user is not logged in or not admin/seller, prevent default and redirect to login
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SELLER')) {
      e.preventDefault();
      window.location.href = '/login';
      return;
    }
    // If user is admin or seller, let the Link component handle the navigation
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <TopBanner />
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <div className="flex items-center space-x-2">
                <img 
                  src="/wxc.png" 
                  alt="Rwanda Marketplace Logo" 
                  className="h-12 w-auto"
                />
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
                {t('nav.home')}
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-purple-600 transition-colors">
                {t('nav.products')}
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-purple-600 transition-colors">
                {t('nav.categories')}
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-purple-600 transition-colors">
                {t('nav.about')}
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-purple-600 transition-colors">
                {t('nav.contact')}
              </Link>
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-3">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder={t('products.search_placeholder')}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="bg-transparent border-none outline-none text-sm w-64"
                />
                <button type="submit" className="sr-only">Search</button>
              </form>

              <CartBadge />

              {/* Chat Icon - Visible to all users */}
              <Link 
                to="/community-chat"
                onClick={handleChatClick}
              >
                <Button variant="ghost" size="icon" className="text-gray-700 hover:text-purple-600">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </Link>

              <LanguageSwitcher variant="header" />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg z-50">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {t('dashboard.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {/* <Settings className="w-4 h-4 mr-2" />
                      {t('dashboard.settings')} */}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 transition-colors">
                        {t('nav.dashboard')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('auth.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              )}

              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
