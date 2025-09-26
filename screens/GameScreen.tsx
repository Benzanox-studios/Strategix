import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Chess, type Move as ChessJSMove } from 'chess.js';
import { Screen, Piece, PieceType, Color, Square, Move, SavedGame } from '../types';
import Button from '../components/Button';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/Card';
import Modal from '../components/Modal';

// --- AI LOGIC ---
const pieceValues: { [key in PieceType]: number } = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const pawnEvalWhite = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];
const pawnEvalBlack = pawnEvalWhite.slice().reverse();

const knightEval = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const bishopEvalWhite = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];
const bishopEvalBlack = bishopEvalWhite.slice().reverse();

const rookEvalWhite = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
];
const rookEvalBlack = rookEvalWhite.slice().reverse();

const queenEval = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

const kingEvalWhite = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
];
const kingEvalBlack = kingEvalWhite.slice().reverse();

const evaluateBoard = (game: Chess): number => {
    if (game.isCheckmate()) return game.turn() === 'w' ? -Infinity : Infinity;
    if (game.isDraw()) return 0;
    
    let totalEvaluation = 0;
    const board = game.board();

    const pawnFiles: { w: number[], b: number[] } = { w: [], b: [] };

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                if (piece.type === 'p') {
                    pawnFiles[piece.color].push(j);
                }

                const modifier = piece.color === 'w' ? 1 : -1;
                const pieceValue = pieceValues[piece.type];
                let positionalValue = 0;

                // Piece-Square Tables
                switch (piece.type) {
                    case 'p':
                        positionalValue = piece.color === 'w' ? pawnEvalWhite[i][j] : pawnEvalBlack[i][j];
                        break;
                    case 'n':
                        positionalValue = knightEval[i][j];
                        break;
                    case 'b':
                        positionalValue = piece.color === 'w' ? bishopEvalWhite[i][j] : bishopEvalBlack[i][j];
                        break;
                    case 'r':
                        positionalValue = piece.color === 'w' ? rookEvalWhite[i][j] : rookEvalBlack[i][j];
                        break;
                    case 'q':
                        positionalValue = queenEval[i][j];
                        break;
                    case 'k':
                        positionalValue = piece.color === 'w' ? kingEvalWhite[i][j] : kingEvalBlack[i][j];
                        break;
                }
                
                totalEvaluation += (pieceValue + positionalValue) * modifier;
            }
        }
    }

    // Pawn Structure Evaluation
    let pawnStructureScore = 0;
    const doubledPawnsPenalty = -15;
    const isolatedPawnPenalty = -12;

    // White pawns
    const whitePawnCounts: { [file: number]: number } = {};
    pawnFiles.w.forEach(file => {
        whitePawnCounts[file] = (whitePawnCounts[file] || 0) + 1;
    });
    for (const fileStr in whitePawnCounts) {
        const file = parseInt(fileStr, 10);
        // Doubled pawns
        if (whitePawnCounts[file] > 1) {
            pawnStructureScore += doubledPawnsPenalty * (whitePawnCounts[file] - 1);
        }
        // Isolated pawns
        if (!whitePawnCounts[file - 1] && !whitePawnCounts[file + 1]) {
            pawnStructureScore += isolatedPawnPenalty;
        }
    }

    // Black pawns
    const blackPawnCounts: { [file: number]: number } = {};
    pawnFiles.b.forEach(file => {
        blackPawnCounts[file] = (blackPawnCounts[file] || 0) + 1;
    });
    for (const fileStr in blackPawnCounts) {
        const file = parseInt(fileStr, 10);
        // Doubled pawns (good for white)
        if (blackPawnCounts[file] > 1) {
            pawnStructureScore -= doubledPawnsPenalty * (blackPawnCounts[file] - 1);
        }
        // Isolated pawns (good for white)
        if (!blackPawnCounts[file - 1] && !blackPawnCounts[file + 1]) {
            pawnStructureScore -= isolatedPawnPenalty;
        }
    }

    totalEvaluation += pawnStructureScore;

    return totalEvaluation;
};

const minimax = (gameInstance: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number => {
    if (depth === 0 || gameInstance.isGameOver()) {
        return evaluateBoard(gameInstance);
    }

    const moves = gameInstance.moves();
    
    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const tempGame = new Chess(gameInstance.fen());
            tempGame.move(move);
            const evaluation = minimax(tempGame, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) {
                break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const tempGame = new Chess(gameInstance.fen());
            tempGame.move(move);
            const evaluation = minimax(tempGame, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) {
                break;
            }
        }
        return minEval;
    }
};

// --- PIECE SVG COMPONENT ---
const PieceComponent: React.FC<{ piece: Piece; size: number | string }> = ({ piece, size }) => {
  const isWhite = piece.color === 'w';
  const fill = isWhite ? '#f8f8f8' : '#333';
  
  const pieceMap: { [key in PieceType]: React.ReactNode } = {
    p: <g fill={fill}><path d="M 22.5,38 C 30,38 31.25,36.5 31.25,35 L 31.25,32 L 13.75,32 L 13.75,35 C 13.75,36.5 15,38 22.5,38 z M 18,31 L 27,31 L 27,28 L 18,28 z M 19,27 L 26,27 C 26,24 24,22 22.5,19 C 21,22 19,24 19,27 z M 22.5,18 C 25.5,18 28,15.5 28,12.5 C 28,9.5 25.5,7 22.5,7 C 19.5,7 17,9.5 17,12.5 C 17,15.5 19.5,18 22.5,18 z" /></g>,
    r: <g fill={fill}><path d="M 9,39 H 36 V 36 H 9 Z M 12,35 V 32 H 33 V 35 Z M 14,31 V 15 H 31 V 31 Z M 11,14 V 9 H 16 V 11 H 20 V 9 H 25 V 11 H 29 V 9 H 34 V 14 Z" /></g>,
    n: <g fill={fill}><path d="M 22,10 C 28,10 31,13 31,13 C 31,13 29,17 29,20 C 29,25 32,25 32,31 L 32,34 L 14,34 L 14,31 C 14,25 17,25 17,20 C 17,17 15,13 15,13 C 15,13 18,10 22,10 z M 11.5,39 H 33.5 V 36 H 11.5 Z M 24.5,25 C 24.5,25 25.5,26 25.5,27 C 25.5,28 24.5,29 24.5,29 L 23,29 C 21,29 20.5,28 20.5,27 C 20.5,26 21.5,25 21.5,25 L 22,23 C 22,23 20,21 20,19 C 20,17.5 21,16 22.5,16 C 24.5,16 25,18 25,18 C 25,18 23.5,20.5 23,22.5 z" /></g>,
    b: <g fill={fill}><path d="M 22.5,39 C 30,39 33,37 33,34 L 33,32 L 12,32 L 12,34 C 12,37 15,39 22.5,39 z M 18,31 L 27,31 L 27,28 L 18,28 z M 19,27 C 20,24 22.5,12 22.5,12 C 22.5,12 25,24 26,27 L 19,27 z M 22.5,11 C 24.5,11 26,9.5 26,7.5 C 26,5.5 24.5,4 22.5,4 C 20.5,4 19,5.5 19,7.5 C 19,9.5 20.5,11 22.5,11 z" /></g>,
    q: <g fill={fill}><path d="M 9,39 H 36 V 35 H 9 Z M 12,34 C 12,31 15,29 22.5,29 C 30,29 33,31 33,34 L 12,34 z M 11,13 L 6,26 L 39,26 L 34,13 L 30,15 L 22.5,9 L 15,15 L 11,13 z M 6,11 A 2 2 0 1 1 6,7 A 2 2 0 0 1 6,11 z M 15,13 A 2 2 0 1 1 15,9 A 2 2 0 0 1 15,13 z M 22.5,7 A 2 2 0 1 1 22.5,3 A 2 2 0 0 1 22.5,7 z M 30,13 A 2 2 0 1 1 30,9 A 2 2 0 0 1 30,13 z M 39,11 A 2 2 0 1 1 39,7 A 2 2 0 0 1 39,11 z" /></g>,
    k: <g fill={fill}><path d="M 9,39 H 36 V 35 H 9 Z M 12,34 C 12,31 15,29 22.5,29 C 30,29 33,31 33,34 L 12,34 z M 13.5,28 L 31.5,28 C 31.5,25 29,23 26,23 L 26,19 C 28,17 28,14 22.5,12 C 17,14 17,17 19,19 L 19,23 C 16,23 13.5,25 13.5,28 z M 20.5,10.5 H 24.5 V 7 H 27 V 5 H 24.5 V 2 H 20.5 V 5 H 18 V 7 H 20.5 V 10.5 z" /></g>,
  };

  return <svg viewBox="0 0 45 45" width={size} height={size}>{pieceMap[piece.type]}</svg>;
};

// --- MOVE HISTORY COMPONENT ---
const MoveHistory: React.FC<{ 
    history: ChessJSMove[];
    currentMoveIndex: number;
    onSelectMove: (index: number) => void;
}> = ({ history, currentMoveIndex, onSelectMove }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history.length]);

    const pairedHistory: (ChessJSMove | null)[][] = [];
    for (let i = 0; i < history.length; i += 2) {
        pairedHistory.push([history[i], history[i+1] || null]);
    }
    
    return (
        <Card>
            <h2 className="text-xl font-bold text-brand-accent mb-2 text-center">Move History</h2>
            <div ref={scrollRef} className="max-h-56 overflow-y-auto bg-brand-primary rounded-md p-2 text-lg">
                {pairedHistory.length === 0 ? (
                    <p className="text-brand-text-dim text-center italic">No moves yet.</p>
                ) : (
                    <ol className="space-y-1">
                        {pairedHistory.map((pair, i) => {
                            const moveNumber = i + 1;
                            const whiteMoveIndex = i * 2;
                            const blackMoveIndex = i * 2 + 1;
                            return (
                                <li key={moveNumber} className="grid grid-cols-[2rem_1fr_1fr] items-baseline gap-x-2">
                                    <span className="text-brand-text-dim text-right">{moveNumber}.</span>
                                    {pair[0] && (
                                        <button 
                                            onClick={() => onSelectMove(whiteMoveIndex)} 
                                            className={`text-left px-2 py-0.5 rounded ${currentMoveIndex === whiteMoveIndex ? 'bg-brand-accent text-brand-primary font-bold' : 'hover:bg-brand-secondary'}`}
                                        >
                                            {pair[0].san}
                                        </button>
                                    )}
                                    {pair[1] && (
                                        <button 
                                            onClick={() => onSelectMove(blackMoveIndex)} 
                                            className={`text-left px-2 py-0.5 rounded ${currentMoveIndex === blackMoveIndex ? 'bg-brand-accent text-brand-primary font-bold' : 'hover:bg-brand-secondary'}`}
                                        >
                                            {pair[1].san}
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>
        </Card>
    );
};


// --- BOARD & UI COMPONENTS ---
const Board: React.FC<{
  board: (Piece | null)[][];
  onSquareClick: (square: Square) => void;
  selectedSquare: Square | null;
  legalMoves: string[];
  lastMove: { from: Square; to: Square } | null;
  isFlipped: boolean;
  bestMoveHint: { from: Square; to: Square } | null;
}> = ({ board, onSquareClick, selectedSquare, legalMoves, lastMove, isFlipped, bestMoveHint }) => {
  const ranks = isFlipped ? ['1','2','3','4','5','6','7','8'] : ['8','7','6','5','4','3','2','1'];
  const files = isFlipped ? ['h','g','f','e','d','c','b','a'] : ['a','b','c','d','e','f','g','h'];
  
  const legalMoveSet = useMemo(() => new Set(legalMoves), [legalMoves]);
  
  return (
    <div className="aspect-square bg-[var(--board-bg)] grid grid-cols-8 grid-rows-8 shadow-xl">
      {ranks.map((rank, r) =>
        files.map((file, f) => {
          const square = `${file}${rank}` as Square;
          const piece = board[isFlipped ? 7 - r : r][isFlipped ? 7 - f : f];
          const isLight = (r + f) % 2 === 0;
          const isSelected = square === selectedSquare;
          const isLegalMove = legalMoveSet.has(square);
          const isLastMove = lastMove && (square === lastMove.from || square === lastMove.to);
          const isBestMoveHint = bestMoveHint && (square === bestMoveHint.from || square === bestMoveHint.to);

          return (
            <div
              key={square}
              onClick={() => onSquareClick(square)}
              className={`relative flex items-center justify-center cursor-pointer ${ isLight ? 'bg-[var(--square-light)]' : 'bg-[var(--square-dark)]' }`}
            >
              {isLastMove && <div className={`absolute inset-0 ${isLight ? 'bg-[var(--square-highlight-light)]' : 'bg-[var(--square-highlight-dark)]'}`} />}
              {isSelected && <div className={`absolute inset-0 ring-4 ring-inset ring-green-500/70`} />}
              {isBestMoveHint && <div className={`absolute inset-0 ring-4 ring-inset ring-green-400 hint-pulse`} />}

              {isLegalMove && !piece && (
                <div className="absolute w-1/3 h-1/3 bg-black bg-opacity-20 rounded-full"></div>
              )}
              {isLegalMove && piece && (
                 <div className="absolute inset-0 border-8 border-black border-opacity-20 rounded-md"></div>
              )}

              {piece && <PieceComponent piece={piece} size="100%" />}
              
              { f === 0 && <span className={`absolute left-1 top-0 text-xs font-bold ${isLight ? 'text-[var(--square-dark)]' : 'text-[var(--square-light)]'}`}>{rank}</span> }
              { r === 7 && <span className={`absolute right-1 bottom-0 text-xs font-bold ${isLight ? 'text-[var(--square-dark)]' : 'text-[var(--square-light)]'}`}>{file}</span> }
            </div>
          );
        })
      )}
    </div>
  );
};


interface GameScreenProps {
  navigateTo: (screen: Screen) => void;
}

const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (hours > 0) {
        return `${String(hours)}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${paddedMinutes}:${paddedSeconds}`;
};

const GameScreen: React.FC<GameScreenProps> = ({ navigateTo }) => {
  const { currentGame, setCurrentGame, savedGames, setSavedGames, updatePostGameStats } = useAppContext();
  const [game, setGame] = useState(() => {
    const g = new Chess();
    if (currentGame) {
      if (currentGame.history && currentGame.history.length > 0) {
        for (const san of currentGame.history) {
          try {
            g.move(san);
          } catch (e) {
            console.error(`Error replaying move "${san}" from history.`, e);
            if (currentGame.fen) {
              console.log('Falling back to loading FEN.');
              try {
                const fallbackGame = new Chess();
                fallbackGame.load(currentGame.fen);
                return fallbackGame;
              } catch (fenError) {
                console.error('Fallback to FEN also failed.', fenError);
                return new Chess();
              }
            }
            return new Chess();
          }
        }
      } else if (currentGame.fen) {
        try {
          g.load(currentGame.fen);
        } catch (e) {
          console.error("Failed to load FEN.", e);
        }
      }
    }
    return g;
  });

  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [promotionMove, setPromotionMove] = useState<Move | null>(null);
  const [bestMoveHint, setBestMoveHint] = useState<{ from: Square; to: Square } | null>(null);
  const [viewIndex, setViewIndex] = useState<number>(game.history().length - 1);
  const [isSaved, setIsSaved] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [statsUpdated, setStatsUpdated] = useState(false);
  
  const history = useMemo(() => game.history({ verbose: true }), [game]);
  
  const displayedGame = useMemo(() => {
      if (viewIndex === history.length - 1) {
          return game;
      }
      const tempGame = new Chess();
      history.slice(0, viewIndex + 1).forEach(move => {
          tempGame.move(move.san);
      });
      return tempGame;
  }, [game, history, viewIndex]);

  const moveNumber = Math.floor(displayedGame.history().length / 2) + 1;

  const board = displayedGame.board();
  const legalMoves = useMemo(() => {
    if (selectedSquare) {
      if (viewIndex !== history.length - 1) return [];
      return game.moves({ square: selectedSquare, verbose: true }).map(m => m.to);
    }
    return [];
  }, [selectedSquare, game, viewIndex, history.length]);

  const lastMove = useMemo(() => {
      const last = displayedGame.history({ verbose: true }).slice(-1)[0];
      return last ? { from: last.from, to: last.to } : null;
  }, [displayedGame]);

  const gameOver = useMemo(() => {
      if (game.isGameOver()) {
        let status = '';
        let winner: Color | undefined = undefined;
        if (game.isCheckmate()) {
            status = 'Checkmate!';
            winner = game.turn() === 'w' ? 'b' : 'w';
        } else if (game.isStalemate()) {
            status = 'Stalemate!';
        } else if (game.isThreefoldRepetition()) {
            status = 'Draw by Threefold Repetition!';
        } else if (game.isInsufficientMaterial()) {
            status = 'Draw by Insufficient Material!';
        } else if (game.isDraw()) {
            status = 'Draw!';
        }
        return { status, winner };
      }
      return null;
  }, [game]);
  
  useEffect(() => {
    if (gameOver && !statsUpdated) {
        if (currentGame?.mode === 'ai') {
            let result: 'win' | 'loss' | 'draw';
            if (!gameOver.winner) {
                result = 'draw';
            } else {
                result = gameOver.winner === playerColor ? 'win' : 'loss';
            }
            updatePostGameStats(result, game.history());
        }
        setStatsUpdated(true);
    }
  }, [gameOver, statsUpdated, currentGame, playerColor, game, updatePostGameStats]);

  // Game Timer
  useEffect(() => {
    const isLive = viewIndex === history.length - 1 && !gameOver;

    if (isLive) {
        const intervalId = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }
  }, [viewIndex, history.length, gameOver]);

  const getDifficultyDepth = useCallback((gameInstance: Chess) => {
    const difficulty = currentGame?.difficulty || 'medium';
    const pieces = gameInstance.board().flat().filter(p => p !== null).length;

    switch (difficulty) {
        case 'easy': 
            return 1;
        case 'medium': 
            return pieces <= 14 ? 3 : 2;
        case 'hard': 
            return pieces <= 12 ? 4 : 3;
        case 'master': 
            return 4;
        default:
            return 2;
    }
  }, [currentGame?.difficulty]);
  
  const getRankedMoves = useCallback((gameInstance: Chess, depth: number): { move: string; score: number }[] => {
    const moves = gameInstance.moves();
    if (moves.length === 0) return [];

    const isMaximizingPlayer = gameInstance.turn() === 'w';

    const movesWithScores = moves.map(move => {
        // Create a new instance for each move to prevent state corruption
        const tempGame = new Chess(gameInstance.fen());
        tempGame.move(move);
        const score = minimax(tempGame, depth - 1, -Infinity, Infinity, !isMaximizingPlayer);
        return { move, score };
    });

    movesWithScores.sort((a, b) => {
        return isMaximizingPlayer ? b.score - a.score : a.score - b.score;
    });

    return movesWithScores;
  }, []);

  const selectMoveFromRanked = useCallback((rankedMoves: {move: string, score: number}[]): string | null => {
    const difficulty = currentGame?.difficulty || 'medium';
    if (!rankedMoves.length) return null;

    const bestMove = rankedMoves[0];

    switch (difficulty) {
        case 'master':
            return bestMove.move;
        
        case 'hard':
            if (rankedMoves.length > 1) {
                const secondBestMove = rankedMoves[1];
                const scoreDifference = Math.abs(bestMove.score - secondBestMove.score);
                if (scoreDifference < 50 && Math.random() < 0.15) {
                    return secondBestMove.move;
                }
            }
            return bestMove.move;

        case 'medium': {
            const scoreThreshold = 100;
            const goodMoves = rankedMoves.filter(
                move => Math.abs(bestMove.score - move.score) < scoreThreshold
            );
            const randomIndex = Math.floor(Math.random() * goodMoves.length);
            return goodMoves[randomIndex].move;
        }

        case 'easy': {
            const scoreThreshold = 250; 
            const acceptableMoves = rankedMoves.filter(
                move => Math.abs(bestMove.score - move.score) < scoreThreshold
            );
            if (acceptableMoves.length === 0) return bestMove.move;
            const randomIndex = Math.floor(Math.pow(Math.random(), 2) * acceptableMoves.length);
            return acceptableMoves[randomIndex].move;
        }
        
        default:
            return bestMove.move;
    }
  }, [currentGame?.difficulty]);

  const makeMove = useCallback((move: Move | string) => {
    // To prevent state mutation issues with chess.js, we create a new game instance
    // based on the history up to the point of the new move.
    const baseGame = new Chess();
    const movesToReplay = (viewIndex !== history.length - 1)
        ? history.slice(0, viewIndex + 1).map(m => m.san)
        : game.history();
    
    movesToReplay.forEach(san => baseGame.move(san));

    try {
        const moveResult = baseGame.move(move);
        if (moveResult) {
            setGame(baseGame); // baseGame is a new instance, ensuring a proper state update.
            setSelectedSquare(null);
            setBestMoveHint(null);
            return true;
        }
    } catch(e) {
        // This can happen if the move is illegal for some reason.
        return false;
    }
    return false;
  }, [game, history, viewIndex]);

  const makeAIMove = useCallback(() => {
    if (currentGame?.mode === 'ai' && game.turn() !== playerColor && !game.isGameOver()) {
        const timer = setTimeout(() => {
            const gameInstance = new Chess(game.fen());
            const depth = getDifficultyDepth(gameInstance);
            const rankedMoves = getRankedMoves(gameInstance, depth);
            const move = selectMoveFromRanked(rankedMoves);
            if (move) {
                makeMove(move);
            }
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [game, playerColor, currentGame?.mode, getDifficultyDepth, getRankedMoves, selectMoveFromRanked, makeMove]);

  useEffect(() => {
    setViewIndex(game.history().length - 1);
  }, [game]);
  
  useEffect(() => {
    if (!currentGame) {
      navigateTo('main');
      return;
    }
    
    let pColor: Color = 'w';
    if (currentGame.mode === 'ai') {
        if (currentGame.playerColor === 'white') pColor = 'w';
        else if (currentGame.playerColor === 'black') pColor = 'b';
        else pColor = Math.random() < 0.5 ? 'w' : 'b';
    }
    setPlayerColor(pColor);
    setIsFlipped(pColor === 'b');

    if (currentGame.mode === 'ai' && game.turn() !== pColor) {
      makeAIMove();
    }
  }, []);

  useEffect(() => {
    const isViewingHistory = viewIndex !== game.history().length - 1;
    if (!isViewingHistory) {
      makeAIMove();
    }
  }, [game, viewIndex, makeAIMove]);
  
  useEffect(() => {
    const isViewingHistory = viewIndex !== game.history().length - 1;
    if (currentGame?.hints && !game.isGameOver() && !isViewingHistory && (currentGame.mode === 'local' || game.turn() === playerColor)) {
      const tempGame = new Chess(game.fen());
      const depth = getDifficultyDepth(tempGame);
      const rankedMoves = getRankedMoves(tempGame, depth);
      if(rankedMoves.length > 0) {
        const bestMove = rankedMoves[0].move;
        const moveDetails = tempGame.move(bestMove);
        if(moveDetails) {
            setBestMoveHint({ from: moveDetails.from, to: moveDetails.to });
        }
      }
    } else {
        setBestMoveHint(null);
    }
  }, [game, viewIndex, currentGame?.hints, playerColor, currentGame?.mode, getRankedMoves, getDifficultyDepth]);


  const onSquareClick = (square: Square) => {
    if (gameOver) return;
    
    const isPlayersTurn = (currentGame?.mode === 'ai' && displayedGame.turn() === playerColor) || currentGame?.mode !== 'ai';
    if (!isPlayersTurn && viewIndex === history.length - 1) return;

    if (selectedSquare) {
      const move: Move = { from: selectedSquare, to: square };
      const piece = displayedGame.get(selectedSquare);

      const isPromotion = piece?.type === 'p' && (
          (piece.color === 'w' && selectedSquare.endsWith('7') && square.endsWith('8')) ||
          (piece.color === 'b' && selectedSquare.endsWith('2') && square.endsWith('1'))
      );

      if (isPromotion) {
          const legalMovesForSquare = displayedGame.moves({ square: selectedSquare, verbose: true });
          if (legalMovesForSquare.some(m => m.to === square)) {
              setPromotionMove(move);
              return;
          }
      }

      if (!makeMove(move)) {
        const newPiece = displayedGame.get(square);
        if (newPiece && newPiece.color === displayedGame.turn()) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      }
    } else {
      const piece = displayedGame.get(square);
      if (piece && piece.color === displayedGame.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const handlePromotion = (piece: PieceType) => {
    if (promotionMove) {
      makeMove({ ...promotionMove, promotion: piece });
      setPromotionMove(null);
    }
  };
  
  const handleNewGame = () => {
    if (!currentGame) return;
    const newConfig = {...currentGame};
    delete newConfig.fen; 
    delete newConfig.history;
    
    setCurrentGame(newConfig);
    navigateTo('play'); 
    setTimeout(() => navigateTo('game'), 50);
  }
  
  const handleExit = () => {
      setCurrentGame(null);
      navigateTo('main');
  }

  const handleSaveGame = useCallback(() => {
    if (!currentGame) return;

    const getModeString = () => {
        if (currentGame.mode === 'local') return 'Local Hotseat';
        if (currentGame.mode === 'tutorial') return 'Tutorial';
        if (currentGame.mode === 'ai') {
            if (currentGame.difficulty) {
                const diff = currentGame.difficulty.charAt(0).toUpperCase() + currentGame.difficulty.slice(1);
                return `vs AI (${diff})`;
            }
            return 'vs AI';
        }
        return 'Game';
    };

    const newSave: SavedGame = {
        id: new Date().toISOString(),
        date: new Date().toLocaleString(),
        duration: formatTime(elapsedTime),
        mode: getModeString(),
        fen: game.fen(),
        history: game.history(),
    };

    setSavedGames([newSave, ...savedGames]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, [currentGame, game, savedGames, setSavedGames, elapsedTime]);
  
  const handleUndo = useCallback(() => {
    if (viewIndex !== history.length - 1 || !!gameOver || history.length === 0) return;
  
    // Create a new instance with the full history to avoid mutation.
    const gameCopy = new Chess();
    game.history().forEach(san => gameCopy.move(san));
  
    // In AI mode, undo both the player's and AI's last move.
    const movesToUndo = currentGame?.mode === 'ai' ? 2 : 1;
  
    // Ensure there are enough moves to undo.
    if (gameCopy.history().length < movesToUndo) return;
    
    for (let i = 0; i < movesToUndo; i++) {
      gameCopy.undo();
    }
    
    setGame(gameCopy);
    setSelectedSquare(null);
    setBestMoveHint(null);
  }, [game, currentGame?.mode, viewIndex, history.length, gameOver]);


  if (!currentGame) return null;

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 w-full">
      <div className="w-full max-w-[calc(100vh-12rem)] md:max-w-lg lg:max-w-xl">
        <Board
          board={board}
          onSquareClick={onSquareClick}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          isFlipped={isFlipped}
          bestMoveHint={bestMoveHint}
        />
      </div>
      <div className="w-full max-w-sm lg:w-64 flex flex-col gap-4">
        <Card>
            <div className="flex justify-between items-baseline mb-2">
                <h2 className="text-2xl font-bold text-brand-accent">
                    {displayedGame.turn() === 'w' ? "White's Turn" : "Black's Turn"}
                </h2>
                <span className="text-lg text-brand-text-dim">
                    Move {moveNumber}
                </span>
            </div>
            <div className="text-center text-4xl font-mono tracking-widest text-brand-text my-2 p-2 bg-brand-primary rounded-lg">
                {formatTime(elapsedTime)}
            </div>
            {displayedGame.inCheck() && <p className="text-red-400 font-bold text-lg mb-2">Check!</p>}
            <div className="mt-4 space-y-2">
                <Button onClick={handleSaveGame} disabled={isSaved}>
                    {isSaved ? 'Game Saved!' : 'Save Game'}
                </Button>
                <Button
                  onClick={handleUndo}
                  disabled={
                    history.length === 0 ||
                    viewIndex !== history.length - 1 ||
                    (currentGame?.mode === 'ai' && game.turn() !== playerColor) ||
                    !!gameOver
                  }
                >
                    Undo Move
                </Button>
                <Button onClick={handleNewGame}>New Game</Button>
                <Button onClick={handleExit} variant="secondary">Exit to Menu</Button>
            </div>
        </Card>
        <MoveHistory 
            history={history}
            currentMoveIndex={viewIndex}
            onSelectMove={setViewIndex}
        />
      </div>

      <Modal isOpen={!!gameOver} onClose={() => {}} title="Game Over">
          <div className="text-center">
              <h3 className="text-3xl font-bold mb-4">{gameOver?.status}</h3>
              {gameOver?.winner && <p className="text-xl mb-6">{gameOver.winner === 'w' ? 'White' : 'Black'} wins!</p>}
              <div className="flex gap-4">
                  <Button onClick={handleExit} variant="secondary">Main Menu</Button>
                  <Button onClick={handleNewGame}>Play Again</Button>
              </div>
          </div>
      </Modal>
      
      <Modal isOpen={!!promotionMove} onClose={() => setPromotionMove(null)} title="Promote Pawn">
          <div className="flex justify-around p-4">
              {(['q', 'r', 'b', 'n'] as PieceType[]).map(p => (
                  <div key={p} className="cursor-pointer hover:bg-brand-primary rounded-md p-2" onClick={() => handlePromotion(p)}>
                      <PieceComponent piece={{type: p, color: displayedGame.turn()}} size="60px" />
                  </div>
              ))}
          </div>
      </Modal>
    </div>
  );
};

export default GameScreen;