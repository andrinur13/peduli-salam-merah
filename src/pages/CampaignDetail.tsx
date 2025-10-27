import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Share2, Heart, Calendar, TrendingUp, Users, ArrowLeft } from "lucide-react";
import DonationForm from "@/components/DonationForm";
import { fetchCampaignById } from "@/lib/api";

type DetailCampaignUI = {
  id: string;
  title: string;
  image: string;
  description: string;
  fullDescription: string;
  target: number;
  collected: number;
  daysLeft: number;
  donorCount: number;
  bank?: {
    name: string;
    bank_name: string;
    account_number: string;
    logo?: string;
  };
};

const CampaignDetail = () => {
  const { id } = useParams();
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [campaign, setCampaign] = useState<DetailCampaignUI | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const d = await fetchCampaignById(id);
        const mapped: DetailCampaignUI = {
          id: d.id,
          title: d.name,
          image: d.hero_img || "/placeholder.svg",
          description: d.description || "",
          fullDescription: d.description || "",
          target: d.total_fund || 0,
          collected: d.current_fund || 0,
          daysLeft: typeof d.count_day_string === "number" ? d.count_day_string : 0,
          donorCount: typeof d.funder_count === "number" ? d.funder_count : 0,
          bank: d.bank
            ? {
                name: d.bank.name,
                bank_name: d.bank.bank_name,
                account_number: d.bank.account_number,
                logo: d.bank.logo,
              }
            : undefined,
        };
        setCampaign(mapped);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Gagal memuat campaign";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const progress = useMemo(() => {
    if (!campaign || campaign.target === 0) return 0;
    return (campaign.collected / campaign.target) * 100;
  }, [campaign]);
  
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (showDonationForm && campaign) {
    return <DonationForm campaign={campaign} onBack={() => setShowDonationForm(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {loading && (
          <div className="container mx-auto px-4 py-10 text-center text-muted-foreground">Memuat campaign...</div>
        )}
        {error && (
          <div className="container mx-auto px-4 py-10 text-center text-red-600">{error}</div>
        )}
        {campaign && (
          <>
            {/* Hero Image */}
            <div className="relative h-64 md:h-96 bg-muted">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-10 pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
                <div className="lg:col-span-2">
                  <Card className="p-6 md:p-8 mb-6">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Beranda
                    </Link>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                      {campaign.title}
                    </h1>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Bagikan
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Heart className="h-4 w-4" />
                        Favorit
                      </Button>
                    </div>

                    <div className="prose max-w-none">
                      <p className="text-muted-foreground whitespace-pre-line">
                        {campaign.fullDescription}
                      </p>
                    </div>
                  </Card>

                  {campaign.bank && (
                    <Card className="p-6 md:p-8 mb-6">
                      <h2 className="text-2xl font-bold text-foreground mb-4">Informasi Rekening</h2>
                      <div className="flex items-center gap-4">
                        {campaign.bank.logo && (
                          <img src={campaign.bank.logo} alt={campaign.bank.bank_name} className="h-10 w-10 object-contain" />
                        )}
                        <div>
                          <div className="font-semibold">{campaign.bank.bank_name}</div>
                          <div className="text-sm text-muted-foreground">Atas Nama: {campaign.bank.name}</div>
                          <div className="text-sm">No. Rekening: {campaign.bank.account_number}</div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

            {/* Sidebar - Donation Card */}
                <div className="lg:col-span-1">
                  <Card className="p-6 sticky top-20">
                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Dana Terkumpul</div>
                        <div className="text-2xl md:text-3xl font-bold text-primary">
                          {formatRupiah(campaign.collected)}
                        </div>
                      </div>

                      <Progress value={progress} className="h-3" />

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Target: {formatRupiah(campaign.target)}</span>
                        <span className="font-semibold text-primary">{progress.toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-border">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-lg font-bold">{campaign.donorCount}</div>
                        <div className="text-xs text-muted-foreground">Donatur</div>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-lg font-bold">{campaign.daysLeft}</div>
                        <div className="text-xs text-muted-foreground">Hari Lagi</div>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-lg font-bold">{progress.toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Tercapai</div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 font-semibold text-lg py-6"
                      onClick={() => setShowDonationForm(true)}
                    >
                      Donasi Sekarang
                    </Button>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Donasi Anda akan tersalurkan dengan aman dan transparan
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CampaignDetail;
