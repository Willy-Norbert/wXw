
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('error.404.title')}</h1>
        <p className="text-xl text-gray-600 mb-4">{t('error.404.message')}</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('error.404.return_home')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
