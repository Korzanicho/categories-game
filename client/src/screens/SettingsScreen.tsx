import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

function SettingsScreen() {
  const navigate = useNavigate();
  const { playerName, setPlayerName } = useGameStore();
  const [name, setName] = useState(playerName);

  useEffect(() => {
    setName(playerName);
  }, [playerName]);

  const handleSave = () => {
    if (name.trim()) {
      setPlayerName(name.trim());
      alert('Nazwa gracza została zapisana!');
      navigate('/');
    } else {
      alert('Nazwa nie może być pusta');
    }
  };

  return (
    <div className="container">
      <h1>Ustawienia</h1>
      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Nazwa gracza:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Wprowadź nazwę gracza"
            maxLength={20}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
            Domyślnie: {playerName || 'Player...'}
          </small>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSave} style={{ flex: 1 }}>
            Zapisz
          </button>
          <button onClick={() => navigate('/')} style={{ background: '#6c757d' }}>
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsScreen;
