import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, HandshakeIcon, GraduationCap } from "lucide-react";

const services = [
  {
    icon: BookOpen,
    title: "Consultoria Estratégica",
    description: "Apoio especializado no desenvolvimento de modelos de negócio social sustentáveis e escaláveis.",
  },
  {
    icon: TrendingUp,
    title: "Aceleração de Projetos",
    description: "Programas de mentoria e capacitação para empreendedores sociais em crescimento.",
  },
  {
    icon: HandshakeIcon,
    title: "Networking & Parcerias",
    description: "Conexões estratégicas com investidores, parceiros corporativos e organizações do setor.",
  },
  {
    icon: GraduationCap,
    title: "Formação Contínua",
    description: "Workshops, webinars e cursos sobre empreendedorismo social e impacto mensurável.",
  },
];

export function ServicesSection() {
  return (
    <section id="servicos" className="py-24 md:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como Podemos Ajudar
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Oferecemos um conjunto abrangente de serviços para apoiar 
            negócios sociais em todas as fases do seu desenvolvimento.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover-elevate active-elevate-2 transition-all duration-200">
              <CardHeader>
                <div className="w-14 h-14 bg-primary rounded-md flex items-center justify-center mb-4">
                  <service.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
