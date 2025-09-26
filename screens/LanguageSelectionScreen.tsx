import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { Language } from '../types';

const languages: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'tr', name: 'Türkçe' },
];

interface LanguageSelectionScreenProps {
  onLanguageSelect: (language: Language) => void;
}

const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ onLanguageSelect }) => {
  return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-brand-accent mb-6">Select Language / Seleccionar Idioma</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto p-1">
          {languages.map(({ code, name }) => (
            <Button key={code} onClick={() => onLanguageSelect(code)}>
              {name}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default LanguageSelectionScreen;
