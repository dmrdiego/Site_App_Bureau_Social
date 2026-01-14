import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Vote, FileText, Bell, ArrowRight, ShieldCheck, AlertCircle, MessageSquare, CreditCard, BookOpen } from "lucide-react";
import { Link } from "wouter";
import type { Assembly, VotingItem, Document as Doc } from "@shared/schema";
import { ContactBoardDialog } from "@/components/ui/../ContactBoardDialog";
import { useState } from "react";

interface DashboardSummary {
  upcomingAssemblies: number;
  pendingVotes: number;
  recentDocuments: number;
  unreadNotifications: number;
  assemblies: Assembly[];
  votingItems: VotingItem[];
  documents: Doc[];
  memberStatus?: {
    quotaStatus: string;
    isRegularized: boolean;
    quotaYear: number;
  };
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);

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

  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-welcome">
          {t('dashboard.welcome', { name: user?.firstName })}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.summary')}
        </p>
      </div>

      {/* CRM: Member Hub Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Member Status Card */}
        <Card className="md:col-span-2 border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Área do Associado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 space-y-2 text-center md:text-left">
                <div className="text-xl font-bold">{user?.firstName} {user?.lastName}</div>
                <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                  <Badge variant="outline">Sócio nº {user?.numeroSocio || "N/A"}</Badge>
                  <Badge variant="secondary" className="capitalize">{user?.categoria || "Associado"}</Badge>
                </div>
              </div>

              <div className="h-12 w-px bg-border hidden md:block"></div>

              <div className="flex-1 space-y-2 text-center">
                <div className="text-sm text-muted-foreground">Estado das Quotas ({summary?.memberStatus?.quotaYear || new Date().getFullYear()})</div>
                <div className="flex justify-center">
                  {summary?.memberStatus?.isRegularized ? (
                    <Badge className="bg-green-600 hover:bg-green-700 text-base px-4 py-1">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Regularizado
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-base px-4 py-1">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Pagamento Pendente
                    </Badge>
                  )}
                </div>
                {!summary?.memberStatus?.isRegularized && (
                  <Button variant="ghost" size="sm" asChild className="h-auto p-0 text-destructive hover:bg-transparent hover:underline">
                    <Link href="/quotas">Regularizar agora <ArrowRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                )}
              </div>

              <div className="h-12 w-px bg-border hidden md:block"></div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button onClick={() => setContactOpen(true)} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Fale com a Direção
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/quotas">
                    <CreditCard className="h-4 w-4 mr-2" />
                    As Minhas Quotas
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Acesso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" asChild className="w-full justify-start h-auto py-2">
              <Link href="/documentos?tipo=regulamento">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Estatutos & Regulamentos</span>
                  <span className="text-xs text-muted-foreground">Consulte as regras da associação</span>
                </div>
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-start h-auto py-2">
              <Link href="/perfil">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Meu Cartão Digital</span>
                  <span className="text-xs text-muted-foreground">Ver dados de associado</span>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <ContactBoardDialog open={contactOpen} onOpenChange={setContactOpen} />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.upcomingAssemblies')}
          value={summary?.upcomingAssemblies || 0}
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title={t('dashboard.pendingVotes')}
          value={summary?.pendingVotes || 0}
          icon={Vote}
          color="warning"
        />
        <StatCard
          title={t('dashboard.recentDocuments')}
          value={summary?.recentDocuments || 0}
          icon={FileText}
          color="secondary"
        />
        <StatCard
          title={t('dashboard.notifications')}
          value={summary?.unreadNotifications || 0}
          icon={Bell}
          color="accent"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Próximas Assembleias */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">{t('dashboard.upcomingAssemblies')}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/assembleias" data-testid="link-ver-todas-assembleias">
                <span className="flex items-center gap-1">
                  {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingList />
            ) : summary?.assemblies && summary.assemblies.length > 0 ? (
              <div className="space-y-4">
                {summary.assemblies.map((assembly: Assembly) => (
                  <AssemblyItem key={assembly.id} assembly={assembly} />
                ))}
              </div>
            ) : (
              <EmptyState message={t('dashboard.noAssemblies')} />
            )}
          </CardContent>
        </Card>

        {/* Votações Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">{t('dashboard.pendingVotes')}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/votacoes" data-testid="link-ver-todas-votacoes">
                <span className="flex items-center gap-1">
                  {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingList />
            ) : summary?.votingItems && summary.votingItems.length > 0 ? (
              <div className="space-y-4">
                {summary.votingItems.map((item: VotingItem) => (
                  <VotingItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState message={t('dashboard.noVotes')} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documentos Recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">{t('dashboard.recentDocuments')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/documentos" data-testid="link-ver-todos-documentos">
              <span className="flex items-center gap-1">
                {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingList />
          ) : summary?.documents && summary.documents.length > 0 ? (
            <div className="space-y-3">
              {summary.documents.map((doc: Doc) => (
                <DocumentItem key={doc.id} document={doc} />
              ))}
            </div>
          ) : (
            <EmptyState message={t('dashboard.noDocuments')} />
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
  const { t, i18n } = useTranslation();

  const getStatusBadge = (status: string): "default" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      agendada: "default",
      em_curso: "secondary",
      encerrada: "outline",
    };
    return variants[status] || "default";
  };

  const locale = i18n.language === 'en' ? 'en-US' : 'pt-PT';

  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover-elevate active-elevate-2">
      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-foreground truncate">{assembly.titulo}</h4>
          <Badge variant={getStatusBadge(assembly.status!)} className="flex-shrink-0">
            {t(`dashboard.status.${assembly.status}`)}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(assembly.dataAssembleia).toLocaleDateString(locale, {
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
  const { t } = useTranslation();

  return (
    <div className="p-3 rounded-md hover-elevate active-elevate-2">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-foreground">{item.titulo}</h4>
        <Badge variant="secondary" className="flex-shrink-0">
          {t(`dashboard.status.${item.status}`)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {item.descricao}
      </p>
      <Button size="sm" asChild data-testid={`button-votar-${item.id}`}>
        <Link href={`/votacoes/${item.id}`}>
          <Vote className="mr-2 h-4 w-4" />
          {t('dashboard.voteNow')}
        </Link>
      </Button>
    </div>
  );
}

function DocumentItem({ document }: { document: Doc }) {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en-US' : 'pt-PT';

  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover-elevate active-elevate-2">
      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">{document.titulo}</div>
        <div className="text-sm text-muted-foreground">
          {new Date(document.createdAt!).toLocaleDateString(locale)}
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
