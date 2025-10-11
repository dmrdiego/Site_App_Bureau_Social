import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    title: "Programa de Inclusão Digital",
    category: "Educação",
    impact: "500+ beneficiários",
    description: "Capacitação digital para comunidades em situação de vulnerabilidade, promovendo literacia tecnológica e empregabilidade.",
  },
  {
    title: "Economia Circular Local",
    category: "Sustentabilidade",
    impact: "15 empresas apoiadas",
    description: "Apoio a empresas locais na transição para modelos de economia circular, reduzindo desperdício e criando valor.",
  },
  {
    title: "Empreendedorismo Feminino",
    category: "Empoderamento",
    impact: "200+ mulheres formadas",
    description: "Programa de formação e mentoria para mulheres empreendedoras em áreas rurais e urbanas desfavorecidas.",
  },
];

export function ProjectsSection() {
  return (
    <section id="projetos" className="py-24 md:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Projetos em Destaque
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Alguns dos projetos que estamos orgulhosos de apoiar e 
            que estão a fazer a diferença nas suas comunidades.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
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
