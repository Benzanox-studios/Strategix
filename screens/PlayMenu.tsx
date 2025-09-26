import React, { useState } from 'react';
import { Screen, Difficulty, PieceColor, GameConfig } from '../types';
import Button from '../components/Button';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/Card';

interface PlayMenuProps {
  navigateTo: (screen: Screen) => void;
}

const OptionButton: React.FC<{active?: boolean; onClick?: () => void; children: React.ReactNode; disabled?: boolean}> = ({active, onClick, children, disabled}) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded-md transition-colors duration-200 w-full md:w-auto ${
            disabled 
            ? 'bg-brand-primary text-brand-text-dim cursor-not-allowed opacity-50' 
            : active 
                ? 'bg-brand-accent text-brand-primary' 
                : 'bg-brand-primary hover:bg-gray-700'
        }`}
    >
        {children}
    </button>
);

const DifficultyOption: React.FC<{
  level: Difficulty;
  current: Difficulty;
  onClick: (level: Difficulty) => void;
}> = ({ level, current, onClick }) => {
  const { t } = useAppContext();
  const isActive = level === current;
  return (
    <button
      onClick={() => onClick(level)}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
        isActive
          ? 'bg-brand-accent/20 border-brand-accent'
          : 'bg-brand-primary border-transparent hover:border-brand-accent/50'
      }`}
    >
      <p className={`font-bold ${isActive ? 'text-brand-accent' : 'text-brand-text'}`}>
        {t(`playMenu.${level}`)}
      </p>
      <p className="text-sm text-brand-text-dim">{t(`playMenu.${level}Desc`)}</p>
    </button>
  );
};


const PlayMenu: React.FC<PlayMenuProps> = ({ navigateTo }) => {
  const { t, setCurrentGame } = useAppContext();
  const [mode, setMode] = useState<'ai' | 'local' | 'tutorial'>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [color, setColor] = useState<PieceColor>('white');
  const [hints, setHints] = useState<boolean>(false);

  const handleStartGame = () => {
    const config: GameConfig = {
      mode,
      hints,
    };
    if (mode === 'ai') {
        config.difficulty = difficulty;
        config.playerColor = color;
    }
    setCurrentGame(config);
    navigateTo('game');
  };

  return (
    <Card>
      <h2 className="text-3xl font-bold text-center text-brand-accent mb-6">{t('playMenu.title')}</h2>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-around bg-brand-primary p-2 rounded-lg gap-2">
            <OptionButton active={mode === 'ai'} onClick={() => setMode('ai')}>{t('playMenu.vsAI')}</OptionButton>
            <OptionButton active={mode === 'local'} onClick={() => setMode('local')}>{t('playMenu.local')}</OptionButton>
            <OptionButton disabled>{t('playMenu.onlineComingSoon')}</OptionButton>
        </div>

        {mode === 'ai' && (
            <>
                <div>
                    <label className="block text-brand-text-dim mb-2">{t('playMenu.difficulty')}</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <DifficultyOption level="easy" current={difficulty} onClick={setDifficulty} />
                        <DifficultyOption level="medium" current={difficulty} onClick={setDifficulty} />
                        <DifficultyOption level="hard" current={difficulty} onClick={setDifficulty} />
                        <DifficultyOption level="master" current={difficulty} onClick={setDifficulty} />
                    </div>
                </div>
                <div>
                    <label className="block text-brand-text-dim mb-2">{t('playMenu.pieceColor')}</label>
                    <div className="flex flex-col md:flex-row justify-between bg-brand-primary p-2 rounded-lg gap-2">
                    <OptionButton active={color === 'white'} onClick={() => setColor('white')}>{t('playMenu.white')}</OptionButton>
                    <OptionButton active={color === 'black'} onClick={() => setColor('black')}>{t('playMenu.black')}</OptionButton>
                    <OptionButton active={color === 'random'} onClick={() => setColor('random')}>{t('playMenu.random')}</OptionButton>
                    </div>
                </div>
            </>
        )}
        
        <div className="flex items-center justify-between">
            <label className="text-brand-text-dim">{t('playMenu.moveHints')}</label>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={hints} onChange={() => setHints(!hints)} className="sr-only peer" />
                <div className="w-11 h-6 bg-brand-primary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
            </label>
        </div>
        
        <div className="flex gap-4 pt-4">
            <Button onClick={() => navigateTo('main')} variant="secondary">{t('common.back')}</Button>
            <Button onClick={handleStartGame}>{t('playMenu.start')}</Button>
        </div>
      </div>
    </Card>
  );
};

export default PlayMenu;