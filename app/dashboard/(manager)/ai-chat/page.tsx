import { Metadata } from 'next';
import AIChat from '@/components/AIChat';

export const metadata: Metadata = {
  title: 'AI Insights | Blackcod Insights Platform',
  description: 'Get AI-powered insights about your team\'s performance, knowledge gaps, and learning trends.',
};

export default function AIChatPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Insights</h2>
          <p className="text-muted-foreground">
            Ask questions about team performance, knowledge gaps, and learning trends
          </p>
        </div>
      </div>
      
      <div className="h-[calc(100vh-12rem)]">
        <AIChat />
      </div>
    </div>
  );
}