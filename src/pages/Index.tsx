import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

import CategoriesSection from "@/components/CategoriesSection";

import WhyChooseUs from "@/components/WhyChooseUs";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import StatsCounter from "@/components/StatsCounter";
import HowItWorks from "@/components/HowItWorks";
import SpecialBanner from "@/components/SpecialBanner";
import AppDownloadSection from "@/components/AppDownloadSection";
import PopularBrands from "@/components/PopularBrands";
import ScrollProgress from "@/components/ScrollProgress";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AIChatAssistant from "@/components/AIChatAssistant";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <Header />
      <main>
        <HeroSection />
        <PopularBrands />
        
        <HowItWorks />
        <CategoriesSection />
        <StatsCounter />
        
        <SpecialBanner />
        <WhyChooseUs />
        <AppDownloadSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AIChatAssistant />
    </div>
  );
};

export default Index;
