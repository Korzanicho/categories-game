import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';

function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="home-screen">
      <div className="container">
        <h1>Państwa Miasta</h1>
        <div className="card">
          <div className="button-group">
            <button 
              className="primary-button"
              onClick={() => navigate('/create')}
            >
              Stwórz grę
            </button>
            <button 
              className="primary-button"
              onClick={() => navigate('/join')}
            >
              Dołącz do gry
            </button>
            <button 
              className="secondary-button"
              onClick={() => navigate('/settings')}
            >
              Ustawienia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
