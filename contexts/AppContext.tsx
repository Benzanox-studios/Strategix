import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Settings, Stats, SavedGame, GameConfig, Difficulty } from '../types';
import { translations } from '../lib/localization';

const defaultSettings: Settings = {
  language: 'en',
  sound: false,
  music: false,
  theme: 'dark',
  animationSpeed: 'normal',
};

const defaultStats: Stats = {
  played: 0,
  won: 0,
  lost: 0,
  drawn: 0,
  openings: {},
  rating: 1200,
};

const defaultSavedGames: SavedGame[] = [
    { id: '1', date: '2023-10-27 10:30', duration: '45m', mode: 'vs AI (Medium)', fen: 'r1bqk2r/pp2bppp/2n1pn2/2pp4/2P5/2NPPN2/PP2BPPP/R1BQK2R w KQkq - 1 7', history: ['e4', 'c5', 'Nf3', 'd6'] },
    { id: '2', date: '2023-10-26 18:00', duration: '1h 15m', mode: 'Local Hotseat', fen: 'r4rk1/pp1n1ppp/1q1bpn2/2pp4/3P1B2/2PQPN2/PP1N1PPP/R3K2R w KQ - 3 10', history: ['d4', 'd5', 'c4', 'e6'] },
];

interface AppContextType {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  stats: Stats;
  setStats: (stats: Stats) => void;
  savedGames: SavedGame[];
  setSavedGames: (games: SavedGame[]) => void;
  t: (key: string) => string;
  currentGame: GameConfig | null;
  setCurrentGame: (config: GameConfig | null) => void;
  updatePostGameStats: (result: 'win' | 'loss' | 'draw', history: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<Settings>('strategix_settings', defaultSettings);
  const [stats, setStats] = useLocalStorage<Stats>('strategix_stats', defaultStats);
  const [savedGames, setSavedGames] = useLocalStorage<SavedGame[]>('strategix_saved_games', defaultSavedGames);
  const [currentGame, setCurrentGame] = useState<GameConfig | null>(null);

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[settings.language];
    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            return key;
        }
    }
    return result;
  };

  const updatePostGameStats = useCallback((result: 'win' | 'loss' | 'draw', history: string[]) => {
    if (currentGame?.mode !== 'ai' || !currentGame.difficulty) return;

    const newStats = { ...stats };
    
    // 1. Update counters
    newStats.played++;
    if (result === 'win') newStats.won++;
    else if (result === 'loss') newStats.lost++;
    else newStats.drawn++;
    
    // 2. Update ELO Rating
    const K = 32; // K-factor for rating calculation
    const aiRatings: Record<Difficulty, number> = {
        easy: 1200,
        medium: 1500,
        hard: 1800,
        master: 2100,
    };
    const playerRating = newStats.rating;
    const aiRating = aiRatings[currentGame.difficulty];
    
    const expectedScore = 1 / (1 + Math.pow(10, (aiRating - playerRating) / 400));
    
    let actualScore: number;
    if (result === 'win') actualScore = 1;
    else if (result === 'loss') actualScore = 0;
    else actualScore = 0.5;
    
    const newRating = playerRating + K * (actualScore - expectedScore);
    newStats.rating = Math.round(newRating);

    // 3. Update Openings
    if (history.length > 0) {
      // Use first 6 ply (3 moves per side) as the opening identifier
      const openingKey = history.slice(0, 6).join(' ');
      newStats.openings[openingKey] = (newStats.openings[openingKey] || 0) + 1;
    }
    
    setStats(newStats);

  }, [stats, setStats, currentGame]);

  return (
    <AppContext.Provider value={{ settings, setSettings, stats, setStats, savedGames, setSavedGames, t, currentGame, setCurrentGame, updatePostGameStats }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
