import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { MedicineInfoCard } from './components/MedicineInfoCard';
import UserConsultations from './components/UserConsultations';
import { identifyAndCorrectMedicineName, getMedicineInfoFallback, summarizeFdaData, translateMedicineInfo } from './services/geminiService';
import { fetchFdaData } from './services/fdaService';
import type { MedicineInfo, FdaDataToSummarize } from './types';
import { PillIcon } from './components/icons/PillIcon';
import { useTranslations, LANGUAGES } from './hooks/useTranslations';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import DoctorDashboard from './components/DoctorDashboard';
import { auth } from './services/firebaseService';

import { ChakraProvider } from '@chakra-ui/react';

// Helper function to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const MainApp: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [originalMedicineInfo, setOriginalMedicineInfo] = useState<MedicineInfo | null>(null);
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  
  const [dataSource, setDataSource] = useState<'FDA' | 'MedGemma' | null>(null);
  const [language, setLanguage] = useState<string>('en');
  
  const { t } = useTranslations(language as keyof typeof LANGUAGES);
  const [user, setUser] = useState(auth.currentUser);
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t]);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setOriginalMedicineInfo(null);
    setMedicineInfo(null);
    setError(null);
    setDataSource(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setOriginalMedicineInfo(null);
    setMedicineInfo(null);
    setError(null);
    setDataSource(null);
  };

  const processMedicineImage = useCallback(async () => {
    if (!imageFile) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOriginalMedicineInfo(null);
    setMedicineInfo(null);
    setDataSource(null);

    try {
      setLoadingMessage(t('convertingImage'));
      const base64Image = await fileToBase64(imageFile);
      const imageMimeType = imageFile.type;

      setLoadingMessage(t('identifyingMedicine'));
      const medicineName = await identifyAndCorrectMedicineName(base64Image, imageMimeType);
      
      if (!medicineName) {
        throw new Error("Could not identify a medicine name from the image.");
      }

      setLoadingMessage(t('searchingFda', medicineName));
      const fdaResult = await fetchFdaData(medicineName);
      
      let info: MedicineInfo | null = null;
      if (fdaResult && fdaResult.results && fdaResult.results.length > 0) {
        const drugInfo = fdaResult.results[0];
        
        setLoadingMessage(t('summarizingInfo'));

        const rawFdaData: FdaDataToSummarize = {
            purpose: drugInfo.purpose?.join('\n\n'),
            howToTake: drugInfo.dosage_and_administration?.join('\n\n'),
            sideEffects: drugInfo.adverse_reactions?.join('\n\n'),
            whatToAvoid: drugInfo.drug_interactions?.join('\n\n'),
            storage: drugInfo.storage_and_handling?.join('\n\n'),
            warnings: drugInfo.warnings?.join('\n\n'),
        };

        const dataToSummarize = Object.entries(rawFdaData).reduce((acc, [key, value]) => {
            if (value && value.trim()) {
                acc[key as keyof FdaDataToSummarize] = value;
            }
            return acc;
        }, {} as FdaDataToSummarize);
        
        const name = drugInfo.openfda?.brand_name?.[0] || drugInfo.openfda?.generic_name?.[0] || medicineName;

        if (Object.keys(dataToSummarize).length > 0) {
            const summarizedInfo = await summarizeFdaData(dataToSummarize);
            info = {
                name,
                activeIngredients: drugInfo.active_ingredient,
                ...summarizedInfo,
            };
        } else {
             info = {
                name,
                activeIngredients: drugInfo.active_ingredient,
                purpose: drugInfo.purpose,
                howToTake: drugInfo.dosage_and_administration,
                sideEffects: drugInfo.adverse_reactions,
                whatToAvoid: drugInfo.drug_interactions,
                storage: drugInfo.storage_and_handling,
                warnings: drugInfo.warnings
            };
        }
        
        setDataSource('FDA');
      } else {
        setLoadingMessage(t('consultingMedGemma', medicineName));
        const fallbackInfo = await getMedicineInfoFallback(medicineName);
        info = {
          name: medicineName,
          ...fallbackInfo
        };
        setDataSource('MedGemma');
      }

      if (info) {
        setOriginalMedicineInfo(info);
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [imageFile, t]);

  useEffect(() => {
    if (!originalMedicineInfo) {
      setMedicineInfo(null);
      return;
    }

    // Always display the original (English) content immediately.
    setMedicineInfo(originalMedicineInfo);

    if (language === 'en') {
      setIsTranslating(false);
      return; // No translation needed.
    }

    const translateInfo = async () => {
      setIsTranslating(true);
      setError(null); // Clear previous errors
      try {
        const translated = await translateMedicineInfo(originalMedicineInfo, language);
        setMedicineInfo(translated);
      } catch (err) {
        console.error("Translation failed:", err);
        setError(t('translationError'));
        // The original info is already displayed, so no need to set it again on error.
      } finally {
        setIsTranslating(false);
      }
    };
    
    translateInfo();
  }, [originalMedicineInfo, language, t]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header language={language} onLanguageChange={setLanguage} />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t('identifyYourMedicine')}</h2>
          <p className="mt-2 text-lg text-gray-600">{t('uploadAPhoto')}</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
          <ImageUploader onImageSelect={handleImageSelect} onClearImage={handleClearImage} imagePreview={imagePreview} language={language} />
          
          <div className="mt-6">
            <button
              onClick={processMedicineImage}
              disabled={!imageFile || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? t('processing') : t('identifyMedicine')}
            </button>
          </div>
        </div>

        {isLoading && <Loader message={loadingMessage} />}
        
        {error && (
          <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold">{t('errorTitle')}</p>
            <p>{error}</p>
          </div>
        )}

        {medicineInfo && !isLoading && (
          <div className="mt-8">
            <MedicineInfoCard 
              info={medicineInfo} 
              source={dataSource} 
              language={language} 
              isTranslating={isTranslating}
              imagePreview={imagePreview}
            />
          </div>
        )}

        {!medicineInfo && !isLoading && !error && (
            <div className="text-center mt-12 text-gray-500">
                <PillIcon className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-4 text-lg">{t('placeholderText')}</p>
            </div>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p dangerouslySetInnerHTML={{ __html: t('disclaimer') }} />
        </footer>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [userType, setUserType] = useState<string | null>(localStorage.getItem('userType'));

  useEffect(() => {
    // Listen for changes in userType
    const handleStorageChange = () => {
      setUserType(localStorage.getItem('userType'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserType(localStorage.getItem('userType'));
      } else {
        setUserType(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const renderApp = () => {
    console.log('Current userType:', userType); // Debug log
    if (userType === 'doctor') {
      return <DoctorDashboard />;
    }
    return <MainApp />;
  };

  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/consultations"
            element={
              <RequireAuth>
                <UserConsultations />
              </RequireAuth>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                {renderApp()}
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
};

// Authentication wrapper component
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const userType = localStorage.getItem('userType');
  console.log('RequireAuth - userType:', userType); // Debug log

  if (!userType || !['user', 'doctor'].includes(userType)) {
    console.log('Invalid userType, redirecting to login'); // Debug log
    localStorage.removeItem('userType');
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default App;
