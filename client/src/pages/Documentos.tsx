import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Upload } from "lucide-react";
import type { Document as Doc } from "@shared/schema";

export default function Documentos() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin, isDirecao } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "A redirecionar para login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: documents, isLoading } = useQuery<Doc[]>({
    queryKey: ["/api/documents"],
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return <DocumentosSkeleton />;
  }

  const canUpload = isAdmin || isDirecao;

  const groupedDocs = documents?.reduce((acc, doc) => {
    const tipo = doc.tipo || 'outros';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(doc);
    return acc;
  }, {} as Record<string, Doc[]>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Documentos</h1>
          <p className="text-muted-foreground">
            Aceda a atas, regulamentos e outros documentos importantes
          </p>
        </div>
        {canUpload && (
          <Button data-testid="button-upload-documento">
            <Upload className="h-4 w-4 mr-2" />
            Upload Documento
          </Button>
        )}
      </div>

      {isLoading ? (
        <DocumentosSkeleton />
      ) : documents && documents.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedDocs).map(([tipo, docs]) => (
            <div key={tipo}>
              <h2 className="text-xl font-semibold text-foreground mb-4 capitalize">
                {tipo === 'ata' ? 'Atas' : 
                 tipo === 'regulamento' ? 'Regulamentos' : 
                 tipo === 'relatorio' ? 'Relatórios' : 
                 'Outros Documentos'}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum documento disponível
            </h3>
            <p className="text-muted-foreground">
              Os documentos aparecerão aqui quando forem carregados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DocumentCard({ document }: { document: Doc }) {
  const handleDownload = () => {
    window.open(document.filePath, '_blank');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="hover-elevate active-elevate-2 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 truncate">
              {document.titulo}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {document.tipo}
              </Badge>
              <span>{formatFileSize(document.fileSize)}</span>
            </div>
          </div>
        </div>

        {document.categoria && (
          <p className="text-sm text-muted-foreground mb-4">
            {document.categoria}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <span>
            {new Date(document.createdAt!).toLocaleDateString('pt-PT')}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            data-testid={`button-download-${document.id}`}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentosSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
