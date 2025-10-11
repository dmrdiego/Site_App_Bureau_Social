import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Lightbulb, Heart } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Missão Clara",
    description: "Promover o desenvolvimento de negócios sociais que criem valor económico e social sustentável.",
  },
  {
    icon: Users,
    title: "Comunidade Forte",
    description: "Conectar empreendedores, investidores e organizações comprometidas com o impacto social.",
  },
  {
    icon: Lightbulb,
    title: "Inovação Social",
    description: "Fomentar soluções inovadoras para os desafios sociais e ambientais do nosso tempo.",
  },
  {
    icon: Heart,
    title: "Impacto Positivo",
    description: "Medir e maximizar o impacto social positivo de todos os nossos projetos e iniciativas.",
  },
];

export function MissionSection() {
  return (
    <section id="missao" className="py-24 md:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nossa Missão e Valores
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Acreditamos que os negócios podem ser uma força poderosa para o bem, 
            criando valor económico enquanto resolvem problemas sociais fundamentais.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="hover-elevate active-elevate-2 transition-all duration-200">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
