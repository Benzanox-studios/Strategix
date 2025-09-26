import React from 'react';
import { Screen, SavedGame, GameConfig } from '../types';
import Button from '../components/Button';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/Card';

interface LoadGameMenuProps {
  navigateTo: (screen: Screen) => void;
}

const LoadGameMenu: React.FC<LoadGameMenuProps> = ({ navigateTo }) => {
  const { t, savedGames, setSavedGames, setCurrentGame } = useAppContext();

  const handleDelete = (id: string) => {
    setSavedGames(savedGames.filter(game => game.id !== id));
  };

  const handleLoad = (game: SavedGame) => {
    const config: GameConfig = {
      mode: game.mode.includes('vs AI') ? 'ai' : 'local',
      fen: game.fen,
      history: game.history,
    };
    setCurrentGame(config);
    navigateTo('game');
  };

  return (
    <Card>
      <h2 className="text-3xl font-bold text-center text-brand-accent mb-6">{t('loadMenu.title')}</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {savedGames.length > 0 ? (
          savedGames.map((game: SavedGame) => (
            <div key={game.id} className="bg-brand-primary p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-brand-text">{game.mode}</p>
                <p className="text-sm text-brand-text-dim">{`${game.date} - ${game.duration}`}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleLoad(game)} className="bg-brand-accent text-brand-primary px-4 py-1 rounded hover:opacity-90">{t('loadMenu.load')}</button>
                <button onClick={() => handleDelete(game.id)} className="bg-red-600 text-white px-4 py-1 rounded hover:opacity-90">{t('loadMenu.delete')}</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-brand-text-dim py-8">{t('loadMenu.empty')}</p>
        )}
      </div>
      <div className="mt-6">
        <Button onClick={() => navigateTo('main')} variant="secondary">{t('common.back')}</button>
      </div>
    </Card>
  );
};

export default LoadGameMenu;
