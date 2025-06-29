
import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'header' | 'dashboard';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'header', 
  className = '' 
}) => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: t('language.english'), nativeName: 'English' },
    { code: 'rw', name: t('language.kinyarwanda'), nativeName: 'Kinyarwanda' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant === 'dashboard' ? 'ghost' : 'ghost'} 
          size={variant === 'dashboard' ? 'sm' : 'icon'}
          className={`${className} ${variant === 'dashboard' ? 'h-9 px-3' : 'h-10 w-10'}`}
        >
          {variant === 'dashboard' ? (
            <>
              <Globe className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">
                {currentLanguage?.nativeName || 'EN'}
              </span>
            </>
          ) : (
            <Languages className="w-4 h-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white border border-gray-200 shadow-lg z-50"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer hover:bg-gray-100 ${
              language === lang.code ? 'bg-purple-50 text-purple-600' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{lang.nativeName}</span>
              {language === lang.code && (
                <span className="text-xs text-purple-500">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
