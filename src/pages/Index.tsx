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
      
      <section id="ramadhan-project" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-hero px-6 py-3 text-sm text-white backdrop-blur-sm animate-fade-in mb-6">
              <span className="text-lg">🌙</span>
              <span className="font-semibold">RAMADHAN PROJECT</span>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
              Semarak Ramadhan Menggapai Surga
            </h2>
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-lg md:text-xl text-primary font-semibold leading-relaxed animate-fade-in" style={{ animationDelay: "200ms" }}>
                The Golden Ticket: Hanya di Bulan Ini, Kesempatan Terbatas Memanen Amalan yang Nilainya Jauh Melampaui Dunia dan Isinya.
              </p>
            </div>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-glow transition-all duration-300 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Bulan Ramadhan, Bulan yang kita Rindukan. Bulan Mulia itu akan segera datang. Bulan dimana pahala amal shalih dilipatgandakan, bulan terbuka pintu-pintu ampunan, di dalamnya terdapat malam Lailatul Qadar, malam yang lebih baik dari seribu bulan. Mari jadikan Ramadhan ini menjadi Ramadhan terbaik untuk Kita, seakan ini kesempatan terakhir dalam meraih Surga-Nya.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-glow transition-all duration-300 animate-fade-in" style={{ animationDelay: "400ms" }}>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Ramadhan Project hadir memastikan kebaikan anda dirasakan sepenuhnya, untuk saudara kita kaum muslimin di Surabaya dan Sekitarnya. Alhamdulillah, ribuan kg kurma, ribuan dus air mineral, ribuan porsi makanan, serta ribuan kaum muslimin di ratusan masjid di Surabaya dan sekitarnya telah merasakan manfaatnya.
              </p>
            </div>

            <div className="bg-gradient-hero rounded-2xl p-8 shadow-glow border-2 border-primary animate-fade-in" style={{ animationDelay: "500ms" }}>
              <p className="text-lg md:text-xl font-bold text-white leading-relaxed text-center">
                30 Hari, waktu yang sangat singkat, segera ambil bagian sebelum waktu mulia ini benar-benar terlewat.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <RamadhanCountdown />
      <Footer />
    </div>
  );
};

export default Index;
