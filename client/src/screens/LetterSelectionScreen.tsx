import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

function LetterSelectionScreen() {
  const navigate = useNavigate();
  const { game, playerId, randomizeLetter } = useGameStore();
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const getPlayerName = (pId: string) => {
    return game?.playerNames?.[pId] || `Gracz ${pId.slice(0, 8)}`;
  };

  useEffect(() => {
    if (!game) {
      navigate('/');
      return;
    }

    if (game.status === 'playing') {
      navigate('/gameplay');
    } else if (game.status === 'finished') {
      navigate('/scores');
    }
  }, [game, navigate]);

  useEffect(() => {
    if (game?.currentLetter && countdown === null && game.status === 'letter_selection') {
      setCountdown(3);
    } else if (!game?.currentLetter) {
      setCountdown(null);
    }
  }, [game?.currentLetter, game?.status]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const canSelectLetter = game?.currentLetterSelector === playerId && !game.currentLetter;

  const handleRandomize = () => {
    if (!canSelectLetter) return;
    randomizeLetter();
  };

  if (!game) return null;

  return (
    <div className="container">
      <h1>Losowanie literki</h1>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ fontSize: '18px', marginBottom: '16px' }}>
            {canSelectLetter
              ? 'Twoja kolej! Wylosuj literkę'
              : `Czekaj na gracza ${getPlayerName(game.currentLetterSelector || '')}...`}
          </p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Runda {game.currentRound} z {game.rounds}
          </p>
        </div>

        {!game.currentLetter && (
          <div style={{ textAlign: 'center' }}>
            {canSelectLetter ? (
              <button onClick={handleRandomize} style={{ width: '100%' }}>
                Wylosuj literkę
              </button>
            ) : (
              <p>Czekaj na wylosowanie literki przez gracza {getPlayerName(game.currentLetterSelector || '')}...</p>
            )}
          </div>
        )}

        {game.currentLetter && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '72px', 
              fontWeight: 'bold', 
              color: '#667eea',
              padding: '32px',
              background: '#e3f2fd',
              borderRadius: '16px',
              display: 'inline-block',
              minWidth: '120px',
              marginBottom: '24px'
            }}>
              {game.currentLetter}
            </div>
            {countdown !== null && countdown > 0 && (
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#28a745',
                marginBottom: '16px'
              }}>
                {countdown}
              </div>
            )}
            {countdown === null && (
              <p>Rozpoczynanie rundy...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LetterSelectionScreen;
