import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

function ScoresScreen() {
  const navigate = useNavigate();
  const { game, scores, getScores } = useGameStore();
  
  const getPlayerName = (pId: string) => {
    return game?.playerNames?.[pId] || `Gracz ${pId.slice(0, 8)}`;
  };

  useEffect(() => {
    if (!game) {
      navigate('/');
      return;
    }

    getScores();
  }, [game, getScores, navigate]);

  useEffect(() => {
    if (game?.status === 'finished') {
      getScores();
    }
  }, [game?.status, getScores]);

  if (!game || !scores) return null;

  const sortedPlayers = [...scores.players].sort((a, b) => {
    return (scores.scores[b] || 0) - (scores.scores[a] || 0);
  });

  const winner = scores.isFinished ? sortedPlayers[0] : null;

  return (
    <div className="container">
      <h1>Tabela wyników</h1>
      <div className="card">
        {!scores.isFinished && (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '18px' }}>
              Runda {scores.currentRound} z {scores.totalRounds}
            </p>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Miejsce</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Gracz</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Punkty</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((playerId, index) => (
              <tr
                key={playerId}
                style={{
                  background: winner === playerId ? '#fff3cd' : index % 2 === 0 ? '#fff' : '#f8f9fa'
                }}
              >
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  {index + 1}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  {winner === playerId && '👑 '}
                  {playerId === game.creatorId && '⭐ '}
                  {getPlayerName(playerId)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontWeight: '600' }}>
                  {scores.scores[playerId] || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: '12px' }}>
          {scores.isFinished ? (
            <>
              <button onClick={() => navigate('/')} style={{ flex: 1 }}>
                Wyjdź
              </button>
              <button
                onClick={() => {
                  // TODO: Implementacja "graj ponownie"
                  navigate('/');
                }}
                style={{ flex: 1 }}
              >
                Graj ponownie
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/gameplay')} style={{ width: '100%' }}>
              Wróć
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScoresScreen;
