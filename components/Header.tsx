import React from 'react';
import { Box, Button, Flex, Text, Menu, MenuButton, MenuList, MenuItem, Avatar } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PillIcon } from './icons/PillIcon';
import { LanguageSelector } from './LanguageSelector';
import { useTranslations } from '../hooks/useTranslations';
import { LANGUAGES } from '../hooks/useTranslations';
import { auth } from '../services/firebaseService';

interface HeaderProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange }) => {
  const { t } = useTranslations(language as keyof typeof LANGUAGES);
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const userEmail = auth.currentUser?.email;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box bg="white" shadow="md" borderBottom="1px" borderColor="gray.200" py={4}>
      <Flex maxW="container.xl" mx="auto" px={4} justify="space-between" align="center">
        <Flex align="center" gap={3}>
          <PillIcon className="h-8 w-8 text-indigo-600" />
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            {t('headerTitle')} <Text as="span" color="indigo.600">{t('headerSubtitle')}</Text>
          </Text>
        </Flex>
        
        <Flex align="center" gap={4}>
          <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} />
          
          {auth.currentUser && (
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                rounded="full"
                display="flex"
                alignItems="center"
              >
                <Flex align="center" gap={2}>
                  <Avatar size="sm" name={userEmail || undefined} />
                  <Box textAlign="left">
                    <Text fontSize="sm" fontWeight="medium">{userEmail}</Text>
                    <Text fontSize="xs" color="gray.600">{userType === 'doctor' ? 'Doctor' : 'User'}</Text>
                  </Box>
                </Flex>
              </MenuButton>
              <MenuList>
                {userType === 'user' && (
                  <MenuItem as={RouterLink} to="/consultations">
                    My Consultations
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};