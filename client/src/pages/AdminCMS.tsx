import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Edit3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sections = [
  { key: 'hero', label: 'Hero / Banner Principal' },
  { key: 'mission', label: 'Missão e Valores' },
  { key: 'services', label: 'Serviços' },
  { key: 'projects', label: 'Projetos' },
  { key: 'impact', label: 'Números de Impacto' },
  { key: 'contact', label: 'Informações de Contacto' },
];

export default function AdminCMS() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const [selectedSection, setSelectedSection] = useState('hero');
  const [editedContent, setEditedContent] = useState<any>({});

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem aceder ao CMS.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, isAdmin, toast]);

  const { data: cmsContent, isLoading } = useQuery({
    queryKey: ['/api/cms', selectedSection],
    enabled: isAuthenticated && isAdmin,
  });

  useEffect(() => {
    if (cmsContent) {
      setEditedContent(cmsContent.content || {});
    }
  }, [cmsContent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(
        'PUT',
        '/api/cms',
        {
          sectionKey: selectedSection,
          content: editedContent,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
      toast({
        title: "Sucesso",
        description: "Conteúdo atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar conteúdo: " + error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated || !isAdmin) {
    return <CMSSkeleton />;
  }

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedContent((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Editor de Conteúdo (CMS)
        </h1>
        <p className="text-muted-foreground">
          Edite o conteúdo do site público de forma simples e intuitiva
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Section Selector */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Secções do Site</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {sections.map((section) => (
                <Button
                  key={section.key}
                  variant={selectedSection === section.key ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedSection(section.key)}
                  data-testid={`button-section-${section.key}`}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {section.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0">
            <CardTitle>
              Editar: {sections.find(s => s.key === selectedSection)?.label}
            </CardTitle>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              data-testid="button-save-cms"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "A guardar..." : "Guardar Alterações"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <EditorSkeleton />
            ) : (
              <ContentEditor
                sectionKey={selectedSection}
                content={editedContent}
                onChange={handleFieldChange}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContentEditor({ sectionKey, content, onChange }: {
  sectionKey: string;
  content: any;
  onChange: (field: string, value: string) => void;
}) {
  switch (sectionKey) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título Principal</Label>
            <Input
              id="title"
              value={content.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="Negócios Sociais com Impacto Real"
              data-testid="input-hero-title"
            />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Textarea
              id="subtitle"
              value={content.subtitle || ''}
              onChange={(e) => onChange('subtitle', e.target.value)}
              placeholder="Instituto Português de Negócios Sociais..."
              rows={3}
              data-testid="input-hero-subtitle"
            />
          </div>
          <div>
            <Label htmlFor="ctaText">Texto do Botão Principal</Label>
            <Input
              id="ctaText"
              value={content.ctaText || ''}
              onChange={(e) => onChange('ctaText', e.target.value)}
              placeholder="Associar-se"
              data-testid="input-hero-cta"
            />
          </div>
        </div>
      );

    case 'mission':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="heading">Título da Secção</Label>
            <Input
              id="heading"
              value={content.heading || ''}
              onChange={(e) => onChange('heading', e.target.value)}
              placeholder="Nossa Missão e Valores"
              data-testid="input-mission-heading"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={content.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Acreditamos que os negócios podem ser uma força poderosa..."
              rows={4}
              data-testid="input-mission-description"
            />
          </div>
        </div>
      );

    case 'contact':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={content.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="info@bureauso cial.pt"
              data-testid="input-contact-email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={content.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="+351 210 000 000"
              data-testid="input-contact-phone"
            />
          </div>
          <div>
            <Label htmlFor="address">Morada</Label>
            <Textarea
              id="address"
              value={content.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Av. da Liberdade, 123\n1250-096 Lisboa"
              rows={3}
              data-testid="input-contact-address"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="content">Conteúdo (JSON)</Label>
            <Textarea
              id="content"
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  Object.keys(parsed).forEach(key => onChange(key, parsed[key]));
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={12}
              className="font-mono text-sm"
              data-testid="input-content-json"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Edite o conteúdo em formato JSON
            </p>
          </div>
        </div>
      );
  }
}

function EditorSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

function CMSSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
