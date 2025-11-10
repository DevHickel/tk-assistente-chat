import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatWelcome } from '@/components/chat/ChatWelcome';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider } from '@/components/ui/sidebar';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  pinned: boolean;
}

export default function Chat() {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession);
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setSessions(data);
    }
  };

  const loadMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(
        data.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          timestamp: new Date(msg.created_at),
        }))
      );
    }
  };

  const createNewSession = async () => {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user?.id })
      .select()
      .single();

    if (!error && data) {
      setCurrentSession(data.id);
      setMessages([]);
      await loadSessions();
    }
  };

  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (!error) {
      if (currentSession === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
      await loadSessions();
      toast({
        title: 'Conversa excluída',
        description: 'A conversa foi removida com sucesso.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir a conversa.',
      });
    }
  };

  const togglePinSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const { error } = await supabase
      .from('chat_sessions')
      .update({ pinned: !session.pinned })
      .eq('id', sessionId);

    if (!error) {
      await loadSessions();
      toast({
        title: session.pinned ? 'Conversa desafixada' : 'Conversa fixada',
        description: session.pinned 
          ? 'A conversa foi desafixada com sucesso.'
          : 'A conversa foi fixada no topo.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível fixar a conversa.',
      });
    }
  };

  const updateSessionTitle = async (sessionId: string, firstMessage: string) => {
    // Generate a title from the first message (first 50 chars or until first sentence end)
    let title = firstMessage.trim();
    const sentenceEnd = title.match(/[.!?]/);
    if (sentenceEnd && sentenceEnd.index) {
      title = title.substring(0, sentenceEnd.index + 1);
    }
    if (title.length > 50) {
      title = title.substring(0, 50) + '...';
    }

    await supabase
      .from('chat_sessions')
      .update({ title })
      .eq('id', sessionId);
    
    await loadSessions();
  };

  const saveMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!currentSession) return;

    await supabase.from('chat_messages').insert({
      session_id: currentSession,
      role,
      content,
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSession) {
      await createNewSession();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await saveMessage(content, 'user');
    
    // Update session title if this is the first message
    if (messages.length === 0) {
      await updateSessionTitle(currentSession, content);
    }
    
    setIsLoading(true);

    try {
      // Call N8N through edge function
      const { data, error } = await supabase.functions.invoke('n8n-proxy', {
        body: { message: content }
      });

      if (error) throw error;
      
      const assistantResponse = data.response;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage(assistantResponse, 'assistant');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao enviar a mensagem. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <ChatSidebar
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={setCurrentSession}
          onNewChat={createNewSession}
          onDeleteSession={deleteSession}
          onTogglePinSession={togglePinSession}
        />

        <div className="flex flex-col flex-1">
          <ChatHeader />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-6">
              {messages.length === 0 ? (
                <ChatWelcome onSuggestionClick={handleSuggestionClick} />
              ) : (
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  conversationEndRef={conversationEndRef}
                />
              )}
            </div>
          </main>

          <div className="max-w-4xl mx-auto w-full">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
