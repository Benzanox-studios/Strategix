

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Screen, Language } from './types';
import MainMenu from './screens/MainMenu';
import PlayMenu from './screens/PlayMenu';
import LoadGameMenu from './screens/LoadGameMenu';
import StatsMenu from './screens/StatsMenu';
import SettingsMenu from './screens/SettingsMenu';
import HelpMenu from './screens/HelpMenu';
import GameScreen from './screens/GameScreen';
import IntroScreen from './screens/IntroScreen';
import { useAppContext } from './contexts/AppContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import TermsAndConditionsModal from './screens/TermsAndConditionsModal';

const MUSIC_URL = 'https://drive.google.com/uc?export=download&id=1WuJzNRDbjgc2oc3UnYGwPDy54qLue04M';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [introFinished, setIntroFinished] = useState(false);
  const { settings, setSettings } = useAppContext();
  const [termsAccepted, setTermsAccepted] = useLocalStorage('strategix_terms_accepted', false);
  const [initialLanguageSet, setInitialLanguageSet] = useLocalStorage('strategix_initial_language_set', false);
  const musicPlayer = useRef<HTMLAudioElement | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // This effect will run once to set up a global interaction listener.
  // This is a robust way to handle browser autoplay policies, which prevent
  // audio from playing until the user clicks, taps, or presses a key.
  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserInteracted(true);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      // Cleanup if the component were to unmount, though the App component won't.
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);


  // Initialize and control background music
  useEffect(() => {
    if (!musicPlayer.current) {
      musicPlayer.current = new Audio(MUSIC_URL);
      musicPlayer.current.crossOrigin = "anonymous"; // Helps with potential CORS issues from Google Drive
      musicPlayer.current.loop = true;
      musicPlayer.current.volume = 0.3; // A comfortable background volume
    }

    // We can only play audio after the user has interacted with the page.
    if (settings.music && userInteracted) {
      musicPlayer.current.play().catch(error => {
        // Log error if playback fails for reasons other than autoplay, which is now handled.
        console.error("Music playback failed:", error);
      });
    } else {
      musicPlayer.current.pause();
    }
  }, [settings.music, userInteracted]);


  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
  }, [settings.theme]);

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);
  
  const handleLanguageSelect = (language: Language) => {
    setSettings({ ...settings, language });
    setInitialLanguageSet(true);
  };
  
  const handleAcceptTerms = () => {
    setTermsAccepted(true);
  };

  const handleDeclineTerms = () => {
    setInitialLanguageSet(false);
  };

  if (!introFinished) {
    return <IntroScreen onFinished={() => setIntroFinished(true)} />;
  }
  
  if (!termsAccepted) {
    if (!initialLanguageSet) {
      return <LanguageSelectionScreen onLanguageSelect={handleLanguageSelect} />;
    } else {
      return <TermsAndConditionsModal onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />;
    }
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainMenu navigateTo={navigateTo} />;
      case 'play':
        return <PlayMenu navigateTo={navigateTo} />;
      case 'load':
        return <LoadGameMenu navigateTo={navigateTo} />;
      case 'stats':
        return <StatsMenu navigateTo={navigateTo} />;
      case 'settings':
        return <SettingsMenu navigateTo={navigateTo} />;
      case 'help':
        return <HelpMenu navigateTo={navigateTo} />;
      case 'game':
        return <GameScreen navigateTo={navigateTo} />;
      default:
        return <MainMenu navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
