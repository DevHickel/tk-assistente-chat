import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface ChatSidebarProps {
  sessions: Array<{ id: string; title: string; created_at: string }>;
  currentSession: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export const ChatSidebar = ({
  sessions,
  currentSession,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatSidebarProps) => {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3">
            <Button onClick={onNewChat} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Novo Chat
            </Button>
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <SidebarMenu className="px-2">
                {sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <div
                      className={cn(
                        'group relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                        currentSession === session.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent text-foreground'
                      )}
                    >
                      <button
                        onClick={() => onSelectSession(session.id)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="truncate">{session.title}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="shrink-0 p-1.5 hover:bg-destructive/20 rounded transition-colors"
                        title="Excluir conversa"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
