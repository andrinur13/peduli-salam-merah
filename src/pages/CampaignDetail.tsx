import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Share2, Heart, Calendar, TrendingUp, Users, ArrowLeft } from "lucide-react";
import DonationForm from "@/components/DonationForm";

// Mock campaign data
const campaignData: Record<string, any> = {
  "1": {
    title: "Bantu Pembangunan Masjid Al-Ikhlas",
    image: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=1200&auto=format&fit=crop",
    description: "Mari bersama membangun masjid untuk tempat ibadah umat muslim di kampung Surabaya Timur",
    fullDescription: `Assalamualaikum warahmatullahi wabarakatuh,

Kami dari pengurus Masjid Al-Ikhlas mengajak saudara-saudara sekalian untuk bergotong royong membangun tempat ibadah yang layak untuk umat muslim di wilayah Surabaya Timur.

Saat ini kondisi masjid sangat memprihatinkan, dengan bangunan yang sudah tua dan tidak layak untuk beribadah. Kami membutuhkan dana untuk:

• Renovasi total bangunan masjid
• Pembangunan tempat wudhu yang memadai
• Pengadaan sound system dan perlengkapan masjid
• Pembangunan area parkir

Dana yang terkumpul akan digunakan sepenuhnya untuk pembangunan masjid dan akan kami laporkan secara transparan kepada para donatur.

Semoga Allah SWT membalas kebaikan semua pihak yang turut berpartisipasi dalam pembangunan rumah Allah ini. Aamiin.`,
    target: 500000000,
    collected: 350000000,
    daysLeft: 45,
    donorCount: 1234,
    expenses: [
      { name: "Biaya Renovasi Utama", amount: 150000000, icon: "🏗️" },
      { name: "Tempat Wudhu", amount: 80000000, icon: "🚿" },
      { name: "Sound System", amount: 50000000, icon: "🔊" },
      { name: "Area Parkir", amount: 70000000, icon: "🅿️" },
    ],
  },
};

const CampaignDetail = () => {
  const { id } = useParams();
  const [showDonationForm, setShowDonationForm] = useState(false);
  
  const campaign = campaignData[id || "1"];
  
  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  const progress = (campaign.collected / campaign.target) * 100;
  
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (showDonationForm) {
    return <DonationForm campaign={campaign} onBack={() => setShowDonationForm(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
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

              {/* Expenses Breakdown */}
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Rincian Penyaluran Dana
                </h2>
                <div className="space-y-4">
                  {campaign.expenses.map((expense: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{expense.icon}</span>
                        <span className="font-medium">{expense.name}</span>
                      </div>
                      <span className="font-bold text-primary">
                        {formatRupiah(expense.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
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
      </main>

      <Footer />
    </div>
  );
};

export default CampaignDetail;
