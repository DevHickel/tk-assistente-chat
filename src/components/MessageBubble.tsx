import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  variant: 'user' | 'assistant';
}

export const MessageBubble = ({ content, variant }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        'mb-4 animate-fade-in',
        variant === 'user' ? 'flex justify-end' : 'flex justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm prose prose-sm max-w-none',
          variant === 'user'
            ? 'bg-[hsl(var(--chat-user-bg))] text-white prose-invert'
            : 'bg-[hsl(var(--chat-assistant-bg))] border border-[hsl(var(--chat-assistant-border))] dark:prose-invert dark:text-white text-gray-900'
        )}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            a: ({ href, children }) => (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:text-blue-600 underline"
              >
                {children}
              </a>
            ),
            img: ({ src, alt }) => (
              <img 
                src={src} 
                alt={alt || ''} 
                className="rounded-lg max-w-full h-auto my-2"
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
