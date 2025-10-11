export function ImpactStats() {
  const stats = [
    { value: "150+", label: "Associados Ativos" },
    { value: "45", label: "Projetos Apoiados" },
    { value: "2.5M€", label: "Impacto Económico" },
    { value: "5000+", label: "Beneficiários Diretos" },
  ];

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-primary-foreground/80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
