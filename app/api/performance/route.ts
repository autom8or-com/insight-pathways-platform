import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server-auth';

// Mock performance data - in a real implementation this would come from a database
const mockPerformanceData = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    quizId: 'quiz1',
    quizTitle: 'Leadership Assessment',
    score: 85,
    totalQuestions: 10,
    completedAt: '2024-01-15T10:30:00Z',
    timeSpent: 1800, // seconds
    category: 'Leadership',
    responses: [
      { questionId: '1', correct: true, timeSpent: 120 },
      { questionId: '2', correct: false, timeSpent: 180 },
      // ... more responses
    ]
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jane Smith',
    quizId: 'quiz1',
    quizTitle: 'Leadership Assessment',
    score: 92,
    totalQuestions: 10,
    completedAt: '2024-01-16T14:45:00Z',
    timeSpent: 1500,
    category: 'Leadership',
    responses: []
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Mike Johnson',
    quizId: 'quiz2',
    quizTitle: 'Process Management',
    score: 78,
    totalQuestions: 8,
    completedAt: '2024-01-17T09:15:00Z',
    timeSpent: 1200,
    category: 'Process Improvement',
    responses: []
  },
  {
    id: '4',
    userId: 'user1',
    userName: 'John Doe',
    quizId: 'quiz2',
    quizTitle: 'Process Management',
    score: 88,
    totalQuestions: 8,
    completedAt: '2024-01-18T16:20:00Z',
    timeSpent: 1080,
    category: 'Process Improvement',
    responses: []
  },
  {
    id: '5',
    userId: 'user4',
    userName: 'Sarah Wilson',
    quizId: 'quiz3',
    quizTitle: 'Customer Service Excellence',
    score: 95,
    totalQuestions: 12,
    completedAt: '2024-01-19T11:00:00Z',
    timeSpent: 2400,
    category: 'Customer Service',
    responses: []
  }
];

const mockTeamPerformance = {
  overallStats: {
    totalQuizzes: 15,
    totalParticipants: 8,
    averageScore: 85.2,
    completionRate: 92.5,
    averageTimeSpent: 1456 // seconds
  },
  categoryBreakdown: [
    { category: 'Leadership', averageScore: 88.5, totalQuizzes: 5 },
    { category: 'Process Improvement', averageScore: 83.0, totalQuizzes: 4 },
    { category: 'Customer Service', averageScore: 87.8, totalQuizzes: 3 },
    { category: 'HR Management', averageScore: 84.2, totalQuizzes: 3 }
  ],
  trendData: [
    { period: '2024-01-15', averageScore: 82.3, completionRate: 88 },
    { period: '2024-01-16', averageScore: 84.7, completionRate: 91 },
    { period: '2024-01-17', averageScore: 86.1, completionRate: 93 },
    { period: '2024-01-18', averageScore: 85.9, completionRate: 94 },
    { period: '2024-01-19', averageScore: 87.2, completionRate: 95 }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['manager', 'admin', 'executive']);
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const period = searchParams.get('period');
    const type = searchParams.get('type') || 'individual';
    
    if (type === 'team') {
      // Return aggregated team performance data
      return NextResponse.json(mockTeamPerformance);
    }
    
    let filteredData = mockPerformanceData;
    
    if (userId) {
      filteredData = filteredData.filter(p => p.userId === userId);
    }
    
    if (category) {
      filteredData = filteredData.filter(p => 
        p.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (period) {
      // Filter by date range based on period
      const now = new Date();
      const filterDate = new Date();
      
      switch (period) {
        case '7d':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          filterDate.setDate(now.getDate() - 90);
          break;
        default:
          break;
      }
      
      if (period !== 'all') {
        filteredData = filteredData.filter(p => 
          new Date(p.completedAt) >= filterDate
        );
      }
    }
    
    // Calculate individual stats
    const userStats = {};
    filteredData.forEach(performance => {
      if (!userStats[performance.userId]) {
        userStats[performance.userId] = {
          userId: performance.userId,
          userName: performance.userName,
          totalQuizzes: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0,
          worstScore: 100,
          totalTimeSpent: 0,
          categories: new Set()
        };
      }
      
      const stats = userStats[performance.userId];
      stats.totalQuizzes++;
      stats.totalScore += performance.score;
      stats.averageScore = stats.totalScore / stats.totalQuizzes;
      stats.bestScore = Math.max(stats.bestScore, performance.score);
      stats.worstScore = Math.min(stats.worstScore, performance.score);
      stats.totalTimeSpent += performance.timeSpent;
      stats.categories.add(performance.category);
    });
    
    const performanceStats = Object.values(userStats).map(stats => ({
      ...stats,
      categories: Array.from(stats.categories),
      averageTimePerQuiz: Math.round(stats.totalTimeSpent / stats.totalQuizzes)
    }));
    
    return NextResponse.json({
      performance: performanceStats,
      individualScores: filteredData,
      summary: {
        totalParticipants: performanceStats.length,
        overallAverage: performanceStats.reduce((acc, stat) => acc + stat.averageScore, 0) / performanceStats.length,
        totalQuizzes: filteredData.length
      }
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}