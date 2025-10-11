import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Bell, Shield, Palette } from "lucide-react";

export default function Configuracoes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem aceder às configurações.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, isAdmin, toast]);

  if (authLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  const configSections = [
    {
      icon: Database,
      title: "Base de Dados",
      description: "Configurações de base de dados e backups",
      status: "Ativo",
      badge: "success",
    },
    {
      icon: Bell,
      title: "Notificações",
      description: "Configurar notificações por email e no sistema",
      status: "Em desenvolvimento",
      badge: "warning",
    },
    {
      icon: Shield,
      title: "Segurança",
      description: "Definições de autenticação e permissões",
      status: "Ativo",
      badge: "success",
    },
    {
      icon: Palette,
      title: "Personalização",
      description: "Temas, cores e aspeto visual do portal",
      status: "Em desenvolvimento",
      badge: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Gerir configurações globais da aplicação
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {configSections.map((section, index) => (
          <Card key={index} className="hover-elevate active-elevate-2 transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={section.badge === "success" ? "default" : "secondary"}
                >
                  {section.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {section.badge === "warning" 
                  ? "Esta funcionalidade estará disponível em breve."
                  : "Clique para configurar estas opções."}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Versão da Aplicação</span>
            <span className="text-sm text-muted-foreground">1.0.0</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Ambiente</span>
            <Badge variant="outline">Development</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Base de Dados</span>
            <span className="text-sm text-muted-foreground">PostgreSQL (Neon)</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm font-medium">Autenticação</span>
            <span className="text-sm text-muted-foreground">Replit Auth (OIDC)</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium">Object Storage</span>
            <Badge variant="default">Configurado</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
