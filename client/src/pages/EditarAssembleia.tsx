
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Assembly } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  tipo: z.enum(["ordinaria", "extraordinaria"]),
  dataAssembleia: z.string().min(1, "Data é obrigatória"),
  local: z.string().optional(),
  convocatoria: z.string().optional(),
  status: z.enum(["agendada", "em_curso", "encerrada"]),
  quorumMinimo: z.number().min(1).max(100).optional(),
  votingEligibility: z.enum(["todos", "fundador_efetivo", "apenas_fundador"]).optional(),
  allowedCategories: z.array(z.enum(["fundador", "efetivo", "contribuinte", "honorario"])).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditarAssembleia() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem editar assembleias.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/assembleias");
      }, 1000);
    }
  }, [isAuthenticated, authLoading, isAdmin, toast, setLocation]);

  const { data: assembly, isLoading } = useQuery<Assembly>({
    queryKey: [`/api/assemblies/${id}`],
    enabled: isAuthenticated && isAdmin && !!id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    values: assembly ? {
      titulo: assembly.titulo,
      tipo: assembly.tipo as "ordinaria" | "extraordinaria",
      dataAssembleia: new Date(assembly.dataAssembleia).toISOString().slice(0, 16),
      local: assembly.local || "",
      convocatoria: assembly.convocatoria || "",
      status: assembly.status as "agendada" | "em_curso" | "encerrada",
      quorumMinimo: assembly.quorumMinimo || 50,
      votingEligibility: (assembly as any).votingEligibility || "todos",
      allowedCategories: (assembly as any).allowedCategories || ["fundador", "efetivo", "contribuinte"],
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest('PUT', `/api/assemblies/${id}`, data);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assemblies'] });
      toast({
        title: "Sucesso",
        description: "Assembleia atualizada com sucesso!",
      });
      setLocation("/assembleias");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar assembleia: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  if (authLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Editar Assembleia</h1>
        <p className="text-muted-foreground">
          Atualizar informações da assembleia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Assembleia</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ordinaria">Ordinária</SelectItem>
                        <SelectItem value="extraordinaria">Extraordinária</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="agendada">Agendada</SelectItem>
                        <SelectItem value="em_curso">Em Curso</SelectItem>
                        <SelectItem value="encerrada">Encerrada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataAssembleia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Hora</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="local"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quorumMinimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quórum Mínimo (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="convocatoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Convocatória</FormLabel>
                    <FormControl>
                      <Textarea rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="votingEligibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Elegibilidade para Voto</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todos">Todos os associados ativos (exceto honorários)</SelectItem>
                        <SelectItem value="fundador_efetivo">Apenas Fundadores e Efetivos</SelectItem>
                        <SelectItem value="apenas_fundador">Apenas Fundadores</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "A atualizar..." : "Atualizar Assembleia"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/assembleias")}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
