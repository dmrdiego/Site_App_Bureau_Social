import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, FileText, Plus, Download, UserCheck, X } from "lucide-react";
import { Link } from "wouter";
import type { Assembly, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Assemblies() {
  const { t } = useTranslation();
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

  const { data: assemblies, isLoading } = useQuery<Assembly[]>({
    queryKey: ["/api/assemblies"],
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return <AssembliesSkeleton />;
  }

  const canCreate = isAdmin || isDirecao;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('assemblies.title')}</h1>
          <p className="text-muted-foreground">
            {t('assemblies.subtitle')}
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/assembleias/nova" data-testid="button-criar-assembleia">
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Assembleia
              </span>
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <AssembliesSkeleton />
      ) : assemblies && assemblies.length > 0 ? (
        <div className="grid gap-6">
          {assemblies.map((assembly) => (
            <AssemblyCard key={assembly.id} assembly={assembly} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma assembleia agendada
            </h3>
            <p className="text-muted-foreground">
              As assembleias futuras aparecerão aqui
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ProxyData {
  given: {
    id: number;
    receiverId: string;
    receiverName: string;
  } | null;
  received: Array<{
    id: number;
    giverId: string;
    giverName: string;
  }>;
}

function ProxyDialog({ assembly }: { assembly: Assembly }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users/for-proxy"],
    enabled: open,
  });

  const { data: myProxies, refetch: refetchProxies } = useQuery<ProxyData>({
    queryKey: ["/api/assemblies", assembly.id, "my-proxies"],
    enabled: open,
  });

  const createProxy = useMutation({
    mutationFn: async (receiverId: string) => {
      const res = await apiRequest('POST', `/api/assemblies/${assembly.id}/proxies`, {
        receiverId,
        action: 'create',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      refetchProxies();
      setSelectedUser("");
      toast({
        title: "Procuração criada",
        description: "A sua procuração foi criada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar procuração",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revokeProxy = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/assemblies/${assembly.id}/proxies`, {
        action: 'revoke',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      refetchProxies();
      toast({
        title: "Procuração revogada",
        description: "A sua procuração foi revogada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao revogar procuração",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid={`button-procuracao-${assembly.id}`}>
          <UserCheck className="h-4 w-4 mr-2" />
          Procuração
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerir Procuração</DialogTitle>
          <DialogDescription>
            Delegue o seu voto nesta assembleia a outro associado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {myProxies?.given ? (
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Procuração ativa</p>
                  <p className="text-sm text-muted-foreground">
                    Delegou o voto a: {myProxies.given.receiverName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeProxy.mutate()}
                  disabled={revokeProxy.isPending}
                  data-testid={`button-revogar-procuracao-${assembly.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium">Delegar voto a:</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger data-testid={`select-user-${assembly.id}`}>
                  <SelectValue placeholder="Selecione um associado" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => createProxy.mutate(selectedUser)}
                disabled={!selectedUser || createProxy.isPending}
                className="w-full"
                data-testid={`button-criar-procuracao-${assembly.id}`}
              >
                {createProxy.isPending ? "A criar..." : "Criar Procuração"}
              </Button>
            </div>
          )}

          {myProxies?.received && myProxies.received.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Procurações recebidas:</p>
              <div className="space-y-2">
                {myProxies.received.map((proxy) => (
                  <div key={proxy.id} className="p-2 bg-muted rounded text-sm" data-testid={`proxy-received-${proxy.id}`}>
                    {proxy.giverName} delegou o voto em si
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AssemblyCard({ assembly }: { assembly: Assembly }) {
  const { toast } = useToast();
  const { isAdmin, isDirecao } = useAuth();
  const canGenerateMinutes = isAdmin || isDirecao;

  // Fetch proxy data for this assembly
  const { data: myProxies } = useQuery<ProxyData>({
    queryKey: ["/api/assemblies", assembly.id, "my-proxies"],
    enabled: assembly.status === 'agendada',
  });

  const generateMinutes = useMutation({
    mutationFn: async (assemblyId: number) => {
      const res = await apiRequest('POST', `/api/assemblies/${assemblyId}/generate-minutes`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assemblies"] });
      toast({
        title: "Ata gerada com sucesso",
        description: "A ata foi gerada e está disponível para download",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao gerar ata",
        description: error.message || "Ocorreu um erro ao gerar a ata",
        variant: "destructive",
      });
    },
  });

  const getStatusVariant = (status: string) => {
    const variants = {
      agendada: "default",
      em_curso: "secondary",
      encerrada: "outline",
    };
    return variants[status as keyof typeof variants] || "default";
  };

  const getTypeLabel = (tipo: string) => {
    const labels = {
      ordinaria: "Ordinária",
      extraordinaria: "Extraordinária",
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  return (
    <Card className="hover-elevate active-elevate-2 transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-2xl">{assembly.titulo}</CardTitle>
              <Badge variant={getStatusVariant(assembly.status!)}>
                {assembly.status}
              </Badge>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline">
                {getTypeLabel(assembly.tipo)}
              </Badge>
              {myProxies?.given && (
                <Badge variant="secondary" data-testid={`badge-procuracao-dada-${assembly.id}`}>
                  <UserCheck className="h-3 w-3 mr-1" />
                  Procuração: {myProxies.given.receiverName}
                </Badge>
              )}
              {myProxies?.received && myProxies.received.length > 0 && (
                <Badge variant="secondary" data-testid={`badge-procuracoes-recebidas-${assembly.id}`}>
                  <Users className="h-3 w-3 mr-1" />
                  {myProxies.received.length} {myProxies.received.length === 1 ? 'procuração' : 'procurações'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">Data e Hora</div>
              <div className="text-muted-foreground">
                {new Date(assembly.dataAssembleia).toLocaleDateString('pt-PT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {assembly.local && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground">Local</div>
                <div className="text-muted-foreground">{assembly.local}</div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-foreground">Quórum Mínimo</div>
              <div className="text-muted-foreground">{assembly.quorumMinimo}%</div>
            </div>
          </div>

          {assembly.ataGerada && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground">Ata</div>
                <div className="text-muted-foreground">Disponível</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t flex-wrap">
          {assembly.status === 'agendada' && (
            <ProxyDialog assembly={assembly} />
          )}
          {assembly.status === 'encerrada' && assembly.ataGerada && (
            <Button variant="outline" asChild data-testid={`button-download-ata-${assembly.id}`}>
              <a href={`/api/assemblies/${assembly.id}/download-minutes`}>
                <Download className="h-4 w-4 mr-2" />
                Download Ata
              </a>
            </Button>
          )}
          {assembly.status === 'encerrada' && !assembly.ataGerada && canGenerateMinutes && (
            <Button 
              variant="outline" 
              onClick={() => generateMinutes.mutate(assembly.id!)}
              disabled={generateMinutes.isPending}
              data-testid={`button-gerar-ata-${assembly.id}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              {generateMinutes.isPending ? 'A gerar...' : 'Gerar Ata'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AssembliesSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
