import { Briefcase, Users, TrendingUp, Handshake } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const iconMap: Record<string, any> = {
  briefcase: Briefcase,
  users: Users,
  "trending-up": TrendingUp,
  handshake: Handshake,
};

interface Stat {
  value: string;
  label: string;
  icon: string;
}

interface StatsContent {
  title: string;
  stats: Stat[];
}

const defaultStats: Stat[] = [
  { value: "150+", label: "Negócios Sociais Apoiados", icon: "briefcase" },
  { value: "500+", label: "Empreendedores Formados", icon: "users" },
  { value: "€2M+", label: "Investimento Facilitado", icon: "trending-up" },
  { value: "25+", label: "Parcerias Estratégicas", icon: "handshake" },
];

export function ImpactStats() {
  const { data } = useQuery<{ content: StatsContent }>({
    queryKey: ['/api/public/cms/stats'],
  });

  const content = data?.content;
  const stats = content?.stats || defaultStats;

  return (
    <section className="py-24 md:py-32 bg-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            {content?.title || "O Nosso Impacto"}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon] || Briefcase;
            return (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-foreground/10 rounded-md flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
