import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserCheck, UserX, Shield } from "lucide-react";
import type { User } from "@shared/schema";

export default function GerirAssociados() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem gerir associados.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    }
  }, [isAuthenticated, authLoading, isAdmin, toast]);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated && isAdmin,
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      return await apiRequest('PUT', `/api/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso",
        description: "Utilizador atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar utilizador: " + error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated || !isAdmin) {
    return <GerirAssociadosSkeleton />;
  }

  const activeUsers = users?.filter(u => u.ativo) || [];
  const inactiveUsers = users?.filter(u => !u.ativo) || [];
  const admins = users?.filter(u => u.isAdmin) || [];

  const toggleUserStatus = (user: User) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { ativo: !user.ativo },
    });
  };

  const toggleAdminStatus = (user: User) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { isAdmin: !user.isAdmin },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Gerir Associados</h1>
        <p className="text-muted-foreground">
          Gerir utilizadores, permissões e status de ativação
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Total Associados"
          value={users?.length || 0}
          icon={Users}
        />
        <StatCard
          title="Ativos"
          value={activeUsers.length}
          icon={UserCheck}
        />
        <StatCard
          title="Administradores"
          value={admins.length}
          icon={Shield}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Associados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <UserListSkeleton />
          ) : users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onToggleStatus={() => toggleUserStatus(user)}
                  onToggleAdmin={() => toggleAdminStatus(user)}
                  isUpdating={updateUserMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum associado encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: {
  title: string;
  value: number;
  icon: any;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function UserCard({ user, onToggleStatus, onToggleAdmin, isUpdating }: {
  user: User;
  onToggleStatus: () => void;
  onToggleAdmin: () => void;
  isUpdating: boolean;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-md border hover-elevate active-elevate-2">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.profileImageUrl || undefined} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {user.firstName?.[0]}{user.lastName?.[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground">
            {user.firstName} {user.lastName}
          </h3>
          {user.isAdmin && (
            <Badge variant="default">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
          {user.isDirecao && (
            <Badge variant="secondary">Direção</Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{user.email}</div>
        <div className="flex items-center gap-3 mt-2 text-xs">
          {user.numeroSocio && (
            <span className="text-muted-foreground">
              Nº {user.numeroSocio}
            </span>
          )}
          {user.categoria && (
            <Badge variant="outline" className="text-xs">
              {user.categoria}
            </Badge>
          )}
          {user.dataAdesao && (
            <span className="text-muted-foreground">
              Adesão: {new Date(user.dataAdesao).toLocaleDateString('pt-PT')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={user.ativo ? "default" : "destructive"}>
          {user.ativo ? "Ativo" : "Inativo"}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleStatus}
          disabled={isUpdating}
          data-testid={`button-toggle-status-${user.id}`}
        >
          {user.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleAdmin}
          disabled={isUpdating}
          data-testid={`button-toggle-admin-${user.id}`}
        >
          <Shield className={`h-4 w-4 ${user.isAdmin ? 'text-primary' : ''}`} />
        </Button>
      </div>
    </div>
  );
}

function UserListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function GerirAssociadosSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
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
