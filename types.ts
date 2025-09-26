export type Screen = 'main' | 'play' | 'load' | 'stats' | 'settings' | 'help' | 'game';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'tr';
export type Theme = 'dark' | 'light';
export type AnimationSpeed = 'fast' | 'normal' | 'slow';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'master';
export type PieceColor = 'white' | 'black' | 'random';

// --- Chess Engine Types ---
export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export interface Piece {
  type: PieceType;
  color: Color;
}
export type Square =
  'a1' | 'b1' | 'c1' | 'd1' | 'e1' | 'f1' | 'g1' | 'h1' |
  'a2' | 'b2' | 'c2' | 'd2' | 'e2' | 'f2' | 'g2' | 'h2' |
  'a3' | 'b3' | 'c3' | 'd3' | 'e3' | 'f3' | 'g3' | 'h3' |
  'a4' | 'b4' | 'c4' | 'd4' | 'e4' | 'f4' | 'g4' | 'h4' |
  'a5' | 'b5' | 'c5' | 'd5' | 'e5' | 'f5' | 'g5' | 'h5' |
  'a6' | 'b6' | 'c6' | 'd6' | 'e6' | 'f6' | 'g6' | 'h6' |
  'a7' | 'b7' | 'c7' | 'd7' | 'e7' | 'f7' | 'g7' | 'h7' |
  'a8' | 'b8' | 'c8' | 'd8' | 'e8' | 'f8' | 'g8' | 'h8' ;

export interface Move {
    from: Square;
    to: Square;
    promotion?: PieceType;
}

export type BoardState = (Piece | null)[][];
// --- End Chess Engine Types ---


export interface Settings {
  language: Language;
  sound: boolean;
  music: boolean;
  theme: Theme;
  animationSpeed: AnimationSpeed;
}

export interface Stats {
  played: number;
  won: number;
  lost: number;
  drawn: number;
  openings: { [key: string]: number };
  rating: number;
}

export interface SavedGame {
  id: string;
  date: string;
  duration: string;
  mode: string;
  fen: string;
  history: string[];
}

export interface GameConfig {
    mode: 'ai' | 'local' | 'tutorial';
    difficulty?: Difficulty;
    playerColor?: PieceColor;
    fen?: string;
    history?: string[];
    hints?: boolean;
}