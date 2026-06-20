import { Card } from "@/components/ui/card";
import { HeartHandshake, Smile, TrendingUp } from "lucide-react";

const VirtuesOfCharity = () => {
  const virtues = [
    {
      title: "Meringankan Beban Sesama",
      description: "Setiap bantuan yang Anda berikan sangat berarti untuk membantu mereka yang sedang kesulitan dan membutuhkan uluran tangan kita bersama.",
      icon: HeartHandshake,
      delay: "0ms",
    },
    {
      title: "Berbagi Kebahagiaan",
      description: "Donasi Anda tidak hanya memenuhi kebutuhan materil, tapi juga mengukir senyuman dan menyalakan kembali harapan di hati mereka.",
      icon: Smile,
      delay: "100ms",
    },
    {
      title: "Kebaikan yang Berkelanjutan",
      description: "Mari bersama-sama ciptakan dampak positif jangka panjang untuk kemandirian dan kesejahteraan saudara-saudara kita yang membutuhkan.",
      icon: TrendingUp,
      delay: "200ms",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Mengapa Kita Harus Berbagi?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Kepedulian Anda adalah wujud nyata dari kemanusiaan. Bersama, kita bisa memberikan dampak yang besar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {virtues.map((virtue, index) => {
            const Icon = virtue.icon;
            return (
              <Card
                key={index}
                className="p-6 md:p-8 text-center bg-white/95 backdrop-blur-sm hover:shadow-glow transition-all duration-300 animate-fade-in border-none shadow-lg flex flex-col items-center"
                style={{ animationDelay: virtue.delay }}
              >
                <div className="p-4 bg-primary/10 rounded-full mb-6 text-primary">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {virtue.title}
                </h3>
                <p className="text-gray-600 flex-1 text-sm md:text-base leading-relaxed">
                  {virtue.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VirtuesOfCharity;
