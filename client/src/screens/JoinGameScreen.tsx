import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

function JoinGameScreen() {
  const navigate = useNavigate();
  const { joinGame, game } = useGameStore();
  const [gameCode, setGameCode] = useState('');

  useEffect(() => {
    if (game?.gameCode) {
      navigate('/lobby');
    }
  }, [game, navigate]);

  const handleJoin = () => {
    if (gameCode.trim().length === 6) {
      joinGame(gameCode.toUpperCase());
    } else {
      alert('Kod gry musi mieć 6 znaków');
    }
  };

  return (
    <div className="container">
      <h1>Dołącz do gry</h1>
      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Kod gry:
          </label>
          <input
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            placeholder="Wprowadź kod gry"
            maxLength={6}
            style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '4px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleJoin} style={{ flex: 1 }}>
            Dołącz
          </button>
          <button onClick={() => navigate('/')} style={{ background: '#6c757d' }}>
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinGameScreen;
