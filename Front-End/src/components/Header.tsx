
import { Search, User, Menu, Settings, LogOut, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROUTES } from '@/constants/app';
import TopBanner from './TopBanner';
import LanguageSwitcher from './LanguageSwitcher';
import CartBadge from './CartBadge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import SellersDropdown from './SellersDropdown';
import ChatBadge from './ChatBadge';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.REGISTER;
  const showBackButton = isAuthPage;

  const handleLogout = () => {
    logout();
  };

  const handleChatClick = (e: React.MouseEvent) => {
    if (!user || (user.role.toLowerCase() !== 'admin' && user.role.toLowerCase() !== 'seller')) {
      e.preventDefault();
      window.location.href = ROUTES.LOGIN;
      return;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Auto-search as user types (debounced)
    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        navigate(`/products?search=${encodeURIComponent(value.trim())}`);
      }, 800); // 800ms debounce
      
      // Clear previous timeout
      return () => clearTimeout(timeoutId);
    }
  };

  const handleBackToHome = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <>
      <TopBanner />
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with conditional back button */}
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToHome}
                  className="text-gray-600 hover:text-purple-600 lg:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              
              <Link to={ROUTES.HOME}>
                <div className="flex items-center space-x-2">
                  <img 
                    src="/wxc.png" 
                    alt="Rwanda Marketplace Logo" 
                    className="h-10 w-auto md:h-12"
                  />
                </div>
              </Link>
            </div>

            {/* Navigation - Hidden on auth pages */}
            {!isAuthPage && (
              <>
                <nav className="hidden lg:flex items-center space-x-8">
                  <Link to={ROUTES.HOME} className="text-gray-700 hover:text-purple-600 transition-colors">
                    {t('nav.home')}
                  </Link>
                  <Link to="/products" className="text-gray-700 hover:text-purple-600 transition-colors">
                    {t('nav.products')}
                  </Link>
                  <Link to="/categories" className="text-gray-700 hover:text-purple-600 transition-colors">
                    {t('nav.categories')}
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-gray-700 text-md hover:text-purple-600 transition-colors">
                        Sellers
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-white border border-gray-200 shadow-lg z-50 w-56">
                      <SellersDropdown />
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link to="/about" className="text-gray-700 hover:text-purple-600 transition-colors">
                    {t('nav.about')}
                  </Link>
                  <Link to="/contact" className="text-gray-700 hover:text-purple-600 transition-colors">
                    {t('nav.contact')}
                  </Link>
                </nav>

                {/* Search and Actions */}
                <div className="flex items-center space-x-2 md:space-x-4">
                  {/* Search - Hidden on mobile */}
                  <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input 
                      type="text" 
                      placeholder={t('products.search_placeholder')}
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      className="bg-transparent border-none outline-none text-sm w-48 lg:w-64"
                    />
                    <button type="submit" className="sr-only">Search</button>
                  </form>

                  <CartBadge />

                  {/* Chat Icon - Visible only to Admin or Seller */}
                {user && (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'seller') && (
                <ChatBadge />
              )}


                  <LanguageSwitcher variant="header" />

                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium hidden md:block">{user.name.split(' ')[0]}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg z-50">
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {t('dashboard.profile')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                           {user && (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'seller') && (
                          <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 transition-colors">
                            {t('nav.dashboard')}
                          </Link> )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="w-4 h-4 mr-2" />
                          {t('auth.logout')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link to={ROUTES.LOGIN}>
                      <Button variant="ghost" size="icon">
                        <User className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}

                  {/* Mobile Menu Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </div>
              </>
            )}

            {/* Auth page actions */}
            {isAuthPage && (
              <div className="flex items-center space-x-4">
                <LanguageSwitcher variant="header" />
                <Button
                  variant="outline"
                  onClick={handleBackToHome}
                  className="hidden lg:flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Menu */}
          {!isAuthPage && mobileMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <Link to={ROUTES.HOME} className="text-gray-700 hover:text-purple-600 transition-colors">
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
                
                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder={t('products.search_placeholder')}
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="bg-transparent border-none outline-none text-sm flex-1"
                  />
                </form>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
