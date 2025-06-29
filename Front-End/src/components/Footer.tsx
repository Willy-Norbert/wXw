
import { MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-xl">{t('footer.company_name')}</span>
            </div>
            <p className="text-gray-400 mb-4">
              {t('footer.company_description')}
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-purple" />
                <span className="text-sm text-gray-400">{t('footer.location')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-purple" />
                <span className="text-sm text-gray-400">+250 784 720 984</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-purple" />
                <span className="text-sm text-gray-400">info@rwandamarketplace.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quick_links')}</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-purple transition-colors">{t('nav.home')}</a></li>
              <li><a href="/products" className="text-gray-400 hover:text-purple transition-colors">{t('nav.products')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple transition-colors">{t('nav.categories')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple transition-colors">{t('nav.about')}</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-purple transition-colors">{t('nav.contact')}</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-purple transition-colors">{t('footer.help_center')}</a></li>
              <li><a href="/" className="text-gray-400 hover:text-purple transition-colors">{t('footer.shipping_info')}</a></li>
              <li><a href="/" className="text-gray-400 hover:text-purple transition-colors">{t('footer.returns')}</a></li>
              <li><a href="/" className="text-gray-400 hover:text-purple transition-colors">{t('footer.privacy_policy')}</a></li>
              <li><a href="/" className="text-gray-400 hover:text-purple transition-colors">{t('footer.terms_of_service')}</a></li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.location_title')}</h3>
            <p className="text-gray-400 text-sm mb-4">
              {t('footer.location_description')}
            </p>
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-sm font-semibold">{t('footer.store_hours')}</p>
              <p className="text-xs text-gray-400">{t('footer.weekdays')}</p>
              <p className="text-xs text-gray-400">{t('footer.weekends')}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
