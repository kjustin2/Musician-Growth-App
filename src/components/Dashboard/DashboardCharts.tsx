import React, { useState, useMemo } from 'react';
import { PerformanceRecord, PracticeSession, Goal } from '../../core/types';
import SimpleChart from '../common/SimpleChart';
import ProgressRing from '../common/ProgressRing';
import { analyticsService } from '../../services/analyticsService';
import { loggingService } from '../../services/loggingService';
import { SafeAccess } from '../../utils/safeAccess';
import { ensureArray } from '../../utils/typeGuards';
import './DashboardCharts.css';

interface DashboardChartsProps {
  performances: PerformanceRecord[];
  practices: PracticeSession[];
  goals: Goal[];
}

type ChartPeriod = 'week' | 'month' | 'quarter';

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  performances = [],
  practices = [],
  goals = []
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('month');

  const chartData = useMemo(() => {
    try {
      // Ensure all inputs are arrays
      const safePerformances = ensureArray(performances);
      const safePractices = ensureArray(practices);
      
      const now = new Date();
      const periodDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
      const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

      // Filter data by period with safe access
      const recentPerformances = SafeAccess.filter(safePerformances, p => {
        const date = SafeAccess.toDate(p.date, new Date());
        return date >= startDate;
      });
      const recentPractices = SafeAccess.filter(safePractices, p => {
        const date = SafeAccess.toDate(p.date, new Date());
        return date >= startDate;
      });

      // Practice time trend with safe access
      const practicesByWeek = SafeAccess.execute(
        () => analyticsService.groupActivitiesByWeek(recentPractices),
        {},
        'Failed to group practices by week'
      );
      const practiceTimeData = Object.entries(practicesByWeek).map(([week, sessions]) => ({
        label: `Week ${week}`,
        value: SafeAccess.reduce(sessions, (total, session) => total + (session.duration || 0), 0),
        color: '#28a745'
      }));

      // Performance earnings trend with safe access
      const performancesByWeek = SafeAccess.execute(
        () => analyticsService.groupActivitiesByWeek(recentPerformances),
        {},
        'Failed to group performances by week'
      );
      const earningsData = Object.entries(performancesByWeek).map(([week, performances]) => ({
        label: `Week ${week}`,
        value: SafeAccess.reduce(performances, (total, performance) => total + (performance.payment || 0), 0),
        color: '#007bff'
      }));

      // Venue type distribution with safe access
      const venueTypes = SafeAccess.reduce(recentPerformances, (acc, performance) => {
        const venueType = performance.venueType || 'other';
        acc[venueType] = (acc[venueType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const venueTypeData = Object.entries(venueTypes).map(([type, count]) => ({
        label: type.replace('_', ' ').toUpperCase(),
        value: count,
        color: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'][Math.floor(Math.random() * 5)]
      }));

      // Focus areas from practice sessions with safe access
      const focusAreas = SafeAccess.reduce(recentPractices, (acc, practice) => {
        const areas = ensureArray(practice.focusAreas);
        areas.forEach(area => {
          if (area && typeof area === 'string') {
            acc[area] = (acc[area] || 0) + 1;
          }
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
    } catch (error) {
      loggingService.error('Error calculating chart data', error as Error);
      return {
        practiceTimeData: [],
        earningsData: [],
        venueTypeData: [],
        focusAreaData: []
      };
    }
  }, [performances, practices, selectedPeriod]);

  const goalProgress = useMemo(() => {
    try {
      const safeGoals = ensureArray(goals);
      const activeGoals = SafeAccess.filter(safeGoals, goal => goal.status === 'active');
      const completedGoals = SafeAccess.filter(safeGoals, goal => goal.status === 'completed');
      
      return {
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        totalGoals: safeGoals.length,
        completionRate: safeGoals.length > 0 ? completedGoals.length / safeGoals.length : 0
      };
    } catch (error) {
      loggingService.error('Error calculating goal progress', error as Error);
      return {
        activeGoals: 0,
        completedGoals: 0,
        totalGoals: 0,
        completionRate: 0
      };
    }
  }, [goals]);

  const practiceStats = useMemo(() => {
    try {
      const safePractices = ensureArray(practices);
      const totalPracticeTime = SafeAccess.execute(
        () => analyticsService.calculateTotalPracticeTime(safePractices),
        0,
        'Failed to calculate total practice time'
      );
      const averageSessionLength = safePractices.length > 0 ? totalPracticeTime / safePractices.length : 0;
      
      return {
        totalTime: totalPracticeTime,
        averageSession: averageSessionLength,
        sessionsCount: safePractices.length
      };
    } catch (error) {
      loggingService.error('Error calculating practice stats', error as Error);
      return {
        totalTime: 0,
        averageSession: 0,
        sessionsCount: 0
      };
    }
  }, [practices]);

  const performanceStats = useMemo(() => {
    try {
      const safePerformances = ensureArray(performances);
      const totalEarnings = SafeAccess.reduce(safePerformances, (sum, p) => sum + (p.payment || 0), 0);
      const averagePayment = SafeAccess.execute(
        () => analyticsService.calculateAverageShowPayment(safePerformances),
        0,
        'Failed to calculate average show payment'
      );
      const averageAudience = safePerformances.length > 0 
        ? SafeAccess.reduce(safePerformances, (sum, p) => sum + (p.audienceSize || 0), 0) / safePerformances.length 
        : 0;

      return {
        totalEarnings,
        averagePayment,
        averageAudience,
        showsCount: safePerformances.length
      };
    } catch (error) {
      loggingService.error('Error calculating performance stats', error as Error);
      return {
        totalEarnings: 0,
        averagePayment: 0,
        averageAudience: 0,
        showsCount: 0
      };
    }
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