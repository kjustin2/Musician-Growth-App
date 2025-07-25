import { 
  PerformanceRecord, 
  PracticeSession, 
  PerformanceTrends, 
  PracticeAnalysis,
  RecordingSession,
  FinancialSummary
} from '../core/types';
import { calculateAverage, calculateTotal, sortByDate } from '../utils';
import { financialTrackingService } from './financialTrackingService';

export class AnalyticsService {
  groupActivitiesByWeek<T extends { date: Date }>(activities: T[]): Record<string, T[]> {
    const grouped: Record<string, T[]> = {};
    
    activities.forEach(activity => {
      const weekNumber = this.getWeekNumber(activity.date);
      const weekKey = `${weekNumber}`;
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = [];
      }
      grouped[weekKey].push(activity);
    });
    
    return grouped;
  }

  private getWeekNumber(date: Date): number {
    const onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  }
  analyzePerformanceTrends(shows: PerformanceRecord[]): PerformanceTrends {
    if (shows.length === 0) {
      return {
        averageAudienceSize: 0,
        totalEarnings: 0,
        showFrequency: 'stable',
        venueProgression: 'stable'
      };
    }

    const sortedShows = sortByDate(shows, true);
    const audienceSizes = shows.map(show => show.audienceSize);
    const earnings = shows.map(show => show.payment);

    const averageAudienceSize = calculateAverage(audienceSizes);
    const totalEarnings = calculateTotal(earnings);
    const showFrequency = this.calculateShowFrequencyTrend(sortedShows);
    const venueProgression = this.calculateVenueProgression(sortedShows);

    return {
      averageAudienceSize,
      totalEarnings,
      showFrequency,
      venueProgression
    };
  }

  private calculateShowFrequencyTrend(shows: PerformanceRecord[]): 'increasing' | 'decreasing' | 'stable' {
    if (shows.length < 4) return 'stable';

    const midpoint = Math.floor(shows.length / 2);
    const firstHalf = shows.slice(0, midpoint);
    const secondHalf = shows.slice(midpoint);

    const firstHalfDays = this.calculateDateRangeInDays(firstHalf);
    const secondHalfDays = this.calculateDateRangeInDays(secondHalf);

    if (firstHalfDays === 0 || secondHalfDays === 0) return 'stable';

    const firstHalfFrequency = firstHalf.length / firstHalfDays;
    const secondHalfFrequency = secondHalf.length / secondHalfDays;

    const threshold = 0.1;
    if (secondHalfFrequency > firstHalfFrequency * (1 + threshold)) {
      return 'increasing';
    } else if (secondHalfFrequency < firstHalfFrequency * (1 - threshold)) {
      return 'decreasing';
    }
    return 'stable';
  }

  private calculateDateRangeInDays(shows: PerformanceRecord[]): number {
    if (shows.length < 2) return 0;
    const firstDate = shows[0]?.date;
    const lastDate = shows[shows.length - 1]?.date;
    if (!firstDate || !lastDate) return 0;
    return Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 3600 * 24));
  }

  private calculateVenueProgression(shows: PerformanceRecord[]): 'improving' | 'declining' | 'stable' {
    if (shows.length < 4) return 'stable';

    const venueScores = shows.map(show => this.getVenueScore(show.venueType));
    const midpoint = Math.floor(venueScores.length / 2);
    const firstHalfAverage = calculateAverage(venueScores.slice(0, midpoint));
    const secondHalfAverage = calculateAverage(venueScores.slice(midpoint));

    const threshold = 0.5;
    if (secondHalfAverage > firstHalfAverage + threshold) {
      return 'improving';
    } else if (secondHalfAverage < firstHalfAverage - threshold) {
      return 'declining';
    }
    return 'stable';
  }

  private getVenueScore(venueType: PerformanceRecord['venueType']): number {
    const scores = {
      'bar': 1,
      'restaurant': 2,
      'private_event': 3,
      'other': 3,
      'concert_hall': 4,
      'festival': 5
    };
    return scores[venueType] || 3;
  }

  analyzePracticeHabits(sessions: PracticeSession[]): PracticeAnalysis {
    if (sessions.length === 0) {
      return {
        weeklyAverage: 0,
        consistency: 'needs_improvement',
        recommendedAdjustment: 'increase',
        suggestProfessionalLessons: true
      };
    }

    const weeklyAverage = this.calculateWeeklyPracticeAverage(sessions);
    const consistency = this.calculatePracticeConsistency(sessions);
    const recommendedAdjustment = this.getRecommendedPracticeAdjustment(weeklyAverage);
    const suggestProfessionalLessons = this.shouldSuggestProfessionalLessons(sessions, weeklyAverage);

    return {
      weeklyAverage,
      consistency,
      recommendedAdjustment,
      suggestProfessionalLessons
    };
  }

  private calculateWeeklyPracticeAverage(sessions: PracticeSession[]): number {
    if (sessions.length === 0) return 0;

    const sortedSessions = sortByDate(sessions, true);
    const oldestDate = sortedSessions[0]?.date;
    const newestDate = sortedSessions[sortedSessions.length - 1]?.date;
    
    if (!oldestDate || !newestDate) return 0;
    
    const totalDays = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 3600 * 24)) + 1;
    const totalWeeks = Math.max(1, totalDays / 7);
    const totalMinutes = calculateTotal(sessions.map(s => s.duration));

    return totalMinutes / totalWeeks;
  }

  private calculatePracticeConsistency(sessions: PracticeSession[]): 'excellent' | 'good' | 'needs_improvement' {
    if (sessions.length < 4) return 'needs_improvement';

    const sortedSessions = sortByDate(sessions, true);
    const gaps = [];
    
    for (let i = 1; i < sortedSessions.length; i++) {
      const currentDate = sortedSessions[i]?.date;
      const previousDate = sortedSessions[i - 1]?.date;
      if (currentDate && previousDate) {
        const daysBetween = Math.ceil(
          (currentDate.getTime() - previousDate.getTime()) / (1000 * 3600 * 24)
        );
        gaps.push(daysBetween);
      }
    }

    const averageGap = calculateAverage(gaps);
    const maxGap = Math.max(...gaps);

    if (averageGap <= 2 && maxGap <= 7) {
      return 'excellent';
    } else if (averageGap <= 4 && maxGap <= 14) {
      return 'good';
    } else {
      return 'needs_improvement';
    }
  }

  private getRecommendedPracticeAdjustment(weeklyMinutes: number): 'increase' | 'decrease' | 'maintain' {
    const idealWeeklyMinutes = 300;
    const maxWeeklyMinutes = 900;

    if (weeklyMinutes < idealWeeklyMinutes * 0.8) {
      return 'increase';
    } else if (weeklyMinutes > maxWeeklyMinutes) {
      return 'decrease';
    } else {
      return 'maintain';
    }
  }

  private shouldSuggestProfessionalLessons(
    sessions: PracticeSession[], 
    weeklyAverage: number
  ): boolean {
    if (weeklyAverage < 120) {
      return true;
    }

    if (sessions.length < 4) {
      return true;
    }

    const recentSessions = sessions.slice(-8);
    const focusAreas = recentSessions.flatMap(s => s.focusAreas);
    const uniqueFocusAreas = new Set(focusAreas);
    
    if (uniqueFocusAreas.size > focusAreas.length * 0.7) {
      return true;
    }

    return false;
  }

  calculateTotalPracticeTime(sessions: PracticeSession[]): number {
    return calculateTotal(sessions.map(s => s.duration));
  }

  calculateAverageShowPayment(shows: PerformanceRecord[]): number {
    const payments = shows.map(show => show.payment);
    return calculateAverage(payments);
  }

  getTopVenueTypes(shows: PerformanceRecord[]): Array<{ type: string; count: number }> {
    const venueCount = shows.reduce((acc, show) => {
      acc[show.venueType] = (acc[show.venueType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(venueCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  getMostPracticedSkills(sessions: PracticeSession[]): Array<{ skill: string; count: number }> {
    const skillCount = sessions.reduce((acc, session) => {
      session.skillsWorkedOn.forEach(skill => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(skillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Enhanced performance trends that include recording revenue
   */
  async analyzeEnhancedPerformanceTrends(profileId: string, shows: PerformanceRecord[]): Promise<PerformanceTrends> {
    const baseTrends = this.analyzePerformanceTrends(shows);
    
    try {
      // Get comprehensive financial summary including recording revenue
      const financialSummary = await financialTrackingService.calculateFinancialSummary(profileId);
      
      // Update total earnings to include all revenue sources
      return {
        ...baseTrends,
        totalEarnings: financialSummary.totalRevenue
      };
    } catch (error) {
      // Fall back to basic trends if financial service fails
      return baseTrends;
    }
  }

  /**
   * Calculate comprehensive financial metrics including recording data
   */
  async calculateComprehensiveFinancialMetrics(profileId: string): Promise<FinancialSummary> {
    return await financialTrackingService.calculateFinancialSummary(profileId);
  }

  /**
   * Calculate total revenue including performances and recordings
   */
  calculateTotalRevenue(shows: PerformanceRecord[], recordings: RecordingSession[]): number {
    const performanceRevenue = calculateTotal(shows.map(show => show.payment));
    const recordingRevenue = calculateTotal(recordings.map(rec => rec.totalRevenue));
    return performanceRevenue + recordingRevenue;
  }

  /**
   * Calculate total expenses including recording costs
   */
  calculateTotalExpenses(recordings: RecordingSession[]): number {
    return calculateTotal(recordings.map(rec => rec.cost));
  }

  /**
   * Calculate net income (revenue - expenses)
   */
  calculateNetIncome(shows: PerformanceRecord[], recordings: RecordingSession[]): number {
    const totalRevenue = this.calculateTotalRevenue(shows, recordings);
    const totalExpenses = this.calculateTotalExpenses(recordings);
    return totalRevenue - totalExpenses;
  }

  /**
   * Analyze recording performance and ROI
   */
  analyzeRecordingPerformance(recordings: RecordingSession[]): {
    totalInvestment: number;
    totalReturn: number;
    roi: number;
    averageRevenuePerSong: number;
    mostProfitableRecording: RecordingSession | null;
  } {
    if (recordings.length === 0) {
      return {
        totalInvestment: 0,
        totalReturn: 0,
        roi: 0,
        averageRevenuePerSong: 0,
        mostProfitableRecording: null
      };
    }

    const totalInvestment = calculateTotal(recordings.map(rec => rec.cost));
    const totalReturn = calculateTotal(recordings.map(rec => rec.totalRevenue));
    const roi = totalInvestment > 0 ? ((totalReturn - totalInvestment) / totalInvestment) * 100 : 0;
    
    const totalSongs = recordings.reduce((sum, rec) => sum + rec.songs.length, 0);
    const averageRevenuePerSong = totalSongs > 0 ? totalReturn / totalSongs : 0;
    
    const mostProfitableRecording = recordings.reduce((best, current) => {
      const currentProfit = current.totalRevenue - current.cost;
      const bestProfit = best ? best.totalRevenue - best.cost : -Infinity;
      return currentProfit > bestProfit ? current : best;
    }, null as RecordingSession | null);

    return {
      totalInvestment,
      totalReturn,
      roi,
      averageRevenuePerSong,
      mostProfitableRecording
    };
  }

  /**
   * Calculate revenue breakdown by source
   */
  calculateRevenueBreakdown(shows: PerformanceRecord[], recordings: RecordingSession[]): {
    performances: { amount: number; percentage: number };
    recordings: { amount: number; percentage: number };
    total: number;
  } {
    const performanceRevenue = calculateTotal(shows.map(show => show.payment));
    const recordingRevenue = calculateTotal(recordings.map(rec => rec.totalRevenue));
    const total = performanceRevenue + recordingRevenue;

    return {
      performances: {
        amount: performanceRevenue,
        percentage: total > 0 ? (performanceRevenue / total) * 100 : 0
      },
      recordings: {
        amount: recordingRevenue,
        percentage: total > 0 ? (recordingRevenue / total) * 100 : 0
      },
      total
    };
  }

  /**
   * Get financial health indicators
   */
  async getFinancialHealthIndicators(profileId: string): Promise<{
    healthScore: number;
    profitMargin: number;
    revenueGrowth: string;
    expenseRatio: number;
  }> {
    try {
      const [healthScore, financialSummary] = await Promise.all([
        financialTrackingService.getFinancialHealthScore(profileId),
        financialTrackingService.calculateFinancialSummary(profileId)
      ]);

      const profitMargin = financialSummary.totalRevenue > 0 
        ? (financialSummary.netIncome / financialSummary.totalRevenue) * 100 
        : 0;

      const expenseRatio = financialSummary.totalRevenue > 0 
        ? (financialSummary.totalExpenses / financialSummary.totalRevenue) * 100 
        : 0;

      // Calculate revenue growth from monthly trends
      const recentTrends = financialSummary.monthlyTrends.slice(0, 3);
      const olderTrends = financialSummary.monthlyTrends.slice(3, 6);
      
      const recentAverage = recentTrends.length > 0 
        ? calculateAverage(recentTrends.map(t => t.revenue)) 
        : 0;
      const olderAverage = olderTrends.length > 0 
        ? calculateAverage(olderTrends.map(t => t.revenue)) 
        : 0;

      let revenueGrowth = 'stable';
      if (olderAverage > 0) {
        const growthRate = ((recentAverage - olderAverage) / olderAverage) * 100;
        if (growthRate > 10) {
          revenueGrowth = 'increasing';
        } else if (growthRate < -10) {
          revenueGrowth = 'decreasing';
        }
      }

      return {
        healthScore,
        profitMargin,
        revenueGrowth,
        expenseRatio
      };
    } catch (error) {
      return {
        healthScore: 0,
        profitMargin: 0,
        revenueGrowth: 'stable',
        expenseRatio: 0
      };
    }
  }

  /**
   * Enhanced average show payment that considers recording revenue impact
   */
  calculateEnhancedAverageEarnings(shows: PerformanceRecord[], recordings: RecordingSession[]): {
    averagePerShow: number;
    averagePerRecording: number;
    overallAverage: number;
  } {
    const averagePerShow = this.calculateAverageShowPayment(shows);
    const averagePerRecording = recordings.length > 0 
      ? calculateAverage(recordings.map(rec => rec.totalRevenue)) 
      : 0;
    
    const totalActivities = shows.length + recordings.length;
    const totalRevenue = this.calculateTotalRevenue(shows, recordings);
    const overallAverage = totalActivities > 0 ? totalRevenue / totalActivities : 0;

    return {
      averagePerShow,
      averagePerRecording,
      overallAverage
    };
  }
}

export const analyticsService = new AnalyticsService();