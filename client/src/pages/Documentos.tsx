import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, Upload, X, Edit2, Trash2, Search } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Document as Doc } from "@shared/schema";

export default function Documentos() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin, isDirecao } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterVisibilidade, setFilterVisibilidade] = useState<string>("todos");

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

  const canManage = isAdmin || isDirecao;

  // Filter and search documents
  const filteredDocs = documents?.filter(doc => {
    const matchesSearch = doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === "todos" || doc.tipo === filterTipo;
    const matchesVisibilidade = filterVisibilidade === "todos" || doc.visivelPara === filterVisibilidade;
    
    return matchesSearch && matchesTipo && matchesVisibilidade;
  }) || [];

  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    const tipo = doc.tipo || 'outros';
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(doc);
    return acc;
  }, {} as Record<string, Doc[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Documentos</h1>
          <p className="text-muted-foreground">
            Aceda a atas, regulamentos e outros documentos importantes
          </p>
        </div>
        {canManage && (
          <Button 
            onClick={() => setUploadDialogOpen(true)}
            data-testid="button-upload-documento"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documento
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por título ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter-tipo">Tipo</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger id="filter-tipo" data-testid="select-filter-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ata">Atas</SelectItem>
                  <SelectItem value="regulamento">Regulamentos</SelectItem>
                  <SelectItem value="relatorio">Relatórios</SelectItem>
                  <SelectItem value="outro">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-visibilidade">Visibilidade</Label>
              <Select value={filterVisibilidade} onValueChange={setFilterVisibilidade}>
                <SelectTrigger id="filter-visibilidade" data-testid="select-filter-visibilidade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="direcao">Direção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <DocumentosSkeleton />
      ) : filteredDocs.length > 0 ? (
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
                  <DocumentCard key={doc.id} document={doc} canManage={canManage} />
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
              {searchTerm || filterTipo !== "todos" || filterVisibilidade !== "todos" 
                ? "Nenhum documento encontrado"
                : "Nenhum documento disponível"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || filterTipo !== "todos" || filterVisibilidade !== "todos"
                ? "Tente ajustar os filtros de busca"
                : "Os documentos aparecerão aqui quando forem carregados"}
            </p>
          </CardContent>
        </Card>
      )}

      {canManage && (
        <UploadDialog 
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
        />
      )}
    </div>
  );
}

function DocumentCard({ document, canManage }: { document: Doc; canManage: boolean }) {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDownload = () => {
    window.open(`/api/documents/${document.id}/download`, '_blank');
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/documents/${document.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir documento');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso!",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
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

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {new Date(document.createdAt!).toLocaleDateString('pt-PT')}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                data-testid={`button-download-${document.id}`}
              >
                <Download className="h-4 w-4" />
              </Button>
              {canManage && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditDialogOpen(true)}
                    data-testid={`button-edit-${document.id}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteDialogOpen(true)}
                    data-testid={`button-delete-${document.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {canManage && (
        <EditDocumentDialog
          document={document}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{document.titulo}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "A excluir..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function EditDocumentDialog({ 
  document, 
  open, 
  onOpenChange 
}: { 
  document: Doc; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [titulo, setTitulo] = useState(document.titulo);
  const [tipo, setTipo] = useState(document.tipo);
  const [categoria, setCategoria] = useState(document.categoria || "");
  const [visivelPara, setVisivelPara] = useState(document.visivelPara);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/documents/${document.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          tipo,
          categoria: categoria || null,
          visivelPara,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar documento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Sucesso",
        description: "Documento atualizado com sucesso!",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!titulo || !tipo) {
      toast({
        title: "Erro",
        description: "Título e tipo são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-titulo">Título *</Label>
            <Input
              id="edit-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              data-testid="input-edit-titulo"
            />
          </div>

          <div>
            <Label htmlFor="edit-tipo">Tipo *</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="edit-tipo" data-testid="select-edit-tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ata">Ata</SelectItem>
                <SelectItem value="regulamento">Regulamento</SelectItem>
                <SelectItem value="relatorio">Relatório</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-categoria">Categoria</Label>
            <Input
              id="edit-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              data-testid="input-edit-categoria"
            />
          </div>

          <div>
            <Label htmlFor="edit-visibilidade">Visibilidade *</Label>
            <Select value={visivelPara} onValueChange={setVisivelPara}>
              <SelectTrigger id="edit-visibilidade" data-testid="select-edit-visibilidade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="direcao">Direção</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-edit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            data-testid="button-save-edit"
          >
            {updateMutation.isPending ? "A guardar..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<string>("ata");
  const [categoria, setCategoria] = useState("");
  const [visivelPara, setVisivelPara] = useState<string>("todos");
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("Nenhum ficheiro selecionado");
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('titulo', titulo);
      formData.append('tipo', tipo);
      formData.append('visivelPara', visivelPara);
      if (categoria) formData.append('categoria', categoria);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Sucesso",
        description: "Documento carregado com sucesso!",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedFile(null);
    setTitulo("");
    setTipo("ata");
    setCategoria("");
    setVisivelPara("todos");
    onOpenChange(false);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!titulo) {
      setTitulo(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = () => {
    if (!selectedFile || !titulo || !tipo) {
      toast({
        title: "Erro",
        description: "Por favor preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleFileSelect(files[0]);
                }
              }}
            />
            
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  data-testid="button-remove-file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium mb-1">
                  Clique ou arraste para selecionar ficheiro
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX ou TXT (máx. 10MB)
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Nome do documento"
                data-testid="input-titulo"
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger id="tipo" data-testid="select-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ata">Ata</SelectItem>
                  <SelectItem value="regulamento">Regulamento</SelectItem>
                  <SelectItem value="relatorio">Relatório</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="categoria">Categoria (opcional)</Label>
              <Input
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Ex: Assembleia Geral 2024"
                data-testid="input-categoria"
              />
            </div>

            <div>
              <Label htmlFor="visibilidade">Visibilidade *</Label>
              <Select value={visivelPara} onValueChange={setVisivelPara}>
                <SelectTrigger id="visibilidade" data-testid="select-visibilidade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="direcao">Direção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || !titulo || uploadMutation.isPending}
            data-testid="button-upload"
          >
            {uploadMutation.isPending ? "A carregar..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
