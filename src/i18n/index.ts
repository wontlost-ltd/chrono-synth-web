/**
 * i18n 初始化
 * 支持 zh-CN / en-US，自动检测浏览器语言
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS },
    },
    supportedLngs: ['zh-CN', 'en-US'],
    fallbackLng: {
      'en': ['en-US'],
      'en-US': ['en-US'],
      'en-GB': ['en-US'],
      'zh': ['zh-CN'],
      'zh-TW': ['zh-CN'],
      'default': ['zh-CN'],
    },
    nonExplicitSupportedLngs: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'chrono-lang',
      caches: ['localStorage'],
    },
  });

function syncHtmlLang(lang: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
}

i18n.on('languageChanged', syncHtmlLang);
syncHtmlLang(i18n.resolvedLanguage ?? i18n.language);

export default i18n;
