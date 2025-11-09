import { MessageBubble } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  conversationEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages = ({
  messages,
  isLoading,
  conversationEndRef,
}: ChatMessagesProps) => {
  return (
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
  );
};
