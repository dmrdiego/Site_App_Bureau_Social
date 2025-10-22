// IMPORTANT: Based on Replit Auth blueprint (javascript_log_in_with_replit)
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Assemblies from "@/pages/Assemblies";
import Votacoes from "@/pages/Votacoes";
import Documentos from "@/pages/Documentos";
import Perfil from "@/pages/Perfil";
import AdminCMS from "@/pages/AdminCMS";
import NovaAssembleia from "@/pages/NovaAssembleia";
import AdminAssociados from "@/pages/AdminAssociados";
import Configuracoes from "@/pages/Configuracoes";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        // Public routes
        <>
          <Route path="/" component={Landing} />
          <Route component={NotFound} />
        </>
      ) : (
        // Protected routes - Portal de Associados
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/assembleias" component={Assemblies} />
          <Route path="/assembleias/nova" component={NovaAssembleia} />
          <Route path="/votacoes" component={Votacoes} />
          <Route path="/documentos" component={Documentos} />
          <Route path="/perfil" component={Perfil} />
          <Route path="/admin/cms" component={AdminCMS} />
          <Route path="/admin/associados" component={AdminAssociados} />
          <Route path="/admin/config" component={Configuracoes} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Custom sidebar width for Bureau Social portal
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <ThemeProvider>
      <TooltipProvider>
        {isLoading || !isAuthenticated ? (
          // Public site - no sidebar
          <>
            <Router />
            <Toaster />
          </>
        ) : (
          // Portal de Associados - with sidebar
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b bg-background">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto p-6 md:p-8">
                  <Router />
                </main>
              </div>
            </div>
            <Toaster />
          </SidebarProvider>
        )}
      </TooltipProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
