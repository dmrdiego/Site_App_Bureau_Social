import { Card, CardContent } from "@/components/ui/card";
import { Heart, Leaf, Lightbulb, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const iconMap: Record<string, any> = {
  heart: Heart,
  leaf: Leaf,
  lightbulb: Lightbulb,
  users: Users,
};

interface MissionValue {
  title: string;
  description: string;
  icon: string;
}

interface MissionContent {
  title: string;
  description: string;
  values: MissionValue[];
}

const defaultValues: MissionValue[] = [
  {
    icon: "heart",
    title: "Impacto Social",
    description: "Priorizamos soluções que geram benefícios tangíveis para comunidades e sociedade",
  },
  {
    icon: "leaf",
    title: "Sustentabilidade",
    description: "Promovemos modelos de negócio economicamente viáveis e ambientalmente responsáveis",
  },
  {
    icon: "lightbulb",
    title: "Inovação",
    description: "Apoiamos abordagens criativas e inovadoras para resolver desafios sociais",
  },
  {
    icon: "users",
    title: "Colaboração",
    description: "Facilitamos parcerias e networking entre stakeholders do ecossistema",
  },
];

export function MissionSection() {
  const { data } = useQuery<{ content: MissionContent }>({
    queryKey: ['/api/public/cms/mission'],
  });

  const content = data?.content;
  const values = content?.values || defaultValues;

  return (
    <section id="missao" className="py-24 md:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {content?.title || "A Nossa Missão"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {content?.description || "Promover e desenvolver o ecossistema de negócios sociais em Portugal."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => {
            const Icon = iconMap[value.icon] || Heart;
            return (
              <Card key={index} className="hover-elevate active-elevate-2 transition-all duration-200">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
