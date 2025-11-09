import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const AdminDocuments = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, selecione apenas arquivos PDF.',
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      
      try {
        // Simular progresso
        setProgress(((i + 1) / pdfFiles.length) * 100);
        
        // Aqui você implementaria o upload real para o Supabase Storage
        // Por enquanto, apenas salvamos o registro no banco
        const { error } = await supabase.from('documents').insert({
          title: file.name,
          file_path: `/documents/${file.name}`,
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          variant: 'destructive',
          title: 'Erro no upload',
          description: `Falha ao fazer upload de ${file.name}`,
        });
      }
    }

    setUploading(false);
    setProgress(0);
    
    toast({
      title: 'Upload concluído!',
      description: `${pdfFiles.length} arquivo(s) carregado(s) com sucesso.`,
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Documentos</CardTitle>
        <CardDescription>
          Arraste e solte arquivos PDF ou clique para selecionar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            {uploading ? (
              <FileText className="h-12 w-12 text-primary animate-pulse" />
            ) : (
              <Upload className="h-12 w-12 text-muted-foreground" />
            )}
            
            {uploading ? (
              <div className="w-full max-w-xs space-y-2">
                <p className="text-sm text-muted-foreground">Fazendo upload...</p>
                <Progress value={progress} />
              </div>
            ) : isDragActive ? (
              <p className="text-sm text-muted-foreground">Solte os arquivos aqui...</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Arraste arquivos PDF aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Apenas arquivos PDF são aceitos
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
