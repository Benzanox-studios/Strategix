import React, { useState } from 'react';
import { Screen, AnimationSpeed, Language } from '../types';
import Button from '../components/Button';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/Card';
import Modal from '../components/Modal';

const ThemeToggle: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const isLight = settings.theme === 'light';

    const toggleTheme = () => {
        setSettings({ ...settings, theme: isLight ? 'dark' : 'light' });
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex items-center h-8 w-16 rounded-full bg-brand-primary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary focus:ring-brand-accent"
            aria-label="Toggle theme"
        >
            <span
                className={`${
                    isLight ? 'translate-x-9' : 'translate-x-1'
                } inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 flex items-center justify-center`}
            >
                {isLight ? (
                    // Sun icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.95a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zm3.464-6.536a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    // Moon icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </span>
        </button>
    );
};

const SettingsMenu: React.FC<{ navigateTo: (screen: Screen) => void; }> = ({ navigateTo }) => {
  const { settings, setSettings, setStats, t } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleResetStats = () => {
    setStats({
      played: 0, won: 0, lost: 0, drawn: 0,
      openings: {}, rating: 1200,
    });
    setIsModalOpen(false);
  };

  const SettingRow: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
      <div className="flex items-center justify-between py-2 border-b border-brand-primary">
          <span className="text-brand-text-dim">{label}</span>
          {children}
      </div>
  )

  const SegmentedControl: React.FC<{options: {label: string, value: string}[], value: string, onChange: (val: any) => void}> = ({options, value, onChange}) => (
       <div className="flex items-center bg-brand-primary rounded-full p-1">
          {options.map(opt => (
              <button 
                key={opt.value}
                onClick={() => onChange(opt.value)} 
                className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${value === opt.value ? 'bg-brand-accent text-brand-primary' : 'text-brand-text hover:bg-brand-secondary'}`}
              >
                  {opt.label}
              </button>
          ))}
      </div>
  );

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-brand-accent">{t('settingsMenu.title')}</h2>
          <ThemeToggle />
        </div>
        <div className="space-y-2">
            <SettingRow label={t('settingsMenu.language')}>
                <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value as Language })}
                className="bg-brand-primary text-brand-text rounded-md p-2 border border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="pt">Português</option>
                <option value="ru">Русский</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="ar">العربية</option>
                <option value="hi">हिन्दी</option>
                <option value="tr">Türkçe</option>
                </select>
            </SettingRow>

            <SettingRow label={t('settingsMenu.sound')}>
                <span className="text-brand-text-dim italic">{t('common.comingSoon')}</span>
            </SettingRow>
            
            <SettingRow label={t('settingsMenu.music')}>
                <span className="text-brand-text-dim italic">{t('common.comingSoon')}</span>
            </SettingRow>
            
            <SettingRow label={t('settingsMenu.animationSpeed')}>
                <SegmentedControl 
                    options={[
                        {label: t('settingsMenu.slow'), value: 'slow'}, 
                        {label: t('settingsMenu.normal'), value: 'normal'},
                        {label: t('settingsMenu.fast'), value: 'fast'}
                    ]}
                    value={settings.animationSpeed}
                    onChange={(val) => setSettings({...settings, animationSpeed: val as AnimationSpeed})}
                />
            </SettingRow>

          <div className="pt-4">
            <Button onClick={() => setIsModalOpen(true)} variant="secondary">{t('settingsMenu.resetStats')}</Button>
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={() => navigateTo('main')}>{t('common.back')}</Button>
        </div>
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('settingsMenu.resetStats')}>
        <p className="text-brand-text-dim mb-6">{t('settingsMenu.resetConfirm')}</p>
        <div className="flex gap-4">
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">{t('common.cancel')}</Button>
            <Button onClick={handleResetStats}>{t('settingsMenu.confirm')}</Button>
        </div>
      </Modal>
    </>
  );
};

export default SettingsMenu;