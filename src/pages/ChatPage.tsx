import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ChatInput } from '@/components/ChatInput';
import { Bot } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  /**
   * Developer Integration Note:
   * This function handles sending user messages to the backend API.
   * 
   * Current implementation flow:
   * 1. Captures the user's input text
   * 2. URL-encodes the text for safe transmission
   * 3. Makes a GET request to the API endpoint
   * 4. Receives plain text response and adds it to conversation
   * 
   * API Endpoint: https://n8n.vetorix.com.br/webhook-test/348a4f7f-7692-48de-98ae-85917e3c87c8
   * 
   * To integrate with your backend:
   * - Replace the API_ENDPOINT constant with your webhook URL
   * - Modify the request method if needed (GET/POST)
   * - Adjust response parsing based on your API format
   * - Add error handling for network failures
   * - Consider adding authentication headers if required
   */
  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // URL encode the user's message
      const encodedMessage = encodeURIComponent(content);
      
      // API endpoint - replace with your actual endpoint
      const API_ENDPOINT = 'https://n8n.vetorix.com.br/webhook-test/348a4f7f-7692-48de-98ae-85917e3c87c8';
      
      // Make GET request to the API
      const response = await fetch(`${API_ENDPOINT}?message=${encodedMessage}`);
      
      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      // Parse the plain text response
      const assistantResponse = await response.text();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Assistente de Procedimentos TK Solutions
          </h1>
        </div>
      </header>

      {/* Conversation Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-foreground">
                Bem-vindo ao Assistente TK Solutions
              </h2>
              <p className="text-muted-foreground max-w-md">
                Faça perguntas sobre procedimentos e receba respostas detalhadas instantaneamente.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  variant={message.role}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={conversationEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Chat Input */}
      <div className="max-w-4xl mx-auto w-full">
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
