// IMPORTANT: Usando Shadcn Sidebar conforme design_guidelines.md
import { Link, useLocation } from "wouter";
import {
  Home,
  Users,
  Vote,
  FileText,
  User,
  Settings,
  UserCog,
  Edit3,
  LogOut,
  Mail,
  CreditCard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logoImage from "@assets/Pt-BS_1760236872718.png";

export function AppSidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, isAdmin, isDirecao } = useAuth();

  const mainItems = [
    { title: t('nav.home'), url: "/dashboard", icon: Home },
    { title: t('assemblies.title'), url: "/assembleias", icon: Users },
    { title: t('votes.title'), url: "/votacoes", icon: Vote },
    { title: t('quotas.title'), url: "/quotas", icon: CreditCard },
    { title: t('repository.title'), url: "/documentos", icon: FileText },
    { title: t('profile.title'), url: "/perfil", icon: User },
  ];

  const adminItems = [
    { title: t('admin.members.title'), url: "/admin/associados", icon: UserCog },
    { title: t('admin.communications.title'), url: "/admin/comunicacoes", icon: Mail },
    { title: t('admin.cms.title'), url: "/admin/cms", icon: Edit3 },
    { title: "Configurações", url: "/admin/config", icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link href="/dashboard" data-testid="link-sidebar-logo">
          <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-md p-2 -m-2 cursor-pointer">
            <img
              src={logoImage}
              alt="Bureau Social"
              className="w-10 h-10 object-contain"
            />
            <div>
              <div className="font-bold text-sidebar-foreground">Bureau Social</div>
              <div className="text-xs text-muted-foreground">Portal Associados</div>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isAdmin || isDirecao) && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                    >
                      <Link href={item.url} data-testid={`link-admin-${item.title.toLowerCase()}`}>
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.email}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          asChild
          data-testid="button-logout"
        >
          <a href="/api/logout" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Terminar Sessão
          </a>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
