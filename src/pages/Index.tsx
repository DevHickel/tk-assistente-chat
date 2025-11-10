import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import tkLogo from '@/assets/tk-logo-new.webp';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, redirect to chat
    if (!loading && user) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="text-center max-w-2xl">
        <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
          <img 
            src={tkLogo}
            alt="TK Solution Logo" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Assistente de Procedimentos TK Solution
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Seu assistente inteligente para consultar procedimentos e políticas da empresa
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate('/auth')}
            size="lg"
            className="px-8"
          >
            Começar
          </Button>
        </div>
      </div>
    </div>
  );
}
