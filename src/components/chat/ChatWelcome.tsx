import tkLogo from '@/assets/tk-logo-new.webp';
import { Button } from '@/components/ui/button';

interface ChatWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  'O que é um Gerente de Projeto?',
  'Como fazer uma requisição de compra?',
  'Quais são os procedimentos de onboarding?',
  'Como reportar um problema técnico?',
];

export const ChatWelcome = ({ onSuggestionClick }: ChatWelcomeProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-20 h-20 rounded-full mb-4 flex items-center justify-center">
        <img
          src={tkLogo}
          alt="TK Solution Logo"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-foreground">
        Bem-vindo!
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Faça perguntas sobre procedimentos e receba respostas detalhadas instantaneamente.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onSuggestionClick(suggestion)}
            className="h-auto py-4 px-6 text-left justify-start hover:bg-accent"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};
