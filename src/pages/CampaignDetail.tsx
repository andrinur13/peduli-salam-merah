import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Share2, Heart, Calendar, TrendingUp, Users, ArrowLeft, Receipt, ChevronDown, ChevronUp, Maximize2, X, PieChart, Wallet, TrendingDown } from "lucide-react";
import DonationForm from "@/components/DonationForm";
import { fetchCampaignById, UsageItem, StatisticsData } from "@/lib/api";

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
  usages?: UsageItem[];
  statistics?: StatisticsData;
};

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [campaign, setCampaign] = useState<DetailCampaignUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Constants for description truncation
  const DESCRIPTION_PREVIEW_LENGTH = 300;

  // Helper function to truncate description
  const getTruncatedDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

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
          usages: d.usages || [],
          statistics: d.statistics,
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
            <div 
              className="relative h-48 md:h-64 lg:h-96 bg-muted cursor-pointer group"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={campaign.image}
                alt={campaign.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Maximize2 className="h-5 w-5" />
              </div>
            </div>

            {/* Image Modal */}
            <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
              <DialogContent className="max-w-7xl w-full p-0 overflow-hidden bg-black/95 border-none">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="relative w-full h-[90vh] flex items-center justify-center">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div className="container mx-auto px-4 -mt-12 md:-mt-16 relative z-10 pb-8 md:pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                
                {/* Mobile: Donation Card First */}
                <div className="lg:col-span-1 lg:order-2">
                  <Card className="p-4 md:p-6 lg:sticky lg:top-20">
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

                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 pb-6 border-b border-border">
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div className="text-base md:text-lg font-bold">{campaign.donorCount}</div>
                        <div className="text-xs text-muted-foreground">Donatur</div>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div className="text-base md:text-lg font-bold">{campaign.daysLeft}</div>
                        <div className="text-xs text-muted-foreground">Hari Lagi</div>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div className="text-base md:text-lg font-bold">{progress.toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">Tercapai</div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 font-semibold text-base md:text-lg py-4 md:py-6"
                      onClick={() => setShowDonationForm(true)}
                    >
                      Donasi Sekarang
                    </Button>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Donasi Anda akan tersalurkan dengan aman dan transparan
                    </p>
                  </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 lg:order-1">
                  <Card className="p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
                    {/* <Link to="/" className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Beranda
                    </Link> */}
                    
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                      {campaign.title}
                    </h1>
                    
                    <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
                      <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
                        <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                        Bagikan
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
                        <Heart className="h-3 w-3 md:h-4 md:w-4" />
                        Favorit
                      </Button>
                    </div>

                    <div className="prose max-w-none">
                      <p className="text-muted-foreground whitespace-pre-line">
                        {showFullDescription 
                          ? campaign.fullDescription 
                          : getTruncatedDescription(campaign.fullDescription, DESCRIPTION_PREVIEW_LENGTH)
                        }
                      </p>
                      
                      {campaign.fullDescription.length > DESCRIPTION_PREVIEW_LENGTH && (
                        <div className="mt-4 flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="group px-4 py-2 h-auto font-medium text-primary hover:text-primary/80 hover:bg-primary/5 rounded-full border border-primary/20 hover:border-primary/40 transition-all duration-200"
                          >
                            {showFullDescription ? (
                              <>
                                <span>Tampilkan Lebih Sedikit</span>
                                <ChevronUp className="ml-2 h-4 w-4 group-hover:-translate-y-0.5 transition-transform duration-200" />
                              </>
                            ) : (
                              <>
                                <span>Baca Selengkapnya</span>
                                <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* {campaign.bank && (
                    <Card className="p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Informasi Rekening</h2>
                      <div className="flex items-center gap-3 md:gap-4">
                        {campaign.bank.logo && (
                          <img src={campaign.bank.logo} alt={campaign.bank.bank_name} className="h-8 w-8 md:h-10 md:w-10 object-contain" />
                        )}
                        <div>
                          <div className="font-semibold text-sm md:text-base">{campaign.bank.bank_name}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">Atas Nama: {campaign.bank.name}</div>
                          <div className="text-xs md:text-sm">No. Rekening: {campaign.bank.account_number}</div>
                        </div>
                      </div>
                    </Card>
                  )} */}

                  {/* Statistics Section */}
                  {campaign.statistics && (
                    <Card className="p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
                      <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <PieChart className="h-6 w-6 text-primary" />
                        <h2 className="text-xl md:text-2xl font-bold text-foreground">Statistik Pengelolaan Dana</h2>
                      </div>
                      
                      {/* Financial Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-green-800 font-medium">Dana Terkumpul</span>
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            {formatRupiah(campaign.collected)}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                            <span className="text-sm text-red-800 font-medium">Total Pengeluaran</span>
                          </div>
                          <div className="text-2xl font-bold text-red-900">
                            {formatRupiah(campaign.statistics.total_usage)}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-blue-800 font-medium">Sisa Dana</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            {formatRupiah(campaign.statistics.remaining_fund)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Detail Usages */}
                      {campaign.statistics.detail_usages && campaign.statistics.detail_usages.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-4">Rincian Pengeluaran</h3>
                          <div className="space-y-3">
                            {campaign.statistics.detail_usages.map((usage) => (
                              <div key={usage.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="font-semibold text-base text-gray-900 mb-1">{usage.category_name}</div>
                                    {usage.description && (
                                      <p className="text-sm text-gray-600">{usage.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lg text-primary">
                                      {formatRupiah(parseFloat(usage.amount) || 0)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}

                  
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
