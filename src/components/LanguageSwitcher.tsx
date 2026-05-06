import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group backdrop-blur-md"
    >
      <Globe size={16} className="text-primary group-hover:rotate-12 transition-transform" />
      <span className="text-[10px] font-black uppercase tracking-widest text-white">
        {i18n.language === 'en' ? 'English' : 'हिंदी'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
