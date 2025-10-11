import { PublicNav } from "@/components/PublicNav";
import { Hero } from "@/components/landing/Hero";
import { MissionSection } from "@/components/landing/MissionSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { ProjectsSection } from "@/components/landing/ProjectsSection";
import { ImpactStats } from "@/components/landing/ImpactStats";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <Hero />
      <MissionSection />
      <ServicesSection />
      <ImpactStats />
      <ProjectsSection />
      <Footer />
    </div>
  );
}
