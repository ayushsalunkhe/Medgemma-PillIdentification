import React, { useState } from 'react';
import type { MedicineInfo, SideEffectsInfo } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { FormattedContent } from './FormattedContent';
import { PillIcon } from './icons/PillIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { BanIcon } from './icons/BanIcon';
import { ThermometerIcon } from './icons/ThermometerIcon';
import { InfoIcon } from './icons/InfoIcon';
import { SideEffectsChart } from './SideEffectsChart';
import { useTranslations, LANGUAGES } from '../hooks/useTranslations';
import { TranslationLoader } from './TranslationLoader';


interface MedicineInfoCardProps {
  info: MedicineInfo;
  source: 'FDA' | 'MedGemma' | null;
  language: string;
  isTranslating: boolean;
}

const AccordionItem: React.FC<{ title: string; content?: string[] | string | null; defaultOpen?: boolean; icon?: React.ReactNode; children?: React.ReactNode; }> = ({ title, content, defaultOpen = false, icon, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const hasContent = content || (Array.isArray(content) && content.length > 0) || children;
  if (!hasContent) return null;

  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${title.replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div 
          id={`accordion-content-${title.replace(/\s+/g, '-')}`}
          className="mt-3 pl-8 text-gray-600 prose prose-sm max-w-none"
        >
          {content && <FormattedContent content={content} />}
          {children}
        </div>
      )}
    </div>
  );
};


export const MedicineInfoCard: React.FC<MedicineInfoCardProps> = ({ info, source, language, isTranslating }) => {
    const { t } = useTranslations(language as keyof typeof LANGUAGES);
    const sideEffects = info.sideEffects;
    
    const getSourceInfo = () => {
        if (source === 'FDA') {
            return { text: t('dataSourceFda'), bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
        }
        if (source === 'MedGemma') {
            return { text: t('dataSourceMedGemma'), bgColor: 'bg-green-100', textColor: 'text-green-800' };
        }
        return null;
    };

    const sourceInfo = getSourceInfo();
    
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{info.name}</h2>
            {sourceInfo && (
                <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${sourceInfo.bgColor} ${sourceInfo.textColor}`}>
                    {sourceInfo.text}
                </span>
            )}
        </div>
        {isTranslating && <TranslationLoader language={language} />}
        {info.summary && (
             <div className="mt-2 text-gray-600 prose prose-sm max-w-none">
                 <p>{info.summary}</p>
             </div>
        )}
      </div>
      <div key={language} className="content-fade-in">
        <div className="px-6 pb-2">
            <AccordionItem title={t('activeIngredients')} content={info.activeIngredients} defaultOpen={true} icon={<PillIcon className="w-5 h-5 text-gray-500" />} />
            <AccordionItem title={t('purpose')} content={info.purpose} icon={<InfoIcon className="w-5 h-5 text-gray-500" />} />
            <AccordionItem title={t('howToTake')} content={info.howToTake} icon={<ClockIcon className="w-5 h-5 text-gray-500" />} />
            
            {sideEffects && typeof sideEffects === 'object' && !Array.isArray(sideEffects) ? (
                <AccordionItem 
                    title={t('commonSideEffects')} 
                    content={sideEffects.summary}
                    icon={<AlertTriangleIcon className="w-5 h-5 text-gray-500" />}
                >
                    {sideEffects.chartData && sideEffects.chartData.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">{t('sideEffectsVisualization')}</h4>
                            <SideEffectsChart data={sideEffects.chartData} />
                        </div>
                    )}
                </AccordionItem>
            ) : (
                // FIX: TypeScript's control flow analysis fails to narrow `sideEffects` in this `else` branch.
                // We cast it to the correct narrowed type to resolve the error. In this branch, `sideEffects`
                // can only be a string, a string array, or undefined.
                <AccordionItem title={t('commonSideEffects')} content={sideEffects as string | string[] | undefined} icon={<AlertTriangleIcon className="w-5 h-5 text-gray-500" />} />
            )}

            <AccordionItem title={t('whatToAvoid')} content={info.whatToAvoid} icon={<BanIcon className="w-5 h-5 text-gray-500" />} />
            <AccordionItem title={t('storage')} content={info.storage} icon={<ThermometerIcon className="w-5 h-5 text-gray-500" />} />
            <AccordionItem title={t('warnings')} content={info.warnings} icon={<AlertTriangleIcon className="w-5 h-5 text-gray-500" />} />
        </div>
      </div>
    </div>
  );
};