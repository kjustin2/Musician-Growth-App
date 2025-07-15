import React, { useState, useMemo } from 'react';
import { PerformanceRecord, PracticeSession, Goal } from '../../core/types';
import SimpleChart from '../common/SimpleChart';
import ProgressRing from '../common/ProgressRing';
import { analyticsService } from '../../services/analyticsService';
import './DashboardCharts.css';

interface DashboardChartsProps {
  performances: PerformanceRecord[];
  practices: PracticeSession[];
  goals: Goal[];
}

type ChartPeriod = 'week' | 'month' | 'quarter';

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  performances,
  practices,
  goals
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('month');

  const chartData = useMemo(() => {
    const now = new Date();
    const periodDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
    const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    // Filter data by period
    const recentPerformances = performances.filter(p => p.date >= startDate);
    const recentPractices = practices.filter(p => p.date >= startDate);

    // Practice time trend
    const practicesByWeek = analyticsService.groupActivitiesByWeek(recentPractices);
    const practiceTimeData = Object.entries(practicesByWeek).map(([week, sessions]) => ({
      label: `Week ${week}`,
      value: sessions.reduce((total, session) => total + session.duration, 0),
      color: '#28a745'
    }));

    // Performance earnings trend
    const performancesByWeek = analyticsService.groupActivitiesByWeek(recentPerformances);
    const earningsData = Object.entries(performancesByWeek).map(([week, performances]) => ({
      label: `Week ${week}`,
      value: performances.reduce((total, performance) => total + performance.payment, 0),
      color: '#007bff'
    }));

    // Venue type distribution
    const venueTypes = recentPerformances.reduce((acc, performance) => {
      acc[performance.venueType] = (acc[performance.venueType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const venueTypeData = Object.entries(venueTypes).map(([type, count]) => ({
      label: type.replace('_', ' ').toUpperCase(),
      value: count,
      color: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'][Math.floor(Math.random() * 5)]
    }));

    // Focus areas from practice sessions
    const focusAreas = recentPractices.reduce((acc, practice) => {
      practice.focusAreas.forEach(area => {
        acc[area] = (acc[area] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const focusAreaData = Object.entries(focusAreas)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([area, count]) => ({
        label: area,
        value: count,
        color: '#17a2b8'
      }));

    return {
      practiceTimeData,
      earningsData,
      venueTypeData,
      focusAreaData
    };
  }, [performances, practices, selectedPeriod]);

  const goalProgress = useMemo(() => {
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    
    return {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalGoals: goals.length,
      completionRate: goals.length > 0 ? completedGoals.length / goals.length : 0
    };
  }, [goals]);

  const practiceStats = useMemo(() => {
    const totalPracticeTime = analyticsService.calculateTotalPracticeTime(practices);
    const averageSessionLength = practices.length > 0 ? totalPracticeTime / practices.length : 0;
    
    return {
      totalTime: totalPracticeTime,
      averageSession: averageSessionLength,
      sessionsCount: practices.length
    };
  }, [practices]);

  const performanceStats = useMemo(() => {
    const totalEarnings = performances.reduce((sum, p) => sum + p.payment, 0);
    const averagePayment = analyticsService.calculateAverageShowPayment(performances);
    const averageAudience = performances.length > 0 
      ? performances.reduce((sum, p) => sum + p.audienceSize, 0) / performances.length 
      : 0;

    return {
      totalEarnings,
      averagePayment,
      averageAudience,
      showsCount: performances.length
    };
  }, [performances]);

  return (
    <div className="dashboard-charts">
      <div className="charts-header">
        <h3>Analytics Overview</h3>
        <div className="period-selector">
          <button 
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button 
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
          <button 
            className={selectedPeriod === 'quarter' ? 'active' : ''}
            onClick={() => setSelectedPeriod('quarter')}
          >
            Quarter
          </button>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-section">
          <SimpleChart
            data={chartData.practiceTimeData}
            title="Practice Time Trend (minutes)"
            type="line"
            height={200}
            showValues={true}
          />
        </div>

        <div className="chart-section">
          <SimpleChart
            data={chartData.earningsData}
            title="Performance Earnings ($)"
            type="bar"
            height={200}
            showValues={true}
          />
        </div>

        <div className="chart-section">
          <SimpleChart
            data={chartData.venueTypeData}
            title="Venue Types"
            type="bar"
            height={200}
            showValues={true}
          />
        </div>

        <div className="chart-section">
          <SimpleChart
            data={chartData.focusAreaData}
            title="Most Practiced Areas"
            type="bar"
            height={200}
            showValues={true}
          />
        </div>
      </div>

      <div className="progress-rings">
        <div className="progress-section">
          <h4>Goal Progress</h4>
          <div className="rings-container">
            <ProgressRing
              value={goalProgress.completedGoals}
              maxValue={goalProgress.totalGoals}
              label="Goals Completed"
              color="#28a745"
            />
            <div className="progress-stats">
              <p><strong>{goalProgress.completedGoals}</strong> completed</p>
              <p><strong>{goalProgress.activeGoals}</strong> active</p>
              <p><strong>{goalProgress.totalGoals}</strong> total</p>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <h4>Practice Summary</h4>
          <div className="rings-container">
            <ProgressRing
              value={practiceStats.totalTime}
              maxValue={Math.max(practiceStats.totalTime, 1000)}
              label="Total Hours"
              color="#17a2b8"
            />
            <div className="progress-stats">
              <p><strong>{Math.round(practiceStats.totalTime / 60)}h</strong> total</p>
              <p><strong>{Math.round(practiceStats.averageSession)}</strong> avg session</p>
              <p><strong>{practiceStats.sessionsCount}</strong> sessions</p>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <h4>Performance Summary</h4>
          <div className="rings-container">
            <ProgressRing
              value={performanceStats.totalEarnings}
              maxValue={Math.max(performanceStats.totalEarnings, 1000)}
              label="Total Earnings"
              color="#ffc107"
            />
            <div className="progress-stats">
              <p><strong>${performanceStats.totalEarnings}</strong> total</p>
              <p><strong>${Math.round(performanceStats.averagePayment)}</strong> avg show</p>
              <p><strong>{Math.round(performanceStats.averageAudience)}</strong> avg audience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;