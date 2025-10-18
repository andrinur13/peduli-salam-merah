import { Clock, TrendingUp, FileText, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: TrendingUp,
    title: "Campaign Aktif",
    description: "Berbagai campaign donasi yang bisa Anda dukung sesuai pilihan hati",
  },
  {
    icon: Clock,
    title: "Pendapatan & Penyaluran Otomatis",
    description: "Sistem otomatis yang transparan untuk tracking dana masuk dan keluar",
  },
  {
    icon: FileText,
    title: "Form Donasi Mudah",
    description: "Proses donasi yang simpel dan cepat, hanya beberapa langkah",
  },
  {
    icon: Calendar,
    title: "Countdown Ramadhan",
    description: "Hitung mundur menuju bulan suci Ramadhan untuk persiapan amal",
  },
];

const Features = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Kenapa Memilih SM Peduli?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platform donasi yang mudah, transparan, dan terpercaya untuk menyalurkan kebaikan Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
