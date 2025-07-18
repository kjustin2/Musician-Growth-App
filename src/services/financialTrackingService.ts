import { 
  FinancialSummary, 
  MonthlyFinancialData, 
  PerformanceRecord, 
  RecordingSession 
} from '../core/types';
import { storageService } from './storageService';

export interface ExpenseRecord {
  id: string;
  profileId: string;
  amount: number;
  category: 'recording' | 'equipment' | 'marketing' | 'other';
  description: string;
  date: Date;
}

export interface RevenueRecord {
  id: string;
  profileId: string;
  amount: number;
  source: 'performances' | 'recordings' | 'other';
  description: string;
  date: Date;
}

export class FinancialTrackingService {
  /**
   * Calculate comprehensive financial summary for a profile
   */
  async calculateFinancialSummary(profileId: string): Promise<FinancialSummary> {
    try {
      // Get all financial data sources
      const [performances, recordings] = await Promise.all([
        storageService.getPerformances(profileId),
        storageService.getRecordingSessions(profileId)
      ]);

      // Calculate revenue by source
      const performanceRevenue = performances.reduce((sum, perf) => sum + perf.payment, 0);
      const recordingRevenue = recordings.reduce((sum, rec) => sum + rec.totalRevenue, 0);
      const otherRevenue = 0; // Placeholder for future other revenue sources

      const totalRevenue = performanceRevenue + recordingRevenue + otherRevenue;

      // Calculate expenses by category
      const recordingExpenses = recordings.reduce((sum, rec) => sum + rec.cost, 0);
      const equipmentExpenses = 0; // Placeholder for future equipment tracking
      const marketingExpenses = 0; // Placeholder for future marketing tracking
      const otherExpenses = 0; // Placeholder for future other expenses

      const totalExpenses = recordingExpenses + equipmentExpenses + marketingExpenses + otherExpenses;

      // Calculate monthly trends
      const monthlyTrends = this.calculateMonthlyTrends(performances, recordings);

      return {
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        revenueBySource: {
          performances: performanceRevenue,
          recordings: recordingRevenue,
          other: otherRevenue
        },
        expensesByCategory: {
          recording: recordingExpenses,
          equipment: equipmentExpenses,
          marketing: marketingExpenses,
          other: otherExpenses
        },
        monthlyTrends
      };
    } catch (error) {
      throw new Error(`Failed to calculate financial summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add an expense record (placeholder for future implementation)
   */
  async addExpense(profileId: string, expense: ExpenseRecord): Promise<void> {
    // This is a placeholder implementation
    // In the future, this would save to a dedicated expenses store
    // For now, we'll just validate the input
    if (!expense.amount || expense.amount <= 0) {
      throw new Error('Expense amount must be positive');
    }
    if (!expense.category) {
      throw new Error('Expense category is required');
    }
    if (!expense.description?.trim()) {
      throw new Error('Expense description is required');
    }
  }

  /**
   * Add a revenue record (placeholder for future implementation)
   */
  async addRevenue(profileId: string, revenue: RevenueRecord): Promise<void> {
    // This is a placeholder implementation
    // In the future, this would save to a dedicated revenue store
    // For now, we'll just validate the input
    if (!revenue.amount || revenue.amount <= 0) {
      throw new Error('Revenue amount must be positive');
    }
    if (!revenue.source) {
      throw new Error('Revenue source is required');
    }
    if (!revenue.description?.trim()) {
      throw new Error('Revenue description is required');
    }
  }

  /**
   * Get monthly financial trends for the specified number of months
   */
  async getMonthlyTrends(profileId: string, months: number = 12): Promise<MonthlyFinancialData[]> {
    try {
      const [performances, recordings] = await Promise.all([
        storageService.getPerformances(profileId),
        storageService.getRecordingSessions(profileId)
      ]);

      return this.calculateMonthlyTrends(performances, recordings, months);
    } catch (error) {
      throw new Error(`Failed to get monthly trends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate monthly trends from performance and recording data
   */
  private calculateMonthlyTrends(
    performances: PerformanceRecord[], 
    recordings: RecordingSession[], 
    months: number = 12
  ): MonthlyFinancialData[] {
    const now = new Date();
    const monthlyData: Record<string, MonthlyFinancialData> = {};

    // Initialize months
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = this.getMonthKey(date);
      monthlyData[monthKey] = {
        month: monthKey,
        revenue: 0,
        expenses: 0,
        netIncome: 0
      };
    }

    // Add performance revenue
    performances.forEach(performance => {
      const monthKey = this.getMonthKey(performance.date);
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += performance.payment;
      }
    });

    // Add recording revenue and expenses
    recordings.forEach(recording => {
      const monthKey = this.getMonthKey(recording.date);
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += recording.totalRevenue;
        monthlyData[monthKey].expenses += recording.cost;
      }
    });

    // Calculate net income for each month
    Object.values(monthlyData).forEach(data => {
      data.netIncome = data.revenue - data.expenses;
    });

    // Convert to array and sort by month (newest first)
    return Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.month + '-01');
      const dateB = new Date(b.month + '-01');
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Get month key in YYYY-MM format
   */
  private getMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get financial metrics for a specific time period
   */
  async getFinancialMetricsForPeriod(
    profileId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<FinancialSummary> {
    try {
      const [performances, recordings] = await Promise.all([
        storageService.getPerformances(profileId),
        storageService.getRecordingSessions(profileId)
      ]);

      // Filter data by date range
      const filteredPerformances = performances.filter(
        perf => perf.date >= startDate && perf.date <= endDate
      );
      const filteredRecordings = recordings.filter(
        rec => rec.date >= startDate && rec.date <= endDate
      );

      // Calculate metrics for the period
      const performanceRevenue = filteredPerformances.reduce((sum, perf) => sum + perf.payment, 0);
      const recordingRevenue = filteredRecordings.reduce((sum, rec) => sum + rec.totalRevenue, 0);
      const recordingExpenses = filteredRecordings.reduce((sum, rec) => sum + rec.cost, 0);

      const totalRevenue = performanceRevenue + recordingRevenue;
      const totalExpenses = recordingExpenses;

      return {
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
        revenueBySource: {
          performances: performanceRevenue,
          recordings: recordingRevenue,
          other: 0
        },
        expensesByCategory: {
          recording: recordingExpenses,
          equipment: 0,
          marketing: 0,
          other: 0
        },
        monthlyTrends: this.calculateMonthlyTrends(filteredPerformances, filteredRecordings)
      };
    } catch (error) {
      throw new Error(`Failed to get financial metrics for period: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate average earnings per performance
   */
  async getAverageEarningsPerPerformance(profileId: string): Promise<number> {
    try {
      const performances = await storageService.getPerformances(profileId);
      if (performances.length === 0) return 0;

      const totalEarnings = performances.reduce((sum, perf) => sum + perf.payment, 0);
      return totalEarnings / performances.length;
    } catch (error) {
      throw new Error(`Failed to calculate average earnings per performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate recording ROI (Return on Investment)
   */
  async getRecordingROI(profileId: string): Promise<number> {
    try {
      const recordings = await storageService.getRecordingSessions(profileId);
      
      const totalInvestment = recordings.reduce((sum, rec) => sum + rec.cost, 0);
      const totalReturn = recordings.reduce((sum, rec) => sum + rec.totalRevenue, 0);

      if (totalInvestment === 0) return 0;
      
      // ROI as percentage: (Return - Investment) / Investment * 100
      return ((totalReturn - totalInvestment) / totalInvestment) * 100;
    } catch (error) {
      throw new Error(`Failed to calculate recording ROI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get top earning recordings
   */
  async getTopEarningRecordings(profileId: string, limit: number = 5): Promise<RecordingSession[]> {
    try {
      const recordings = await storageService.getRecordingSessions(profileId);
      
      return recordings
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to get top earning recordings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get financial health score (0-100)
   */
  async getFinancialHealthScore(profileId: string): Promise<number> {
    try {
      const summary = await this.calculateFinancialSummary(profileId);
      
      let score = 0;
      
      // Positive net income (40 points)
      if (summary.netIncome > 0) {
        score += 40;
      } else if (summary.netIncome >= -summary.totalRevenue * 0.1) {
        // Small loss (within 10% of revenue) gets partial points
        score += 20;
      }
      
      // Revenue diversification (30 points)
      const revenueStreams = Object.values(summary.revenueBySource).filter(amount => amount > 0).length;
      score += Math.min(revenueStreams * 15, 30);
      
      // Recording ROI (30 points)
      const roi = await this.getRecordingROI(profileId);
      if (roi > 50) {
        score += 30;
      } else if (roi > 0) {
        score += 15;
      } else if (roi > -25) {
        score += 5;
      }
      
      return Math.min(score, 100);
    } catch (error) {
      throw new Error(`Failed to calculate financial health score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create and export singleton instance
export const financialTrackingService = new FinancialTrackingService();