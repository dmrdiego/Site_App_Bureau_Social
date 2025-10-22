
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";

export default function EditarPerfil() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (user) {
      setTelefone(user.telefone || "");
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PATCH', '/api/user/profile', { telefone });
      if (!res.ok) throw new Error('Erro ao atualizar perfil');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated || !user) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/perfil">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Perfil</h1>
          <p className="text-muted-foreground">Atualize suas informações pessoais</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={`${user.firstName} ${user.lastName}`} disabled />
            <p className="text-sm text-muted-foreground mt-1">
              O nome não pode ser alterado. Contacte a administração se necessário.
            </p>
          </div>

          <div>
            <Label>Email</Label>
            <Input value={user.email || ""} disabled />
            <p className="text-sm text-muted-foreground mt-1">
              O email não pode ser alterado. Contacte a administração se necessário.
            </p>
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="+351 912 345 678"
            />
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="w-full md:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? "A guardar..." : "Guardar Alterações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
