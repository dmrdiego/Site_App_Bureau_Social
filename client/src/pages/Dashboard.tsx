import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Vote, FileText, Bell, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { Assembly, VotingItem, Document as Doc, Notification } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to home if not authenticated
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

  const { data: summary, isLoading } = useQuery({
    queryKey: ["/api/dashboard/summary"],
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bem-vindo, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua atividade como associado do Bureau Social.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Próximas Assembleias"
          value={summary?.upcomingAssemblies || 0}
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Votações Pendentes"
          value={summary?.pendingVotes || 0}
          icon={Vote}
          color="warning"
        />
        <StatCard
          title="Documentos Recentes"
          value={summary?.recentDocuments || 0}
          icon={FileText}
          color="secondary"
        />
        <StatCard
          title="Notificações"
          value={summary?.unreadNotifications || 0}
          icon={Bell}
          color="accent"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Próximas Assembleias */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">Próximas Assembleias</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/assembleias" data-testid="link-ver-todas-assembleias">
                <span className="flex items-center gap-1">
                  Ver todas <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingList />
            ) : summary?.assemblies?.length > 0 ? (
              <div className="space-y-4">
                {summary.assemblies.map((assembly: Assembly) => (
                  <AssemblyItem key={assembly.id} assembly={assembly} />
                ))}
              </div>
            ) : (
              <EmptyState message="Nenhuma assembleia agendada no momento" />
            )}
          </CardContent>
        </Card>

        {/* Votações Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">Votações Pendentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/votacoes" data-testid="link-ver-todas-votacoes">
                <span className="flex items-center gap-1">
                  Ver todas <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingList />
            ) : summary?.votingItems?.length > 0 ? (
              <div className="space-y-4">
                {summary.votingItems.map((item: VotingItem) => (
                  <VotingItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState message="Nenhuma votação pendente no momento" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documentos Recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Documentos Recentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/documentos" data-testid="link-ver-todos-documentos">
              <span className="flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingList />
          ) : summary?.documents?.length > 0 ? (
            <div className="space-y-3">
              {summary.documents.map((doc: Doc) => (
                <DocumentItem key={doc.id} document={doc} />
              ))}
            </div>
          ) : (
            <EmptyState message="Nenhum documento disponível" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-amber-500/10 text-amber-500",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function AssemblyItem({ assembly }: { assembly: Assembly }) {
  const getStatusBadge = (status: string) => {
    const variants = {
      agendada: "default",
      em_curso: "secondary",
      encerrada: "outline",
    };
    return variants[status as keyof typeof variants] || "default";
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover-elevate active-elevate-2">
      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-foreground truncate">{assembly.titulo}</h4>
          <Badge variant={getStatusBadge(assembly.status!)} className="flex-shrink-0">
            {assembly.status}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(assembly.dataAssembleia).toLocaleDateString('pt-PT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

function VotingItemCard({ item }: { item: VotingItem }) {
  return (
    <div className="p-3 rounded-md hover-elevate active-elevate-2">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-foreground">{item.titulo}</h4>
        <Badge variant="secondary" className="flex-shrink-0">
          {item.status}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {item.descricao}
      </p>
      <Button size="sm" asChild data-testid={`button-votar-${item.id}`}>
        <Link href={`/votacoes/${item.id}`}>
          <a>Votar Agora</a>
        </Link>
      </Button>
    </div>
  );
}

function DocumentItem({ document }: { document: Doc }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover-elevate active-elevate-2">
      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">{document.titulo}</div>
        <div className="text-sm text-muted-foreground">
          {new Date(document.createdAt!).toLocaleDateString('pt-PT')}
        </div>
      </div>
      <Badge variant="outline">{document.tipo}</Badge>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      {message}
    </div>
  );
}

function LoadingList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
