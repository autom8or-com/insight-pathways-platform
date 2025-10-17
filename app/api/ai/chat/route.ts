import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server-auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define interfaces for request/response
interface ChatRequest {
  userId: string;
  role: string;
  query: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify user has appropriate role (Manager or Executive)
    const session = await requireRole(['manager', 'executive', 'admin']);
    
    const body: ChatRequest = await request.json();
    const { userId, role, query } = body;
    
    // Validate input
    if (!userId || !role || !query) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, role, query' },
        { status: 400 }
      );
    }
    
    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }
    
    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 3000);
    });
    
    const chatPromise = performChatQuery(userId, role, query);
    
    const result = await Promise.race([chatPromise, timeoutPromise]);
    
    return NextResponse.json({
      success: true,
      response: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in AI chat:', error);
    
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Request took too long to process. Please try again.' },
        { status: 408 }
      );
    }
    
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}

async function performChatQuery(userId: string, role: string, query: string): Promise<string> {
  try {
    // Fetch contextual data from existing APIs
    const [questionsResponse, performanceResponse] = await Promise.all([
      fetchContextualData('/api/questions', { limit: '20' }),
      fetchContextualData('/api/performance', { type: 'team', period: '30d' })
    ]);
    
    const questionsData = questionsResponse.success ? questionsResponse.data : null;
    const performanceData = performanceResponse.success ? performanceResponse.data : null;
    
    // Create a comprehensive system prompt with context
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are an AI assistant specializing in organizational learning and performance insights for Blackcod Group. You help managers and executives analyze quiz performance, identify knowledge gaps, and make data-driven decisions about employee development.

Your role is to provide:
- Actionable insights based on quiz and performance data
- Recommendations for improving team knowledge and skills
- Analysis of learning trends and patterns
- Suggestions for targeted training interventions

You have access to current organizational quiz and performance data. Use this information to provide specific, data-driven answers. When appropriate, reference specific scores, categories, or trends in the data.

Guidelines:
- Be concise but thorough
- Focus on actionable insights
- Use the provided data to support your recommendations
- If you don't have enough data for a specific question, acknowledge this limitation
- Maintain a professional, analytical tone
- Prioritize practical suggestions over theoretical concepts

Current organizational context:
- You are assisting a ${role} at Blackcod Group
- The user ID is: ${userId}
- Available data includes: recent quiz questions, team performance metrics, category breakdowns, and trend data`
    };
    
    // Create user message with context
    let contextualQuery = query;
    
    if (questionsData || performanceData) {
      contextualQuery = `Question: ${query}

Available Context Data:
${questionsData ? `- Questions: ${questionsData.questions?.length || 0} questions across categories: ${questionsData.categories?.join(', ') || 'N/A'}` : ''}
${performanceData ? `- Team Performance: Overall average ${performanceData.overallStats?.averageScore || 'N/A'}%, Completion rate ${performanceData.overallStats?.completionRate || 'N/A'}%` : ''}

Please use this context to provide a specific, data-informed response.`;
    }
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: contextualQuery
    };
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemPrompt, userMessage],
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
    });
    
    return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try rephrasing your question.';
    
  } catch (error) {
    console.error('Error in OpenAI call:', error);
    throw error;
  }
}

async function fetchContextualData(endpoint: string, params: Record<string, string> = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Note: In a real implementation, you'd need to handle authentication properly
      // For now, we'll make the call without auth headers since this is an internal API call
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
    
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}