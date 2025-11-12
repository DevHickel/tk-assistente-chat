import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AdminDocuments } from '@/components/admin/AdminDocuments';
import { AdminLogs } from '@/components/admin/AdminLogs';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminInviteUsers } from '@/components/admin/AdminInviteUsers';
import { Settings } from 'lucide-react';

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/chat');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/chat')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">Painel Admin</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações de Design
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6 space-y-6">
            <AdminInviteUsers />
            <AdminUsers />
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <AdminLogs />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <AdminDocuments />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
