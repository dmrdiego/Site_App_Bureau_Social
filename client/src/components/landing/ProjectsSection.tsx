import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface Project {
  title: string;
  description: string;
  category: string;
  impact: string;
  status: string;
}

interface ProjectsContent {
  title: string;
  description: string;
  projects: Project[];
}

const defaultProjects: Project[] = [
  {
    title: "Incubadora de Negócios Sociais",
    description: "Programa de aceleração para startups sociais em fase inicial",
    category: "Empreendedorismo",
    impact: "15 negócios sociais incubados",
    status: "Em curso",
  },
  {
    title: "Rede de Mentores",
    description: "Plataforma que conecta empreendedores sociais com mentores experientes",
    category: "Mentoria",
    impact: "50+ pares mentor-mentee",
    status: "Em curso",
  },
  {
    title: "Fundo de Investimento Social",
    description: "Fundo dedicado a investimentos em negócios com impacto social mensurável",
    category: "Financiamento",
    impact: "€500K investidos",
    status: "Ativo",
  },
];

export function ProjectsSection() {
  const { data } = useQuery<{ content: ProjectsContent }>({
    queryKey: ['/api/public/cms/projects'],
  });

  const content = data?.content;
  const projects = content?.projects || defaultProjects;

  return (
    <section id="projetos" className="py-24 md:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content?.title || "Projetos em Destaque"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {content?.description || "Iniciativas que estão a transformar comunidades e criar impacto positivo."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.slice(0, 4).map((project, index) => (
            <Card key={index} className="hover-elevate active-elevate-2 transition-all duration-200 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />
              <CardContent className="p-6">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">
                    {project.category}
                  </Badge>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {project.title}
                  </h3>
                  <div className="text-sm font-medium text-primary">
                    {project.impact}
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
