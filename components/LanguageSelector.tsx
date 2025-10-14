import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { GlobeIcon } from './icons/GlobeIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { LANGUAGES } from '../hooks/useTranslations';

interface LanguageSelectorProps {
    currentLanguage: string;
    onLanguageChange: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => (
    <Menu>
        <MenuButton
            as={Button}
            variant="ghost"
            rightIcon={<ChevronDownIcon className="h-4 w-4" />}
            leftIcon={<GlobeIcon className="h-5 w-5" />}
        >
            {LANGUAGES[currentLanguage as keyof typeof LANGUAGES]}
        </MenuButton>
        <MenuList>
            {Object.entries(LANGUAGES).map(([code, name]) => (
                <MenuItem
                    key={code}
                    onClick={() => onLanguageChange(code)}
                    bg={currentLanguage === code ? 'gray.100' : undefined}
                    color={currentLanguage === code ? 'indigo.600' : undefined}
                >
                    {name}
                </MenuItem>
            ))}
        </MenuList>
    </Menu>
);