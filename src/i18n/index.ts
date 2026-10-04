import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './messages/en.json'
import zh from './messages/zh.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['zh', 'en'],
    interpolation: {
      escapeValue: false,
    },
    resources: {
      zh: {
        translation: zh,
      },
      en: {
        translation: en,
      },
    },
  })
  .catch((err) => {
    console.error(err)
  })

export default i18n
