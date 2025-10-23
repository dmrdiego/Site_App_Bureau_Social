import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Users, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function Comunicacoes() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [segmento, setSegmento] = useState("todos");
  const [testePara, setTestePara] = useState("");
  const [showPreview, setShowPreview] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem aceder a esta página",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    }
  }, [isAdmin, authLoading, toast]);

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && isAdmin,
  });

  const broadcastMutation = useMutation({
    mutationFn: async ({ isTest }: { isTest: boolean }) => {
      const payload: any = {
        subject,
        html: convertTextToHtml(html, subject),
        segmento,
      };

      if (isTest && testePara) {
        payload.testePara = testePara;
      }

      const response = await apiRequest("/api/admin/email/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao enviar email");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      if (variables.isTest) {
        toast({
          title: "Sucesso",
          description: "Email de teste enviado!",
        });
      } else {
        toast({
          title: "Sucesso",
          description: `Enviando emails para ${data.total} destinatários...`,
        });
        // Reset form
        setSubject("");
        setHtml("");
        setSegmento("todos");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  // Calculate recipient count
  const recipientCount = users?.filter(u => {
    if (segmento === "direcao") return u.isDirecao;
    if (segmento === "admin") return u.isAdmin;
    if (segmento === "ativos") return u.ativo;
    if (segmento === "contribuinte") return u.categoria === "contribuinte";
    if (segmento === "fundador") return u.categoria === "fundador";
    return true;
  }).length || 0;

  const handleSendTest = () => {
    if (!subject || !html) {
      toast({
        title: "Erro",
        description: "Preencha o assunto e a mensagem",
        variant: "destructive",
      });
      return;
    }
    if (!testePara) {
      toast({
        title: "Erro",
        description: "Insira um email para teste",
        variant: "destructive",
      });
      return;
    }
    broadcastMutation.mutate({ isTest: true });
  };

  const handleSendBroadcast = () => {
    if (!subject || !html) {
      toast({
        title: "Erro",
        description: "Preencha o assunto e a mensagem",
        variant: "destructive",
      });
      return;
    }
    if (recipientCount === 0) {
      toast({
        title: "Erro",
        description: "Nenhum destinatário encontrado para o segmento selecionado",
        variant: "destructive",
      });
      return;
    }
    broadcastMutation.mutate({ isTest: false });
  };

  const convertTextToHtml = (text: string, emailSubject: string): string => {
    // Simple conversion: preserve line breaks and basic formatting
    const paragraphs = text.split('\n\n').map(p => {
      const lines = p.split('\n').join('<br>');
      return `<p>${lines}</p>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            p { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${emailSubject}</h1>
            </div>
            <div class="content">
              ${paragraphs}
            </div>
            <div class="footer">
              <p>Instituto Português de Negócios Sociais - Bureau Social</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('admin.communications.title')}</h1>
        <p className="text-muted-foreground">
          {t('admin.communications.subtitle')}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nova Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Assunto do email"
                  data-testid="input-subject"
                />
              </div>

              <div>
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="Digite a sua mensagem aqui..."
                  rows={12}
                  className="font-mono text-sm"
                  data-testid="textarea-message"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Separe parágrafos com linhas em branco. A formatação será convertida automaticamente.
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  data-testid="button-toggle-preview"
                >
                  {showPreview ? "Ocultar" : "Visualizar"} Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const inscricaoLink = `${window.location.origin}/inscricao`;
                    setSubject("Torne-se Associado do Bureau Social");
                    setHtml(`Caro(a) Associado(a),

Gostaríamos de convidá-lo a partilhar a oportunidade de se tornar associado do Bureau Social com amigos e colegas.

Para se candidatar, basta aceder ao seguinte link:
${inscricaoLink}

O formulário é simples e rápido de preencher.

Atenciosamente,
Bureau Social`);
                  }}
                >
                  Template: Convite Inscrição
                </Button>
              </div>

              {showPreview && subject && html && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <iframe
                      srcDoc={convertTextToHtml(html, subject)}
                      className="w-full h-96 border rounded"
                      title="Email Preview"
                    />
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Destinatários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="segmento">Segmento *</Label>
                <Select value={segmento} onValueChange={setSegmento}>
                  <SelectTrigger id="segmento" data-testid="select-segmento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Associados</SelectItem>
                    <SelectItem value="ativos">Apenas Ativos</SelectItem>
                    <SelectItem value="direcao">Direção</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                    <SelectItem value="contribuinte">Contribuintes</SelectItem>
                    <SelectItem value="fundador">Fundadores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total de Destinatários</p>
                  <p className="text-2xl font-bold text-primary">{recipientCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Teste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="teste-email">Email de Teste</Label>
                <Input
                  id="teste-email"
                  type="email"
                  value={testePara}
                  onChange={(e) => setTestePara(e.target.value)}
                  placeholder="seu@email.com"
                  data-testid="input-test-email"
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSendTest}
                disabled={broadcastMutation.isPending}
                data-testid="button-send-test"
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Teste
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Atenção</p>
                  <p className="text-muted-foreground">
                    Este email será enviado para {recipientCount} destinatários. 
                    Verifique cuidadosamente antes de enviar.
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleSendBroadcast}
                disabled={broadcastMutation.isPending || recipientCount === 0}
                data-testid="button-send-broadcast"
              >
                <Send className="h-4 w-4 mr-2" />
                {broadcastMutation.isPending ? "A enviar..." : "Enviar Email"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}