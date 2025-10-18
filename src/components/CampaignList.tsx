import CampaignCard from "./CampaignCard";

// Mock data - in real app this would come from API/database
const campaigns = [
  {
    id: "1",
    title: "Bantu Pembangunan Masjid Al-Ikhlas",
    image: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=800&auto=format&fit=crop",
    description: "Mari bersama membangun masjid untuk tempat ibadah umat muslim di kampung Surabaya Timur",
    target: 500000000,
    collected: 350000000,
    daysLeft: 45,
  },
  {
    id: "2",
    title: "Peduli Pendidikan Anak Yatim",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop",
    description: "Bantu biaya pendidikan anak yatim agar mereka bisa meraih masa depan yang lebih baik",
    target: 200000000,
    collected: 125000000,
    daysLeft: 30,
  },
  {
    id: "3",
    title: "Bantuan Bencana Banjir Surabaya",
    image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop",
    description: "Salurkan bantuan untuk korban banjir yang membutuhkan makanan, pakaian, dan tempat tinggal",
    target: 150000000,
    collected: 89000000,
    daysLeft: 15,
  },
  {
    id: "4",
    title: "Wakaf Al-Quran untuk Pesantren",
    image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop",
    description: "Sumbangkan Al-Quran untuk santri di pesantren yang membutuhkan kitab suci",
    target: 100000000,
    collected: 72000000,
    daysLeft: 60,
  },
  {
    id: "5",
    title: "Bantuan Operasi Kakek Miskin",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop",
    description: "Kakek Suparman membutuhkan biaya operasi jantung segera. Mari kita bantu!",
    target: 75000000,
    collected: 45000000,
    daysLeft: 20,
  },
  {
    id: "6",
    title: "Program Makan Siang Gratis",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop",
    description: "Sediakan makan siang gratis untuk anak-anak kurang mampu setiap hari",
    target: 300000000,
    collected: 180000000,
    daysLeft: 90,
  },
];

const CampaignList = () => {
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
        </div>
      </div>
    </section>
  );
};

export default CampaignList;
