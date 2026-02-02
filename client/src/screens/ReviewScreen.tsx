import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

function ReviewScreen() {
  const navigate = useNavigate();
  const { game, playerId, reviewAnswer, readyForNextRound } = useGameStore();
  const [reviews, setReviews] = useState<Record<string, Record<string, { isValid: boolean | null; isUnique: boolean | null }>>>({});
  
  const getPlayerName = (pId: string) => {
    if (pId === playerId) return 'Ty';
    return game?.playerNames?.[pId] || `Gracz ${pId.slice(0, 8)}`;
  };

  useEffect(() => {
    if (!game) {
      navigate('/');
      return;
    }

    if (game.status === 'playing') {
      navigate('/gameplay');
    } else if (game.status === 'letter_selection') {
      navigate('/letter-selection');
    } else if (game.status === 'finished') {
      navigate('/scores');
    }

    // Inicjalizuj recenzje i synchronizuj z game.reviews
    const existingReviews = game.reviews[playerId || ''];
    if (existingReviews && Object.keys(existingReviews).length > 0) {
      setReviews(existingReviews);
    } else {
      const initialReviews: Record<string, Record<string, { isValid: boolean | null; isUnique: boolean | null }>> = {};
      
      game.players.forEach(p => {
        if (p !== playerId) {
          initialReviews[p] = {};
          game.categories.forEach(cat => {
            const answer = game.answers[p]?.[cat];
            const hasAnswer = answer && answer.trim() !== '';
            initialReviews[p][cat] = { 
              isValid: hasAnswer ? true : false, 
              isUnique: null 
            };
          });
        }
      });
      
      setReviews(initialReviews);
      
      // Automatycznie zapisz domyślne recenzje
      game.players.forEach(p => {
        if (p !== playerId) {
          game.categories.forEach(cat => {
            const answer = game.answers[p]?.[cat];
            const hasAnswer = answer && answer.trim() !== '';
            if (hasAnswer) {
              reviewAnswer(p, cat, true, null);
            }
          });
        }
      });
    }
  }, [game, navigate, playerId, reviewAnswer]);
  
  useEffect(() => {
    if (game?.reviews[playerId || '']) {
      setReviews(game.reviews[playerId || '']);
    }
  }, [game?.reviews, playerId]);

  const handleReview = (reviewedPlayerId: string, category: string, type: 'isValid' | 'isUnique', value: boolean | null) => {
    const newReviews = { ...reviews };
    if (!newReviews[reviewedPlayerId]) {
      newReviews[reviewedPlayerId] = {};
    }
    if (!newReviews[reviewedPlayerId][category]) {
      newReviews[reviewedPlayerId][category] = { isValid: null, isUnique: null };
    }

    if (type === 'isValid') {
      newReviews[reviewedPlayerId][category].isValid = value;
      // Jeśli niepoprawne, automatycznie nie może być unikalne
      if (value === false) {
        newReviews[reviewedPlayerId][category].isUnique = false;
      }
    } else {
      newReviews[reviewedPlayerId][category].isUnique = value;
      // Jeśli unikalne, automatycznie poprawne
      if (value === true) {
        newReviews[reviewedPlayerId][category].isValid = true;
      }
    }

    setReviews(newReviews);
    reviewAnswer(reviewedPlayerId, category, newReviews[reviewedPlayerId][category].isValid, newReviews[reviewedPlayerId][category].isUnique);
  };

  const getAnswer = (playerId: string, category: string) => {
    return game?.answers[playerId]?.[category] || '';
  };

  const calculatePoints = (reviewedPlayerId: string, category: string): number => {
    if (!game) return 0;
    
    const answer = getAnswer(reviewedPlayerId, category);
    if (!answer || answer.trim() === '') {
      return 0;
    }

    const categoryScores = { valid: 0, unique: 0 };
    const totalReviewers = game.players.length - 1;

    Object.keys(game.reviews).forEach(reviewerId => {
      if (reviewerId === reviewedPlayerId) return;
      
      const review = game.reviews[reviewerId]?.[reviewedPlayerId]?.[category];
      if (review) {
        if (review.isValid === true) {
          categoryScores.valid++;
        }
        if (review.isUnique === true) {
          categoryScores.unique++;
        }
      }
    });

    const majority = Math.ceil(totalReviewers / 2);
    
    if (categoryScores.valid >= majority) {
      if (categoryScores.unique >= majority) {
        return 10;
      }
      return 5;
    }
    
    return 0;
  };

  const isReady = game?.roundReady[playerId || ''] || false;
  const readyCount = game?.players.filter(p => game.roundReady[p]).length || 0;
  const totalPlayers = game?.players.length || 0;

  if (!game) return null;

  return (
    <div className="container">
      <h1>Podsumowanie rundy</h1>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ fontSize: '18px' }}>
            Runda {game.currentRound} z {game.rounds}
          </p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
            Litera: {game.currentLetter}
          </p>
        </div>

        {game.categories.map(category => (
          <div key={category} style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>{category}:</h3>
            {game.players.map(reviewedPlayerId => {
              const isOwnAnswer = reviewedPlayerId === playerId;
              const answer = getAnswer(reviewedPlayerId, category);
              const review = reviews[reviewedPlayerId]?.[category] || { isValid: null, isUnique: null };
              const hasAnswer = answer.trim() !== '';

              return (
                <div
                  key={reviewedPlayerId}
                  style={{
                    padding: '16px',
                    marginBottom: '12px',
                    background: isOwnAnswer ? '#e3f2fd' : '#f8f9fa',
                    borderRadius: '8px',
                    border: isOwnAnswer ? '2px solid #667eea' : 'none'
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong>
                        {getPlayerName(reviewedPlayerId)}:
                      </strong>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#667eea',
                        padding: '4px 12px',
                        background: '#e3f2fd',
                        borderRadius: '4px'
                      }}>
                        {calculatePoints(reviewedPlayerId, category)} pkt
                      </span>
                    </div>
                    <div style={{
                      padding: '8px',
                      background: hasAnswer ? 'white' : '#ffebee',
                      borderRadius: '4px',
                      marginTop: '4px',
                      minHeight: '40px'
                    }}>
                      {hasAnswer ? answer : '(brak odpowiedzi)'}
                    </div>
                  </div>
                  {!isOwnAnswer && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleReview(reviewedPlayerId, category, 'isValid', review.isValid === false ? null : false)}
                        style={{
                          background: review.isValid === false ? '#dc3545' : '#6c757d',
                          padding: '8px 16px',
                          fontSize: '14px'
                        }}
                        disabled={!hasAnswer}
                      >
                        ✗ Niezaliczenie
                      </button>
                      <button
                        onClick={() => handleReview(reviewedPlayerId, category, 'isValid', review.isValid === true ? null : true)}
                        style={{
                          background: review.isValid === true ? '#28a745' : '#6c757d',
                          padding: '8px 16px',
                          fontSize: '14px'
                        }}
                        disabled={!hasAnswer}
                      >
                        ✓ Poprawna
                      </button>
                      <button
                        onClick={() => handleReview(reviewedPlayerId, category, 'isUnique', review.isUnique === true ? null : true)}
                        style={{
                          background: review.isUnique === true ? '#ffc107' : '#6c757d',
                          padding: '8px 16px',
                          fontSize: '14px',
                          color: review.isUnique === true ? '#000' : '#fff'
                        }}
                        disabled={!hasAnswer || review.isValid === false}
                      >
                        ⭐ Unikalna
                      </button>
                    </div>
                  )}
                  {isOwnAnswer && (
                    <div style={{ 
                      padding: '8px',
                      background: '#fff',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      Nie możesz oceniać własnych odpowiedzi
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <div style={{
          padding: '16px',
          background: '#e7f3ff',
          borderRadius: '8px',
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <p style={{ marginBottom: '12px', fontWeight: '600' }}>
            Gotowy: {readyCount}/{totalPlayers}
          </p>
          <button
            onClick={readyForNextRound}
            disabled={isReady}
            style={{ width: '100%' }}
          >
            {isReady ? 'Gotowy ✓' : 'Gotowy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewScreen;
