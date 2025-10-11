import { Link } from "wouter";
import { Mail, Phone, MapPin, Linkedin, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer id="contactos" className="bg-secondary text-secondary-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* About Column */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Bureau Social</h3>
            <p className="text-secondary-foreground/80 leading-relaxed mb-6">
              Instituto Português de Negócios Sociais dedicado a promover o empreendedorismo 
              social e o desenvolvimento sustentável em Portugal.
            </p>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-md bg-secondary-foreground/10 flex items-center justify-center hover-elevate active-elevate-2"
                data-testid="link-linkedin"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-md bg-secondary-foreground/10 flex items-center justify-center hover-elevate active-elevate-2"
                data-testid="link-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-md bg-secondary-foreground/10 flex items-center justify-center hover-elevate active-elevate-2"
                data-testid="link-twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#missao" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Missão e Valores
                </Link>
              </li>
              <li>
                <Link href="/#servicos" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="/#projetos" className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">
                  Projetos
                </Link>
              </li>
              <li>
                <a
                  href="/api/login"
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                >
                  Portal Associados
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contactos</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-secondary-foreground/80">
                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <a href="mailto:info@bureausocial.pt" className="hover:text-secondary-foreground transition-colors">
                  info@bureausocial.pt
                </a>
              </li>
              <li className="flex items-start gap-3 text-secondary-foreground/80">
                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <a href="tel:+351210000000" className="hover:text-secondary-foreground transition-colors">
                  +351 210 000 000
                </a>
              </li>
              <li className="flex items-start gap-3 text-secondary-foreground/80">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>
                  Av. da Liberdade, 123
                  <br />
                  1250-096 Lisboa
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/60">
            <p>&copy; 2025 Bureau Social. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-secondary-foreground transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-secondary-foreground transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
