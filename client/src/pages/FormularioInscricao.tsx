import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/landing/Footer";
import { Send } from "lucide-react";

export default function FormularioInscricao() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telefone: "",
    categoria: "contribuinte",
    motivacao: "",
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/public/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Erro ao submeter inscrição');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inscrição Recebida!",
        description: "Receberá um email com mais informações em breve.",
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        telefone: "",
        categoria: "contribuinte",
        motivacao: "",
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

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Formulário de Inscrição</CardTitle>
              <p className="text-muted-foreground">
                Preencha os dados abaixo para se tornar associado do Bureau Social
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Primeiro Nome *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Sobrenome *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="+351 912 345 678"
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria de Associado *</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                  <SelectTrigger id="categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contribuinte">Contribuinte</SelectItem>
                    <SelectItem value="efetivo">Efetivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="motivacao">Motivação</Label>
                <Textarea
                  id="motivacao"
                  value={formData.motivacao}
                  onChange={(e) => setFormData({ ...formData, motivacao: e.target.value })}
                  placeholder="Conte-nos porque deseja ser associado..."
                  rows={4}
                />
              </div>

              <Button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || !formData.firstName || !formData.lastName || !formData.email}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitMutation.isPending ? "A enviar..." : "Submeter Inscrição"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}