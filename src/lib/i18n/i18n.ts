import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import ChainedBackend from "i18next-chained-backend";
import LanguageDetector from "i18next-browser-languagedetector";

export interface LanguageType {
  code: string;
  name: string;
}

export const supportedLanguages: LanguageType[] = [
  { name: "english", code: "en" },
  { name: "farsi", code: "fa" },
  { name: "pashto", code: "ps" },
];

i18n
  .use(LanguageDetector)
  .use(ChainedBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    ns: ["front_end"],
    defaultNS: "front_end",
    debug: import.meta.env.DEV,
    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        {
          expirationTime: 24 * 60 * 60 * 1000, // 24 hours
        },
        {
          loadPath: `${
            import.meta.env.VITE_API_BASE_URL
          }/api/v1/locales/{{lng}}/{{ns}}`,
        },
      ],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"],
      lookupQuerystring: "lng",
    },
  });

export default i18n;
