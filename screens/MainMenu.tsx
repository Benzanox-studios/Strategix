
import React from 'react';
import Button from '../components/Button';
import { Screen } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface MainMenuProps {
  navigateTo: (screen: Screen) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ navigateTo }) => {
  const { t } = useAppContext();

  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold text-brand-accent mb-2 tracking-wider">{t('mainMenu.title')}</h1>
      <p className="text-brand-text-dim mb-12">{t('mainMenu.description') || 'The Offline Chess Experience'}</p>
      <div className="space-y-4">
        <Button onClick={() => navigateTo('play')}>{t('mainMenu.play')}</Button>
        <Button onClick={() => navigateTo('load')}>{t('mainMenu.load')}</Button>
        <Button onClick={() => navigateTo('stats')}>{t('mainMenu.stats')}</Button>
        <Button onClick={() => navigateTo('settings')}>{t('mainMenu.settings')}</Button>
        <Button onClick={() => navigateTo('help')}>{t('mainMenu.help')}</Button>
        <Button onClick={() => { /* Exit logic would go here */ }} variant="secondary">{t('mainMenu.exit')}</Button>
      </div>
    </div>
  );
};

export default MainMenu;
