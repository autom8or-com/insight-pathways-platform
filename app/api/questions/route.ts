import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server-auth';

// Mock questions data - in a real implementation this would come from a database
const mockQuestions = [
  {
    id: '1',
    type: 'multiple-choice',
    question: 'What is the primary purpose of performance reviews?',
    options: [
      'To evaluate past performance',
      'To set future goals and development',
      'To determine compensation',
      'All of the above'
    ],
    correctAnswer: 3,
    category: 'HR Management',
    difficulty: 'medium'
  },
  {
    id: '2',
    type: 'multiple-choice',
    question: 'Which leadership style is most effective for team collaboration?',
    options: [
      'Autocratic',
      'Democratic',
      'Laissez-faire',
      'Transactional'
    ],
    correctAnswer: 1,
    category: 'Leadership',
    difficulty: 'medium'
  },
  {
    id: '3',
    type: 'multiple-choice',
    question: 'What is the key principle of continuous improvement?',
    options: [
      'Perfection is achievable',
      'Small, incremental changes over time',
      'Radical transformation only',
      'Maintaining current processes'
    ],
    correctAnswer: 1,
    category: 'Process Improvement',
    difficulty: 'easy'
  },
  {
    id: '4',
    type: 'multiple-choice',
    question: 'Which metric is most important for measuring customer satisfaction?',
    options: [
      'Revenue generated',
      'Net Promoter Score',
      'Number of support tickets',
      'Website traffic'
    ],
    correctAnswer: 1,
    category: 'Customer Service',
    difficulty: 'medium'
  },
  {
    id: '5',
    type: 'multiple-choice',
    question: 'What is the main benefit of cross-functional teams?',
    options: [
      'Reduced communication overhead',
      'Diverse perspectives and expertise',
      'Faster decision making',
      'Lower costs'
    ],
    correctAnswer: 1,
    category: 'Team Management',
    difficulty: 'easy'
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['manager', 'admin', 'executive']);
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let filteredQuestions = mockQuestions;
    
    if (category) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.difficulty === difficulty.toLowerCase()
      );
    }
    
    const questions = filteredQuestions.slice(0, limit);
    
    return NextResponse.json({
      questions,
      total: questions.length,
      categories: [...new Set(mockQuestions.map(q => q.category))],
      difficulties: [...new Set(mockQuestions.map(q => q.difficulty))]
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}