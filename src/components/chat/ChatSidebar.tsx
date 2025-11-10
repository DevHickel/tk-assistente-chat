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
  SidebarMenuButton,
  useSidebar,
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
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-3">
            {!isCollapsed ? (
              <Button onClick={onNewChat} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Novo Chat
              </Button>
            ) : (
              <Button onClick={onNewChat} size="icon" className="w-full">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <SidebarMenu className="px-2">
                {sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectSession(session.id)}
                      isActive={currentSession === session.id}
                      tooltip={isCollapsed ? session.title : undefined}
                      className={cn(
                        'group relative',
                        isCollapsed ? 'justify-center' : 'justify-start'
                      )}
                    >
                      <MessageSquare className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate">{session.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 shrink-0 p-1 hover:bg-destructive/20 rounded transition-opacity"
                            title="Excluir conversa"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </button>
                        </>
                      )}
                    </SidebarMenuButton>
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
