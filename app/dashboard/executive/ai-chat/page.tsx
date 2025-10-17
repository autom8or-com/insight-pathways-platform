import { Metadata } from 'next';
import AIChat from '@/components/AIChat';
import { requireRole } from '@/lib/server-auth';

export const metadata: Metadata = {
  title: 'AI Insights | Blackcod Insights Platform',
  description: 'Get AI-powered insights about your team\'s performance, knowledge gaps, and learning trends.',
};

export default async function AIChatPage() {
  // Server-side protection - only executives and admins can access
  await requireRole(['executive', 'admin']);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Insights</h2>
          <p className="text-muted-foreground">
            Ask questions about organizational performance, knowledge gaps, and learning trends
          </p>
        </div>
      </div>
      
      <div className="h-[calc(100vh-12rem)]">
        <AIChat />
      </div>
    </div>
  );
}