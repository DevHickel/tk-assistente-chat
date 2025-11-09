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
}

export default function Chat() {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    setIsLoading(true);

    try {
      const conversationMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            messages: conversationMessages,
            sessionId: currentSession,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantContent += content;
              
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [
                  ...prev,
                  {
                    id: (Date.now() + 1).toString(),
                    content: assistantContent,
                    role: 'assistant',
                    timestamp: new Date(),
                  },
                ];
              });
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }

      await saveMessage(assistantContent, 'assistant');
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
    <div className="flex h-screen bg-background">
      <ChatSidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={setCurrentSession}
        onNewChat={createNewSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-col flex-1">
        <ChatHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

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
  );
}
