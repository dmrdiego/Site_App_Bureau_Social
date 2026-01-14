import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { MessageSquare } from "lucide-react";

interface ContactBoardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ContactBoardDialog({ open, onOpenChange }: ContactBoardDialogProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [subject, setSubject] = useState("");
    const [type, setType] = useState("sugestao");
    const [message, setMessage] = useState("");

    const sendMessageMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest('POST', '/api/communications/contact-board', {
                subject,
                type,
                message,
            });
            if (!res.ok) {
                throw new Error(await res.text());
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Mensagem enviada",
                description: "A sua mensagem foi enviada à Direção com sucesso.",
            });
            setSubject("");
            setMessage("");
            onOpenChange(false);
        },
        onError: (error: Error) => {
            toast({
                title: "Erro ao enviar",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Fale com a Direção
                    </DialogTitle>
                    <DialogDescription>
                        Envie sugestões, dúvidas ou exponha assuntos diretamente à Direção.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tipo de Mensagem</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sugestao">Sugestão</SelectItem>
                                <SelectItem value="duvida">Dúvida / Questão</SelectItem>
                                <SelectItem value="reclamacao">Reclamação</SelectItem>
                                <SelectItem value="outro">Outro Assunto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Assunto</Label>
                        <Input
                            placeholder="Resumo do assunto..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Mensagem</Label>
                        <Textarea
                            placeholder="Escreva aqui a sua mensagem..."
                            className="min-h-[120px]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => sendMessageMutation.mutate()}
                        disabled={!subject || !message || sendMessageMutation.isPending}
                    >
                        {sendMessageMutation.isPending ? "A enviar..." : "Enviar Mensagem"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
