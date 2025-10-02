import React from 'react';
import { PillIcon } from './icons/PillIcon';
import { LanguageSelector } from './LanguageSelector';
import { useTranslations } from '../hooks/useTranslations';
import { LANGUAGES } from '../hooks/useTranslations';

interface HeaderProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange }) => {
  const { t } = useTranslations(language as keyof typeof LANGUAGES);
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <PillIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t('headerTitle')} <span className="text-indigo-600">{t('headerSubtitle')}</span>
          </h1>
        </div>
        <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>
    </header>
  );
};