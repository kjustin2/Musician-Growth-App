import React from 'react';
import { MusicianProfile } from '../../core/types';
import { useSetPage } from '../../context/AppContext';
import DashboardMetrics from './DashboardMetrics';
import RecentActivities from './RecentActivities';
import GoalProgress from './GoalProgress';

interface OverviewTabProps {
  profile: MusicianProfile;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ profile }) => {
  const setPage = useSetPage();

  const handleGoalClick = () => {
    setPage('goal-management');
  };

  return (
    <div className="overview-tab">
      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Key Metrics */}
          <div className="mb-4">
            <DashboardMetrics profile={profile} />
          </div>

          {/* Recent Activities */}
          <div className="mb-4">
            <RecentActivities profile={profile} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Goal Progress */}
          <div className="mb-4">
            <GoalProgress goals={profile.goals || []} onGoalClick={handleGoalClick} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;