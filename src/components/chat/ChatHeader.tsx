import { LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import tkLogo from '@/assets/tk-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const ChatHeader = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <SidebarTrigger />
          <img
            src={tkLogo}
            alt="TK Solution Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-contain bg-black p-1 shrink-0"
          />
          <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-foreground truncate">
            <span className="hidden md:inline">Assistente de Procedimentos TK Solution</span>
            <span className="hidden sm:inline md:hidden">TK Solution</span>
            <span className="sm:hidden">TK</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs sm:text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Painel Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
