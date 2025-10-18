import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CampaignList from "@/components/CampaignList";
import RamadhanCountdown from "@/components/RamadhanCountdown";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <CampaignList />
      <RamadhanCountdown />
      <Footer />
    </div>
  );
};

export default Index;
