import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CampaignList from "@/components/CampaignList";
import VirtuesOfCharity from "@/components/VirtuesOfCharity";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <CampaignList />
      <section id="tentang" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Tentang Kami
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Di Jalan Kebaikan, niat tulusmu 100% tersalurkan. Kami hadir untuk memastikan niat baik kamu utuh sampai tujuan. Demi menghadirkan luasnya kebermanfaatan.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <VirtuesOfCharity />
      <Footer />
    </div>
  );
};

export default Index;
