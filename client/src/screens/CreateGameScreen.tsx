import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

const DEFAULT_CATEGORIES = ['Country', 'City', 'Animal', 'Name', 'Thing'];
const TIME_OPTIONS = [10, 15, 20, 30, 45, 60];

function CreateGameScreen() {
  const navigate = useNavigate();
  const { createGame, game } = useGameStore();
  const [rounds, setRounds] = useState(6);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [timeLimit, setTimeLimit] = useState(10);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (game?.gameCode) {
      navigate('/lobby');
    }
  }, [game, navigate]);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter(c => c !== category));
    }
  };

  const handleCreateGame = () => {
    if (categories.length === 0) {
      alert('Musisz dodać przynajmniej jedną kategorię');
      return;
    }
    createGame(rounds, categories, timeLimit);
  };

  return (
    <div className="container">
      <h1>Stwórz grę</h1>
      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Ilość rund:
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
            style={{ width: '100px' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Kategorie:
          </label>
          <div style={{ marginBottom: '12px' }}>
            {categories.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  marginBottom: '8px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}
              >
                <span>{cat}</span>
                <button
                  onClick={() => handleRemoveCategory(cat)}
                  style={{
                    background: '#dc3545',
                    padding: '4px 12px',
                    fontSize: '14px'
                  }}
                >
                  Usuń
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nowa kategoria"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button onClick={handleAddCategory} style={{ whiteSpace: 'nowrap' }}>
              Dodaj
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Czas na dokończenie odpowiadania (sekundy):
          </label>
          <select
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
          >
            {TIME_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleCreateGame} style={{ flex: 1 }}>
            Stwórz grę
          </button>
          <button onClick={() => navigate('/')} style={{ background: '#6c757d' }}>
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGameScreen;
