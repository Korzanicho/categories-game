import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

function GameplayScreen() {
  const navigate = useNavigate();
  const { game, playerId, submitAnswer, finishAnswers, getScores } = useGameStore();
  
  const getPlayerName = (pId: string) => {
    return game?.playerNames?.[pId] || `Gracz ${pId.slice(0, 8)}`;
  };
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!game) {
      navigate('/');
      return;
    }

    if (game.status === 'reviewing') {
      navigate('/review');
    } else if (game.status === 'letter_selection') {
      navigate('/letter-selection');
    } else if (game.status === 'finished') {
      navigate('/scores');
    }

    // Inicjalizuj odpowiedzi
    if (game.answers[playerId || '']) {
      setAnswers(game.answers[playerId || '']);
    } else {
      const initialAnswers: Record<string, string> = {};
      game.categories.forEach(cat => {
        initialAnswers[cat] = '';
      });
      setAnswers(initialAnswers);
    }
  }, [game, navigate, playerId]);

  const handleFinish = () => {
    if (finished) return;
    setFinished(true);
    finishAnswers();
  };

  useEffect(() => {
    if (!game || !game.timerEndTime) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((game.timerEndTime! - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0 && !finished) {
        setFinished(true);
        finishAnswers();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [game?.timerEndTime, finished, finishAnswers]);

  const handleAnswerChange = (category: string, value: string) => {
    const newAnswers = { ...answers, [category]: value };
    setAnswers(newAnswers);
    submitAnswer(category, value);
  };

  const handleNext = () => {
    if (currentCategoryIndex < game!.categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentCategoryIndex]);

  const allAnswered = game?.categories.every(cat => answers[cat]?.trim()) || false;

  if (!game) return null;

  const currentCategory = game.categories[currentCategoryIndex];

  return (
    <div className="container">
      <h1>Rozgrywka</h1>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
            {game.currentLetter}
          </div>
          <p style={{ fontSize: '18px' }}>
            Runda {game.currentRound} z {game.rounds}
          </p>
        </div>

        {game.timerEndTime && (
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: '#fff3cd',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>
              Czas na dokończenie: {timeLeft}s
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              {game.timerStartedBy === playerId 
                ? 'Zakończyłeś wpisywanie' 
                : `${getPlayerName(game.timerStartedBy || '')} zakończył wpisywanie`}
            </p>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {game.categories.map((cat, idx) => (
              <button
                key={cat}
                onClick={() => setCurrentCategoryIndex(idx)}
                style={{
                  background: idx === currentCategoryIndex ? '#667eea' : '#6c757d',
                  padding: '8px 16px',
                  fontSize: '14px',
                  minWidth: '60px'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '18px' }}>
              {currentCategory}:
            </label>
            <input
              ref={inputRef}
              type="text"
              value={answers[currentCategory] || ''}
              onChange={(e) => handleAnswerChange(currentCategory, e.target.value)}
              placeholder={`Wpisz ${currentCategory.toLowerCase()} na literę ${game.currentLetter}`}
              style={{ fontSize: '18px', padding: '16px' }}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handlePrev}
              disabled={currentCategoryIndex === 0}
              style={{ flex: 1 }}
            >
              ← Wstecz
            </button>
            <button
              onClick={handleNext}
              disabled={currentCategoryIndex === game.categories.length - 1}
              style={{ flex: 1 }}
            >
              Dalej →
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/scores')}
            style={{ background: '#6c757d', flex: 1 }}
          >
            Tabela wyników
          </button>
          <button
            onClick={handleFinish}
            disabled={finished || !allAnswered}
            style={{ flex: 1 }}
          >
            {finished ? 'Zakończono' : 'Zakończ'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameplayScreen;
