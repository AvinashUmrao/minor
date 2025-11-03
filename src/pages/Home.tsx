import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { NewsSection } from "@/components/home/NewsSection";
//import { ChatbotSection } from "@/components/home/ChatbotSection";
import { BlogsSection } from "@/components/home/BlogsSection";
import { CTASection } from "@/components/home/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
     
      <FeaturesSection />
      <NewsSection />
      
      <BlogsSection />
      <CTASection />
    </div>
  );
};

export default Home;
