import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, User, Shield, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  categoria: string;
  numeroSocio?: string;
  telefone?: string;
  isAdmin: boolean;
  isDirecao: boolean;
}

export default function AdminAssociados() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("todas");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    categoria: "",
    numeroSocio: "",
    telefone: "",
    isAdmin: false,
    isDirecao: false,
  });
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Sucesso",
        description: "Associado atualizado com sucesso",
      });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar associado",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.numeroSocio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategoria = 
      filterCategoria === "todas" || user.categoria === filterCategoria;

    return matchesSearch && matchesCategoria;
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      categoria: user.categoria || "contribuinte",
      numeroSocio: user.numeroSocio || "",
      telefone: user.telefone || "",
      isAdmin: user.isAdmin || false,
      isDirecao: user.isDirecao || false,
    });
  };

  const handleUpdate = () => {
    if (!editingUser) return;
    
    updateMutation.mutate({
      userId: editingUser.id,
      data: editForm,
    });
  };

  const categoriaStats = {
    total: users.length,
    fundador: users.filter(u => u.categoria === 'fundador').length,
    efetivo: users.filter(u => u.categoria === 'efetivo').length,
    contribuinte: users.filter(u => u.categoria === 'contribuinte').length,
    honorario: users.filter(u => u.categoria === 'honorario').length,
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'fundador': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'efetivo': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'contribuinte': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'honorario': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-admin-associados">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-title">Gerir Associados</h1>
        <p className="text-muted-foreground">
          Administre categorias, permissões e informações dos associados
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total">{categoriaStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fundadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-fundador">{categoriaStats.fundador}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efetivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-efetivo">{categoriaStats.efetivo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contribuintes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-contribuinte">{categoriaStats.contribuinte}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Honorários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-honorario">{categoriaStats.honorario}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Pesquisa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome, email ou número de sócio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-[200px]" data-testid="select-filter-categoria">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas Categorias</SelectItem>
                <SelectItem value="fundador">Fundador</SelectItem>
                <SelectItem value="efetivo">Efetivo</SelectItem>
                <SelectItem value="contribuinte">Contribuinte</SelectItem>
                <SelectItem value="honorario">Honorário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            A mostrar {filteredUsers.length} de {users.length} associados
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">Carregando...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum associado encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nº Sócio</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {user.firstName} {user.lastName}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{user.numeroSocio || "-"}</TableCell>
                    <TableCell>
                      <Badge className={getCategoriaColor(user.categoria)} data-testid={`badge-categoria-${user.id}`}>
                        {user.categoria?.charAt(0).toUpperCase() + user.categoria?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.isAdmin && (
                          <Badge variant="destructive" className="text-xs" data-testid={`badge-admin-${user.id}`}>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {user.isDirecao && (
                          <Badge variant="secondary" className="text-xs" data-testid={`badge-direcao-${user.id}`}>
                            Direção
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            data-testid={`button-edit-${user.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Associado</DialogTitle>
                            <DialogDescription>
                              {user.firstName} {user.lastName} ({user.email})
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="categoria">Categoria</Label>
                              <Select
                                value={editForm.categoria}
                                onValueChange={(value) =>
                                  setEditForm({ ...editForm, categoria: value })
                                }
                              >
                                <SelectTrigger id="categoria" data-testid="select-edit-categoria">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="contribuinte">Contribuinte</SelectItem>
                                  <SelectItem value="efetivo">Efetivo</SelectItem>
                                  <SelectItem value="fundador">Fundador</SelectItem>
                                  <SelectItem value="honorario">Honorário</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="numeroSocio">Número de Sócio</Label>
                              <Input
                                id="numeroSocio"
                                value={editForm.numeroSocio}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, numeroSocio: e.target.value })
                                }
                                placeholder="Ex: BS-001"
                                data-testid="input-edit-numero-socio"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="telefone">Telefone</Label>
                              <Input
                                id="telefone"
                                value={editForm.telefone}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, telefone: e.target.value })
                                }
                                placeholder="Ex: +351 912 345 678"
                                data-testid="input-edit-telefone"
                              />
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                              <Label className="text-base">Permissões</Label>
                              
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label htmlFor="isAdmin">Administrador</Label>
                                  <div className="text-sm text-muted-foreground">
                                    Acesso total ao sistema
                                  </div>
                                </div>
                                <Switch
                                  id="isAdmin"
                                  checked={editForm.isAdmin}
                                  onCheckedChange={(checked) =>
                                    setEditForm({ ...editForm, isAdmin: checked })
                                  }
                                  data-testid="switch-edit-admin"
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <Label htmlFor="isDirecao">Direção</Label>
                                  <div className="text-sm text-muted-foreground">
                                    Pode gerar atas de assembleias
                                  </div>
                                </div>
                                <Switch
                                  id="isDirecao"
                                  checked={editForm.isDirecao}
                                  onCheckedChange={(checked) =>
                                    setEditForm({ ...editForm, isDirecao: checked })
                                  }
                                  data-testid="switch-edit-direcao"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingUser(null)}
                              data-testid="button-cancel-edit"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleUpdate}
                              disabled={updateMutation.isPending}
                              data-testid="button-save-edit"
                            >
                              {updateMutation.isPending ? "A guardar..." : "Guardar"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
