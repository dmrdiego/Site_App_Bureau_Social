import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Vote, Clock, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { VotingItem } from "@shared/schema";

function VotingButtons({ votingItemId }: { votingItemId: number }) {
  const { toast } = useToast();
  const [hasVoted, setHasVoted] = useState(false);

  const voteMutation = useMutation({
    mutationFn: async (voto: string) => {
      const res = await apiRequest('POST', '/api/votes', {
        votingItemId,
        voto,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao votar');
      }
      return res.json();
    },
    onSuccess: () => {
      setHasVoted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/voting-items'] });
      toast({
        title: "Voto registado com sucesso",
        description: "O seu voto foi registado",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao votar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex gap-3 pt-4 border-t flex-wrap">
      <Button
        onClick={() => voteMutation.mutate('a_favor')}
        disabled={voteMutation.isPending || hasVoted}
        variant="default"
        data-testid={`button-vote-favor-${votingItemId}`}
      >
        <ThumbsUp className="h-4 w-4 mr-2" />
        A Favor
      </Button>
      <Button
        onClick={() => voteMutation.mutate('contra')}
        disabled={voteMutation.isPending || hasVoted}
        variant="destructive"
        data-testid={`button-vote-contra-${votingItemId}`}
      >
        <ThumbsDown className="h-4 w-4 mr-2" />
        Contra
      </Button>
      <Button
        onClick={() => voteMutation.mutate('abstencao')}
        disabled={voteMutation.isPending || hasVoted}
        variant="outline"
        data-testid={`button-vote-abstencao-${votingItemId}`}
      >
        <Minus className="h-4 w-4 mr-2" />
        Abstenção
      </Button>
    </div>
  );
}

export default function Votacoes() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: votingItems, isLoading } = useQuery<VotingItem[]>({
    queryKey: ["/api/voting-items"],
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return <VotacoesSkeleton />;
  }

  const openItems = votingItems?.filter(item => item.status === 'aberta') || [];
  const pendingItems = votingItems?.filter(item => item.status === 'pendente') || [];
  const closedItems = votingItems?.filter(item => item.status === 'encerrada') || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('votes.title')}</h1>
        <p className="text-muted-foreground">
          {t('votes.subtitle')}
        </p>
      </div>

      {/* Votações Abertas */}
      {openItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Votações Abertas
          </h2>
          <div className="grid gap-4">
            {openItems.map((item) => (
              <VotingItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Votações Pendentes */}
      {pendingItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Aguardando Abertura
          </h2>
          <div className="grid gap-4">
            {pendingItems.map((item) => (
              <VotingItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Votações Encerradas */}
      {closedItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Votações Encerradas
          </h2>
          <div className="grid gap-4">
            {closedItems.map((item) => (
              <VotingItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <VotacoesSkeleton />
      ) : !votingItems || votingItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma votação disponível
            </h3>
            <p className="text-muted-foreground">
              As votações aparecerão aqui quando forem criadas
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function VotingItemCard({ item }: { item: VotingItem }) {
  const getStatusConfig = (status: string) => {
    const configs = {
      aberta: {
        variant: "default" as const,
        icon: Vote,
        color: "text-primary",
      },
      pendente: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
      },
      encerrada: {
        variant: "outline" as const,
        icon: CheckCircle2,
        color: "text-muted-foreground",
      },
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const config = getStatusConfig(item.status!);
  const StatusIcon = config.icon;

  return (
    <Card className="hover-elevate active-elevate-2 transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{item.titulo}</CardTitle>
              <Badge variant={config.variant}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {item.status}
              </Badge>
            </div>
            {item.tipo && (
              <Badge variant="outline" className="mt-1">
                {item.tipo === 'simples' ? 'Maioria Simples' : 
                 item.tipo === 'qualificada' ? 'Maioria Qualificada (2/3)' : 
                 'Votação Secreta'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{item.descricao}</p>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {item.quorumNecessario && (
            <div>
              <span className="font-medium">Quórum:</span> {item.quorumNecessario}%
            </div>
          )}
          {item.dataAbertura && (
            <div>
              <span className="font-medium">Abertura:</span>{' '}
              {new Date(item.dataAbertura).toLocaleDateString('pt-PT')}
            </div>
          )}
          {item.dataEncerramento && (
            <div>
              <span className="font-medium">Encerramento:</span>{' '}
              {new Date(item.dataEncerramento).toLocaleDateString('pt-PT')}
            </div>
          )}
        </div>

        {item.status === 'encerrada' && item.resultado && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-foreground mb-3">Resultado:</h4>
            <ResultsDisplay resultado={item.resultado} />
          </div>
        )}

        {item.status === 'aberta' && (
          <VotingButtons votingItemId={item.id!} />
        )}
      </CardContent>
    </Card>
  );
}

function ResultsDisplay({ resultado }: { resultado: any }) {
  const total = (resultado.aprovar || 0) + (resultado.rejeitar || 0) + (resultado.abstencao || 0);
  
  if (total === 0) {
    return <div className="text-sm text-muted-foreground">Nenhum voto registado</div>;
  }

  return (
    <div className="space-y-3">
      <ResultBar
        label="Aprovar"
        count={resultado.aprovar || 0}
        total={total}
        color="bg-green-500"
      />
      <ResultBar
        label="Rejeitar"
        count={resultado.rejeitar || 0}
        total={total}
        color="bg-red-500"
      />
      <ResultBar
        label="Abstenção"
        count={resultado.abstencao || 0}
        total={total}
        color="bg-gray-500"
      />
      <div className="pt-2 text-sm">
        <span className="font-medium">Total de votos:</span> {total}
      </div>
    </div>
  );
}

function ResultBar({ label, count, total, color }: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function VotacoesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
