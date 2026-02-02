import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import JoinGameScreen from './screens/JoinGameScreen';
import CreateGameScreen from './screens/CreateGameScreen';
import LobbyScreen from './screens/LobbyScreen';
import LetterSelectionScreen from './screens/LetterSelectionScreen';
import GameplayScreen from './screens/GameplayScreen';
import ReviewScreen from './screens/ReviewScreen';
import ScoresScreen from './screens/ScoresScreen';
import SettingsScreen from './screens/SettingsScreen';

function App() {
  const { initializeSocket, playerId } = useGameStore();

  useEffect(() => {
    if (!playerId) {
      initializeSocket();
    }
  }, [playerId, initializeSocket]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/join" element={<JoinGameScreen />} />
        <Route path="/create" element={<CreateGameScreen />} />
        <Route path="/lobby" element={<LobbyScreen />} />
        <Route path="/letter-selection" element={<LetterSelectionScreen />} />
        <Route path="/gameplay" element={<GameplayScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/scores" element={<ScoresScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
