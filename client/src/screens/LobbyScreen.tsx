import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

function LobbyScreen() {
  const navigate = useNavigate();
  const { game, playerId, toggleReady, startGame } = useGameStore();
  
  const getPlayerName = (pId: string) => {
    if (pId === playerId) return 'Ty';
    return game?.playerNames?.[pId] || `Gracz ${pId.slice(0, 8)}`;
  };

  useEffect(() => {
    if (!game) {
      navigate('/');
      return;
    }

    if (game.status === 'letter_selection') {
      navigate('/letter-selection');
    } else if (game.status === 'playing') {
      navigate('/gameplay');
    } else if (game.status === 'reviewing') {
      navigate('/review');
    }
  }, [game, navigate]);

  const handleCopyCode = () => {
    if (game?.gameCode) {
      navigator.clipboard.writeText(game.gameCode);
      alert('Kod skopiowany!');
    }
  };

  const isCreator = game?.creatorId === playerId;
  const otherPlayersReady = game ? game.players.filter(p => p !== game.creatorId && game.playerReady[p]).length : 0;
  const canStart = otherPlayersReady >= 1 && game && game.players.length >= 2;

  if (!game) return null;

  return (
    <div className="container">
      <h1>Poczekalnia</h1>
      <div className="card">
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Kod pokoju:
          </label>
          <div
            onClick={handleCopyCode}
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '8px',
              padding: '16px',
              background: '#f8f9fa',
              borderRadius: '8px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            {game.gameCode}
          </div>
          <small style={{ color: '#666' }}>Kliknij aby skopiować</small>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Gracze:</h3>
          {game.players.map((pId) => (
            <div
              key={pId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                marginBottom: '8px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}
            >
              <span>
                {pId === game.creatorId ? '👑 ' : ''}
                {getPlayerName(pId)}
              </span>
              <span style={{ color: game.playerReady[pId] ? '#28a745' : '#dc3545' }}>
                {game.playerReady[pId] ? '✓ Gotowy' : '✗ Nie gotowy'}
              </span>
            </div>
          ))}
        </div>

        {isCreator ? (
          <div>
            <button
              onClick={startGame}
              disabled={!canStart}
              style={{ width: '100%', marginBottom: '12px' }}
            >
              Rozpocznij grę
            </button>
            {!canStart && (
              <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
                Czekam na gotowość co najmniej jednego gracza
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={toggleReady}
            style={{
              width: '100%',
              background: game.playerReady[playerId || ''] ? '#28a745' : '#667eea'
            }}
          >
            {game.playerReady[playerId || ''] ? 'Nie gotowy' : 'Gotowy'}
          </button>
        )}
      </div>
    </div>
  );
}

export default LobbyScreen;
