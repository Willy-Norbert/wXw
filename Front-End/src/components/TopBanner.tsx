
import { Link } from "react-router-dom";
import { useLanguage } from '@/contexts/LanguageContext';

const TopBanner = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-purple text-white py-2 text-center text-sm">
      <div className="container mx-auto px-4">
        {t('banner.sell_on_system')}: <span className="text-black">
          <Link to="/seller-request" className="text-sm hover:underline">
            {t('banner.join_as_seller')}
          </Link>
        </span>
      </div>
    </div>
  );
};

export default TopBanner;
