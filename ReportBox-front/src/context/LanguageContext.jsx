import { createContext, useContext, useEffect, useState } from "react";

// `code` is the language name sent to the backend (the LLM is told to answer in
// it); `speech` is the BCP-47 tag used for browser text-to-speech.
export const LANGUAGES = [
  { code: "English", label: "English", speech: "en-IN" },
  { code: "Hindi", label: "हिन्दी", speech: "hi-IN" },
  { code: "Bengali", label: "বাংলা", speech: "bn-IN" },
  { code: "Tamil", label: "தமிழ்", speech: "ta-IN" },
  { code: "Telugu", label: "తెలుగు", speech: "te-IN" },
  { code: "Marathi", label: "मराठी", speech: "mr-IN" },
  { code: "Kannada", label: "ಕನ್ನಡ", speech: "kn-IN" },
  { code: "Gujarati", label: "ગુજરાતી", speech: "gu-IN" },
  { code: "Punjabi", label: "ਪੰਜਾਬੀ", speech: "pa-IN" },
];

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("sevak_language") || "English"
  );

  useEffect(() => {
    localStorage.setItem("sevak_language", language);
  }, [language]);

  const speechCode =
    LANGUAGES.find((l) => l.code === language)?.speech || "en-IN";

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, speechCode, languages: LANGUAGES }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};
