import React, { useState } from 'react';
import { MusicianProfile } from '../../core/types';
import OverviewTab from './OverviewTab';
import AnalyticsTab from './AnalyticsTab';
import ActionsTab from './ActionsTab';
import AchievementsTab from './AchievementsTab';

interface DashboardTabsProps {
  profile: MusicianProfile;
}

type TabType = 'overview' | 'analytics' | 'actions' | 'achievements';

const DashboardTabs: React.FC<DashboardTabsProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-home' },
    { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
    { id: 'actions', label: 'Actions', icon: 'fas fa-bolt' },
    { id: 'achievements', label: 'Achievements', icon: 'fas fa-trophy' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab profile={profile} />;
      case 'analytics':
        return <AnalyticsTab profile={profile} />;
      case 'actions':
        return <ActionsTab profile={profile} />;
      case 'achievements':
        return <AchievementsTab profile={profile} />;
      default:
        return <OverviewTab profile={profile} />;
    }
  };

  return (
    <div className="dashboard-tabs">
      {/* Tab Navigation */}
      <nav className="nav nav-tabs dashboard-nav-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as TabType)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            <i className={`${tab.icon} me-2`}></i>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="tab-content dashboard-tab-content">
        <div className="tab-pane fade show active" role="tabpanel">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DashboardTabs;