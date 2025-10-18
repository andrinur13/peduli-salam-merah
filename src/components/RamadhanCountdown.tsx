import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const RamadhanCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set Ramadhan 2026 date (March 1, 2026 - approximate)
    const ramadhanDate = new Date("2026-03-01T00:00:00");

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = ramadhanDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Calendar className="h-8 w-8 text-white" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Countdown Ramadhan 1447 H
            </h2>
          </div>
          <p className="text-lg text-white/90">
            Persiapkan diri menyambut bulan penuh berkah
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: "Hari", value: timeLeft.days },
            { label: "Jam", value: timeLeft.hours },
            { label: "Menit", value: timeLeft.minutes },
            { label: "Detik", value: timeLeft.seconds },
          ].map((item, index) => (
            <Card
              key={item.label}
              className="p-6 text-center bg-white/95 backdrop-blur-sm hover:shadow-glow transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {item.value.toString().padStart(2, "0")}
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                {item.label}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-white/80 italic">
            "Bulan Ramadhan adalah bulan yang di dalamnya diturunkan Al-Qur'an"
          </p>
        </div>
      </div>
    </section>
  );
};

export default RamadhanCountdown;
