import { useEffect, useState } from "react";
import CampaignCard from "./CampaignCard";
import { fetchCampaigns, CampaignApiItem } from "@/lib/api";

type UICampaign = {
  id: string;
  title: string;
  image: string;
  description: string;
  target: number;
  collected: number;
  daysLeft: number;
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState<UICampaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: CampaignApiItem[] = await fetchCampaigns(1, 10);
        const mapped: UICampaign[] = data.map((c) => ({
          id: c.id,
          title: c.name,
          image: c.hero_img || "/placeholder.svg",
          description: c.description || "",
          target: c.total_fund || 0,
          collected: c.current_fund || 0,
          daysLeft: typeof c.count_day_string === "number" ? c.count_day_string : 0,
        }));
        setCampaigns(mapped);
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : typeof e === "string"
            ? e
            : "Gagal memuat campaign";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section id="campaigns" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Campaign Aktif
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilih campaign yang ingin Anda dukung dan mulai berbagi kebaikan hari ini
          </p>
        </div>
        {loading && (
          <div className="text-center text-muted-foreground">Memuat campaign...</div>
        )}
        {error && (
          <div className="text-center text-red-600">{error}</div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, index) => (
              <div
                key={campaign.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CampaignCard {...campaign} />
              </div>
            ))}
            {campaigns.length === 0 && (
              <div className="col-span-3 text-center text-muted-foreground">
                Belum ada campaign.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CampaignList;
