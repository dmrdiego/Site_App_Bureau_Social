import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
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
import { insertAssemblySchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  tipo: z.enum(["ordinaria", "extraordinaria"]),
  dataAssembleia: z.string().min(1, "Data é obrigatória"),
  local: z.string().optional(),
  convocatoria: z.string().optional(),
  ordemDia: z.any().optional(),
  status: z.string().optional(),
  quorumMinimo: z.number().min(1).max(100).optional(),
  votingEligibility: z.enum(["todos", "fundador_efetivo", "apenas_fundador"]).optional(),
  allowedCategories: z.array(z.enum(["fundador", "efetivo", "contribuinte", "honorario"])).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NovaAssembleia() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading, isAdmin, isDirecao } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (!isAdmin && !isDirecao))) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores e direção podem criar assembleias.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/assembleias");
      }, 1000);
    }
  }, [isAuthenticated, authLoading, isAdmin, isDirecao, toast, setLocation]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      tipo: "ordinaria",
      dataAssembleia: "",
      local: "",
      convocatoria: "",
      ordemDia: [],
      status: "agendada",
      quorumMinimo: 50,
      votingEligibility: "todos",
      allowedCategories: ["fundador", "efetivo", "contribuinte"],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest('POST', '/api/assemblies', {
        ...data,
        dataAssembleia: data.dataAssembleia,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assemblies'] });
      toast({
        title: "Sucesso",
        description: "Assembleia criada com sucesso!",
      });
      setLocation("/assembleias");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: "Falha ao criar assembleia: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  if (authLoading || !isAuthenticated || (!isAdmin && !isDirecao)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Nova Assembleia</h1>
        <p className="text-muted-foreground">
          Criar uma nova assembleia geral de associados
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
                      <Input
                        placeholder="Assembleia Geral Ordinária 2025"
                        {...field}
                        data-testid="input-titulo"
                      />
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo">
                          <SelectValue placeholder="Selecione o tipo" />
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
                name="dataAssembleia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data e Hora</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        data-testid="input-data"
                      />
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
                      <Input
                        placeholder="Sede do Bureau Social, Lisboa"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-local"
                      />
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
                        value={field.value || 50}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-quorum"
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
                      <Textarea
                        placeholder="Texto da convocatória..."
                        rows={6}
                        {...field}
                        value={field.value || ""}
                        data-testid="input-convocatoria"
                      />
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-voting-eligibility">
                          <SelectValue placeholder="Quem pode votar?" />
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
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? "A criar..." : "Criar Assembleia"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/assembleias")}
                  data-testid="button-cancel"
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
