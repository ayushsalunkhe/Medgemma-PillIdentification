import { useMemo } from 'react';

export const LANGUAGES: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'hi': 'Hindi'
};

// FIX: Define English translations as the base object to derive types from and for fallbacks.
// This resolves circular dependency issues and problems with `this` context.
const enTranslations = {
    pageTitle: "Pill Identifier AI",
    headerTitle: "Pill Identifier",
    headerSubtitle: "AI",
    identifyYourMedicine: "Identify Your Medicine",
    uploadAPhoto: "Upload a photo, and let AI provide you with information.",
    clickToUpload: "Click to upload",
    dragAndDrop: "or drag and drop",
    fileTypes: "PNG, JPG, or WEBP",
    identifyMedicine: "Identify Medicine",
    processing: "Processing...",
    errorTitle: "Error",
    translationError: "Translation failed. Displaying original language.",
    placeholderText: "Your medicine information will appear here.",
    disclaimer: "<strong>Disclaimer:</strong> This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a healthcare professional for any medical questions.",
    convertingImage: "Converting image...",
    identifyingMedicine: "Identifying medicine from image with AI...",
    searchingFda: (name: string) => `Searching FDA database for "${name}"...`,
    summarizingInfo: "Summarizing information for easier reading...",
    consultingMedGemma: (name: string) => `"${name}" not in FDA database. Consulting MedGemma AI...`,
    translating: (lang: string) => `Translating to ${lang}...`,
    activeIngredients: "Active Ingredient(s)",
    purpose: "Purpose",
    howToTake: "How to Take",
    commonSideEffects: "Common Side Effects",
    sideEffectsVisualization: "Most Common Side Effects Visualization",
    whatToAvoid: "What to Avoid",
    storage: "Storage",
    warnings: "Warnings",
    dataSourceFda: "Data sourced from openFDA",
    dataSourceMedGemma: "Data sourced from Google AI (MedGemma)",
};

type TranslationSet = typeof enTranslations;

const translations: { [key: string]: TranslationSet } = {
    en: enTranslations,
    es: {
        pageTitle: "Identificador de Píldoras IA",
        headerTitle: "Identificador de Píldoras",
        headerSubtitle: "IA",
        identifyYourMedicine: "Identifica Tu Medicina",
        uploadAPhoto: "Sube una foto y deja que la IA te proporcione información.",
        clickToUpload: "Haz clic para subir",
        dragAndDrop: "o arrastra y suelta",
        fileTypes: "PNG, JPG, o WEBP",
        identifyMedicine: "Identificar Medicina",
        processing: "Procesando...",
        errorTitle: "Error",
        translationError: "La traducción falló. Mostrando idioma original.",
        placeholderText: "La información de tu medicina aparecerá aquí.",
        disclaimer: "<strong>Descargo de responsabilidad:</strong> Esta herramienta es solo para fines informativos y no sustituye el consejo, diagnóstico o tratamiento médico profesional. Siempre consulta a un profesional de la salud para cualquier pregunta médica.",
        convertingImage: "Convirtiendo imagen...",
        identifyingMedicine: "Identificando medicina de la imagen con IA...",
        searchingFda: (name: string) => `Buscando en la base de datos de la FDA por "${name}"...`,
        summarizingInfo: "Resumiendo información para una lectura más fácil...",
        consultingMedGemma: (name: string) => `"${name}" no encontrado en la base de datos de la FDA. Consultando a MedGemma IA...`,
        translating: (lang: string) => `Traduciendo al ${lang}...`,
        activeIngredients: "Ingrediente(s) Activo(s)",
        purpose: "Propósito",
        howToTake: "Cómo Tomar",
        commonSideEffects: "Efectos Secundarios Comunes",
        sideEffectsVisualization: "Visualización de Efectos Secundarios Más Comunes",
        whatToAvoid: "Qué Evitar",
        storage: "Almacenamiento",
        warnings: "Advertencias",
        dataSourceFda: "Datos de openFDA",
        dataSourceMedGemma: "Datos de Google AI (MedGemma)",
    },
    // Add other languages here, falling back to English for now
    fr: { ...enTranslations, pageTitle: 'Identificateur de Pilule IA', headerTitle: 'Identificateur de Pilule', translationError: "La traduction a échoué. Affichage de la langue originale." },
    de: { ...enTranslations, pageTitle: 'Pillen-Identifikator KI', headerTitle: 'Pillen-Identifikator', translationError: "Übersetzung fehlgeschlagen. Originalsprache wird angezeigt." },
    hi: { ...enTranslations, pageTitle: 'गोली पहचानकर्ता एआई', headerTitle: 'गोली पहचानकर्ता', translationError: "अनुवाद विफल रहा। मूल भाषा प्रदर्शित हो रही है।" },
};

type LanguageCode = keyof typeof LANGUAGES;

export const useTranslations = (lang: LanguageCode) => {
  return useMemo(() => {
    const t = (key: keyof TranslationSet, ...args: any[]): string => {
      const translationSet = translations[lang] || translations['en'];
      const translation = translationSet[key] || translations['en'][key];
      
      if (typeof translation === 'function') {
        return (translation as Function)(...args);
      }
      return translation as string;
    };
    return { t };
  }, [lang]);
};