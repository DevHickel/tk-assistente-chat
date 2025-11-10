import tkLogo from '@/assets/tk-logo-new.webp';

export default function Index() {
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
          <a
            href="/auth"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2"
          >
            Começar
          </a>
        </div>
      </div>
    </div>
  );
}
