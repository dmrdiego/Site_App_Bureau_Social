import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, Calendar, User, Shield } from "lucide-react";

export default function Perfil() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading, isAdmin, isDirecao } = useAuth();

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

  if (authLoading || !isAuthenticated || !user) {
    return <PerfilSkeleton />;
  }

  const getCategoriaLabel = (categoria?: string | null) => {
    const labels = {
      fundador: "Sócio Fundador",
      efetivo: "Sócio Efetivo",
      contribuinte: "Sócio Contribuinte",
    };
    return labels[categoria as keyof typeof labels] || categoria || "Não definido";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-perfil">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Informações da sua conta de associado
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informação Pessoal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-foreground mb-1" data-testid="text-nome-completo">
                {user.firstName} {user.lastName}
              </h3>
              <Badge variant="secondary" className="mb-2" data-testid="badge-categoria">
                {getCategoriaLabel(user.categoria)}
              </Badge>
              {isAdmin && (
                <Badge variant="default" className="mb-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrador
                </Badge>
              )}
              {isDirecao && !isAdmin && (
                <Badge variant="default" className="mb-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Direção
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InfoItem
                icon={Mail}
                label="Email"
                value={user.email || "Não definido"}
                testId="info-email"
              />
              <InfoItem
                icon={Phone}
                label="Telefone"
                value={user.telefone || "Não definido"}
              />
              <InfoItem
                icon={User}
                label="Número de Sócio"
                value={user.numeroSocio || "Não atribuído"}
              />
              <InfoItem
                icon={Calendar}
                label="Data de Adesão"
                value={user.dataAdesao 
                  ? new Date(user.dataAdesao).toLocaleDateString('pt-PT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : "Não definida"
                }
              />
              <InfoItem
                icon={Calendar}
                label="Membro desde"
                value={new Date(user.createdAt!).toLocaleDateString('pt-PT', {
                  month: 'long',
                  year: 'numeric'
                })}
              />
              <InfoItem
                icon={User}
                label="Status"
                value={
                  <Badge variant={user.ativo ? "default" : "destructive"}>
                    {user.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Participação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <StatItem
              label="Assembleias Participadas"
              value="12"
              description="Últimos 12 meses"
            />
            <StatItem
              label="Votações Realizadas"
              value="28"
              description="Total"
            />
            <StatItem
              label="Taxa de Participação"
              value="85%"
              description="Média"
            />
            <StatItem
              label="Documentos Acedidos"
              value="45"
              description="Total"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, testId }: {
  icon: any;
  label: string;
  value: React.ReactNode;
  testId?: string;
}) {
  return (
    <div className="flex items-start gap-3" data-testid={testId}>
      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground mb-1">{label}</div>
        <div className="font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function StatItem({ label, value, description }: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm font-medium text-foreground mb-1">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  );
}

function PerfilSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-5 w-24 mx-auto" />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
