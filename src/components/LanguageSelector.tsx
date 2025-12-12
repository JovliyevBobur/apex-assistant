import { useState } from "react";
import uzbekFlag from "@/assets/flags/uzbekistan.png";
import usaFlag from "@/assets/flags/usa.png";
import russiaFlag from "@/assets/flags/russia.png";
import saudiFlag from "@/assets/flags/saudi-arabia.png";

export type Language = "uz" | "en" | "ru" | "ar";

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: "uz", name: "O'zbek", flag: uzbekFlag },
  { code: "en", name: "English", flag: usaFlag },
  { code: "ru", name: "Русский", flag: russiaFlag },
  { code: "ar", name: "العربية", flag: saudiFlag },
];

interface LanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
}

const LanguageSelector = ({ value, onChange }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedLang = languages.find(l => l.code === value) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/50 border border-border/50 hover:bg-card/80 transition-all duration-300"
      >
        <img 
          src={selectedLang.flag} 
          alt={selectedLang.name} 
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-foreground">{selectedLang.name}</span>
        <svg 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px] animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 hover:bg-accent/10 transition-colors ${
                value === lang.code ? 'bg-accent/20' : ''
              }`}
            >
              <img 
                src={lang.flag} 
                alt={lang.name} 
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-sm text-foreground">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
