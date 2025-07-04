import { useApp } from '@/context/AppContext';
import LandingPage from '@/components/LandingPage/LandingPage';
import MusicianForm from '@/components/MusicianForm/MusicianForm';
import RecommendationsList from '@/components/Recommendation/RecommendationsList';
import './App.css';

function App() {
  const { state } = useApp();

  return (
    <div className="App">
      {state.currentPage === 'landing' && <LandingPage />}
      {state.currentPage === 'form' && <MusicianForm />}
      {state.currentPage === 'results' && <RecommendationsList />}
    </div>
  );
}

export default App;