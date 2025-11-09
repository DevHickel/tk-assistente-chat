import { Plus, MessageSquare, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  sessions: Array<{ id: string; title: string; created_at: string }>;
  currentSession: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatSidebar = ({
  sessions,
  currentSession,
  onSelectSession,
  onNewChat,
  isOpen,
  onToggle,
}: ChatSidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Button onClick={onNewChat} className="flex-1 mr-2">
              <Plus className="h-4 w-4 mr-2" />
              Novo Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    currentSession === session.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent text-foreground'
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{session.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
};
