import { Plus, MessageSquare, MoreVertical, Pin, Trash2 } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-3">
            {!isCollapsed ? (
              <Button onClick={onNewChat} className="w-full h-10">
                <Plus className="h-4 w-4 mr-2" />
                Novo Chat
              </Button>
            ) : (
              <Button onClick={onNewChat} size="icon" className="w-full h-10">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <SidebarMenu className="gap-1">
                {sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <div className="group relative flex items-center w-full">
                      <SidebarMenuButton
                        onClick={() => onSelectSession(session.id)}
                        isActive={currentSession === session.id}
                        tooltip={isCollapsed ? session.title : undefined}
                        className="flex-1 pr-1"
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        {!isCollapsed && (
                          <span className="flex-1 truncate text-left ml-2">
                            {session.title}
                          </span>
                        )}
                      </SidebarMenuButton>
                      
                      {!isCollapsed && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-popover">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement pin functionality
                                console.log('Pin chat:', session.id);
                              }}
                            >
                              <Pin className="h-4 w-4 mr-2" />
                              Fixar conversa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir conversa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
