import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, HandshakeIcon, GraduationCap, Briefcase, Network, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const iconMap: Record<string, any> = {
  "book-open": BookOpen,
  "trending-up": TrendingUp,
  handshake: HandshakeIcon,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  network: Network,
  tools: Wrench,
};

interface Service {
  title: string;
  description: string;
  icon: string;
  features?: string[];
}

interface ServicesContent {
  title: string;
  description: string;
  services: Service[];
}

const defaultServices: Service[] = [
  {
    icon: "briefcase",
    title: "Consultoria e Mentoria",
    description: "Acompanhamento especializado para desenvolvimento e escala de negócios sociais",
    features: ["Modelação de negócio", "Estratégia de impacto", "Planeamento financeiro"],
  },
  {
    icon: "graduation-cap",
    title: "Formação",
    description: "Programas de capacitação em empreendedorismo social e gestão de impacto",
    features: ["Workshops temáticos", "Cursos de certificação", "Webinars especializados"],
  },
  {
    icon: "network",
    title: "Networking",
    description: "Facilitação de contactos e parcerias estratégicas no ecossistema",
    features: ["Eventos de networking", "Matchmaking com investidores", "Parcerias corporativas"],
  },
  {
    icon: "tools",
    title: "Recursos e Ferramentas",
    description: "Acesso a recursos, templates e ferramentas para gestão de negócios sociais",
    features: ["Biblioteca de recursos", "Templates e modelos", "Base de conhecimento"],
  },
];

export function ServicesSection() {
  const { data } = useQuery<{ content: ServicesContent }>({
    queryKey: ['/api/public/cms/services'],
  });

  const content = data?.content;
  const services = content?.services || defaultServices;

  return (
    <section id="servicos" className="py-24 md:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content?.title || "Os Nossos Serviços"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {content?.description || "Apoiamos negócios sociais em todas as fases do seu desenvolvimento."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Briefcase;
            return (
              <Card key={index} className="hover-elevate active-elevate-2 transition-all duration-200">
                <CardHeader>
                  <div className="w-14 h-14 bg-primary rounded-md flex items-center justify-center mb-4">
                    <Icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {service.description}
                  </p>
                  {service.features && service.features.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {service.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
