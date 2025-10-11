import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export function Hero() {
  const { data } = useQuery<{ content: HeroContent }>({
    queryKey: ['/api/public/cms/hero'],
  });

  const content = data?.content;

  return (
    <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {content?.title || "Instituto Português de Negócios Sociais"}
        </h1>
        <p className="text-3xl md:text-4xl text-white/90 mb-6 font-semibold">
          {content?.subtitle || "Construindo um futuro mais sustentável e inclusivo através da inovação social"}
        </p>
        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          {content?.description || "O Bureau Social é uma organização dedicada ao desenvolvimento e apoio de negócios sociais em Portugal."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            variant="default"
            className="bg-accent hover:bg-accent border-accent-border text-accent-foreground text-lg px-8 h-12"
            data-testid="button-associar"
          >
            <a href={content?.ctaLink || "/api/login"} className="flex items-center gap-2">
              {content?.ctaText || "Associar-se"}
              <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/30 text-white text-lg px-8 h-12"
            asChild
            data-testid="button-saber-mais"
          >
            <a href="#missao">Saber Mais</a>
          </Button>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-24 text-background"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
