import { useApp } from '@/context/AppContext';
import LandingPage from '@/components/LandingPage/LandingPage';
import MusicianForm from '@/components/MusicianForm/MusicianForm';
import RecommendationsList from '@/components/Recommendation/RecommendationsList';
import Dashboard from '@/components/Dashboard/Dashboard';
import ProfileSelection from '@/components/ProfileSelection/ProfileSelection';
import ActivityTracking from '@/components/ActivityTracking/ActivityTracking';
import GoalManagement from '@/components/GoalManagement/GoalManagement';
import BulkEntry from '@/components/BulkEntry/BulkEntry';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import './App.css';

function App() {
  const { state } = useApp();

  const renderCurrentPage = () => {
    switch (state.currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'profile-selection':
        return <ProfileSelection />;
      case 'profile-creation':
        return <MusicianForm />;
      case 'dashboard':
        return state.musicianProfile ? <Dashboard profile={state.musicianProfile} /> : <ProfileSelection />;
      case 'activity-entry':
        return <ActivityTracking />;
      case 'goal-management':
        return <GoalManagement />;
      case 'bulk-entry':
        return <BulkEntry />;
      case 'form':
        return <MusicianForm />;
      case 'results':
        return <RecommendationsList />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
        {renderCurrentPage()}
      </div>
    </ErrorBoundary>
  );
}

export default App;