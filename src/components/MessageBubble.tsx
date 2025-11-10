import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  content: string;
  variant: 'user' | 'assistant';
}

export const MessageBubble = ({ content, variant }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: 'Copiado!',
        description: 'Texto copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao copiar o texto.',
      });
    }
  };

  return (
    <div
      className={cn(
        'mb-4 animate-fade-in group',
        variant === 'user' ? 'flex justify-end' : 'flex justify-start'
      )}
    >
      <div className="relative">
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
            img: ({ src, alt }) => {
              // Se a URL termina com .pdf, troca por -preview.jpg
              const imageSrc = src?.endsWith('.pdf') 
                ? src.replace('.pdf', '-preview.jpg')
                : src;
              
              return (
                <img 
                  src={imageSrc} 
                  alt={alt || ''} 
                  className="rounded-lg max-w-full h-auto my-2"
                />
              );
            },
          }}
        >
          {content}
          </ReactMarkdown>
        </div>
        
        {variant === 'assistant' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border shadow-sm"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
