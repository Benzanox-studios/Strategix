import React, { useEffect } from 'react';

interface IntroScreenProps {
  onFinished: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onFinished }) => {
  useEffect(() => {
    // Total animation is 6.5s (3s stage 1 + 3s stage 2 + 0.5s fade out).
    const timer = setTimeout(onFinished, 6500); 
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-brand-primary z-50 overflow-hidden intro-container">
      <div className="chess-bg" />

      {/* Studio Name */}
      <div className="absolute inset-0 flex flex-col items-center justify-center intro-studio">
          <div className="text-center">
            <h1
              className="text-7xl md:text-8xl font-black tracking-widest"
              style={{
                fontFamily: "'Arial Black', Gadget, sans-serif",
                color: 'rgba(255, 82, 82, 0.6)',
                textShadow: `
                  -2px -2px 0 #d91616, 2px -2px 0 #d91616, -2px 2px 0 #d91616, 2px 2px 0 #d91616,
                  4px 4px 2px rgba(0,0,0,0.2)
                `
              }}
            >
              BENZANOX
            </h1>
            <h2
              className="text-5xl md:text-6xl font-bold tracking-wider mt-4"
              style={{
                fontFamily: "'Arial Black', Gadget, sans-serif",
                color: '#000',
                textShadow: `
                  -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff,
                  -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000
                `
              }}
            >
              STUDIOS
            </h2>
          </div>
      </div>

      {/* Game Title */}
      <div className="absolute inset-0 flex flex-col items-center justify-center intro-title opacity-0">
         <div className="text-center">
            <h1 className="text-8xl md:text-9xl font-bold text-brand-accent tracking-wider" style={{ textShadow: '0 0 15px var(--glow-color)'}}>
                Strategix
            </h1>
         </div>
      </div>
    </div>
  );
};

export default IntroScreen;