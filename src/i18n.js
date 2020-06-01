import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import electronBackend from "./i18next-electron-backend";
import httpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import { isElectron } from './util';

i18n.use(isElectron ? electronBackend : httpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      load: 'languageOnly',

      interpolation: {
        escapeValue: false
      }
    });

export default i18n;
