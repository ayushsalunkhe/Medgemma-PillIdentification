import React from 'react';
import { useTranslations, LANGUAGES } from '../hooks/useTranslations';

interface TranslationLoaderProps {
    language: string;
}

export const TranslationLoader: React.FC<TranslationLoaderProps> = ({ language }) => {
    const { t } = useTranslations(language as keyof typeof LANGUAGES);
    
    return (
        <div className="flex items-center gap-2 text-sm text-indigo-600 mb-2">
            <div className="w-4 h-4 border-2 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
            <span>{t('translating', LANGUAGES[language as keyof typeof LANGUAGES])}</span>
        </div>
    );
};
