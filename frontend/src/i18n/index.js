import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
    .use(LanguageDetector)
    .use(resourcesToBackend((language, namespace) =>
        import(`./locales/${language}/${namespace}.json`)
    ))
    .use(initReactI18next)
    .init({
        fallbackLng: 'hi',
        supportedLngs: ['en', 'hi', 'mr'],
        debug: false,
        ns: ['common', 'auth', 'dashboard', 'modules', 'terms'],
        defaultNS: 'common',

        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'querystring', 'cookie', 'sessionStorage', 'navigator', 'htmlTag'],
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage', 'cookie'],
        },
    });

export default i18n;
