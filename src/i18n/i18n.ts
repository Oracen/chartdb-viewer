import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en, enMetadata } from './locales/en';
const resources = {
    en,
};

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        interpolation: {
            escapeValue: false,
        },
        fallbackLng: enMetadata.code,
        debug: false,
    });

export { i18n };
