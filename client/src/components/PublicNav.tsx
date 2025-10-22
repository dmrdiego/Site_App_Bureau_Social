import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import logoImage from "@assets/Pt-BS_1760236872718.png";

export function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2 cursor-pointer">
              <img 
                src={logoImage} 
                alt="Bureau Social" 
                className="w-10 h-10 object-contain"
              />
              <div className="hidden sm:block">
                <div className="font-bold text-foreground">Bureau Social</div>
                <div className="text-xs text-muted-foreground">Instituto Português de Negócios Sociais</div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/#missao" data-testid="link-missao">
              <div className="px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 cursor-pointer">
                Missão
              </div>
            </Link>
            <Link href="/#servicos" data-testid="link-servicos">
              <div className="px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 cursor-pointer">
                Serviços
              </div>
            </Link>
            <Link href="/#projetos" data-testid="link-projetos">
              <div className="px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 cursor-pointer">
                Projetos
              </div>
            </Link>
            <Link href="/#contactos" data-testid="link-contactos">
              <div className="px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 cursor-pointer">
                Contactos
              </div>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button
              asChild
              variant="default"
              size="sm"
              className="hidden md:inline-flex"
              data-testid="button-login"
            >
              <a href="/api/login">Portal Associados</a>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/#missao" data-testid="link-mobile-missao">
              <div
                className="block px-3 py-2 rounded-md text-base font-medium hover-elevate active-elevate-2 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Missão
              </div>
            </Link>
            <Link href="/#servicos" data-testid="link-mobile-servicos">
              <div
                className="block px-3 py-2 rounded-md text-base font-medium hover-elevate active-elevate-2 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Serviços
              </div>
            </Link>
            <Link href="/#projetos" data-testid="link-mobile-projetos">
              <div
                className="block px-3 py-2 rounded-md text-base font-medium hover-elevate active-elevate-2 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Projetos
              </div>
            </Link>
            <Link href="/#contactos" data-testid="link-mobile-contactos">
              <div
                className="block px-3 py-2 rounded-md text-base font-medium hover-elevate active-elevate-2 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contactos
              </div>
            </Link>
            <div className="pt-2">
              <Button
                asChild
                variant="default"
                className="w-full"
                data-testid="button-mobile-login"
              >
                <a href="/api/login">Portal Associados</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
