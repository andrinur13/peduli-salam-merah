import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Upload, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";
import Footer from "./Footer";

interface DonationFormProps {
  campaign: any;
  onBack: () => void;
}

const DonationForm = ({ campaign, onBack }: DonationFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    amount: 0,
    customAmount: "",
  });
  const [proofImage, setProofImage] = useState<string | null>(null);
  const { toast } = useToast();

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAmountSelect = (amount: number) => {
    setFormData({ ...formData, amount, customAmount: "" });
  };

  const handleCustomAmount = (value: string) => {
    const numValue = parseInt(value.replace(/\D/g, "")) || 0;
    setFormData({ ...formData, customAmount: value, amount: numValue });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.whatsapp || formData.amount === 0) {
        toast({
          title: "Data belum lengkap",
          description: "Mohon lengkapi semua data donasi",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = () => {
    if (!proofImage) {
      toast({
        title: "Bukti transfer belum diunggah",
        description: "Mohon unggah bukti transfer Anda",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Donasi berhasil dikonfirmasi!",
      description: "Terima kasih atas donasi Anda. Status: Menunggu verifikasi admin",
    });

    // Redirect back after 2 seconds
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Disalin!",
      description: "Nomor rekening berhasil disalin",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      s <= step
                        ? "bg-gradient-hero text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? <Check className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        s < step ? "bg-primary" : "bg-muted"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span className={step >= 1 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Buat Transaksi
              </span>
              <span className={step >= 2 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Pembayaran
              </span>
              <span className={step >= 3 ? "text-primary font-semibold" : "text-muted-foreground"}>
                Konfirmasi
              </span>
            </div>
          </div>

          <Card className="p-6 md:p-8">
            {/* Step 1: Create Transaction */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Buat Transaksi Donasi
                  </h2>
                  <p className="text-muted-foreground">
                    Untuk: {campaign.title}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      placeholder="Masukkan nama Anda"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      placeholder="08123456789"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Pilih Jumlah Donasi</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {[25000, 50000, 100000].map((amount) => (
                        <Button
                          key={amount}
                          variant={formData.amount === amount ? "default" : "outline"}
                          className={formData.amount === amount ? "bg-gradient-hero" : ""}
                          onClick={() => handleAmountSelect(amount)}
                        >
                          {formatRupiah(amount)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom">Atau Isi Sendiri</Label>
                    <Input
                      id="custom"
                      placeholder="Masukkan jumlah donasi"
                      value={formData.customAmount}
                      onChange={(e) => handleCustomAmount(e.target.value)}
                    />
                  </div>

                  {formData.amount > 0 && (
                    <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
                      <div className="text-sm text-muted-foreground mb-1">Total Donasi</div>
                      <div className="text-2xl font-bold text-primary">
                        {formatRupiah(formData.amount)}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 font-semibold"
                  onClick={handleNextStep}
                >
                  Lanjutkan ke Pembayaran
                </Button>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Informasi Pembayaran
                  </h2>
                  <p className="text-muted-foreground">
                    Silakan transfer sesuai nominal yang tertera
                  </p>
                </div>

                <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary">
                  <div className="text-sm text-muted-foreground mb-1">Jumlah yang harus dibayar</div>
                  <div className="text-3xl font-bold text-primary mb-4">
                    {formatRupiah(formData.amount)}
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-primary/20">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Rekening Tujuan</div>
                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Bank BCA</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard("1234567890")}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Salin
                          </Button>
                        </div>
                        <div className="text-2xl font-bold text-foreground">1234567890</div>
                        <div className="text-sm text-muted-foreground mt-1">a.n. SM Peduli Foundation</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Cara Transfer:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Buka aplikasi mobile banking Anda</li>
                    <li>Pilih menu transfer ke bank BCA</li>
                    <li>Masukkan nomor rekening tujuan</li>
                    <li>Input nominal sesuai yang tertera</li>
                    <li>Konfirmasi dan selesaikan transaksi</li>
                    <li>Simpan bukti transfer untuk konfirmasi</li>
                  </ol>
                </div>

                <Button
                  className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 font-semibold"
                  onClick={handleNextStep}
                >
                  Sudah Transfer, Lanjutkan
                </Button>
              </div>
            )}

            {/* Step 3: Upload Proof */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Konfirmasi Pembayaran
                  </h2>
                  <p className="text-muted-foreground">
                    Upload bukti transfer Anda
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Detail Donasi</Label>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Nama</span>
                        <span className="text-sm font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">WhatsApp</span>
                        <span className="text-sm font-medium">{formData.whatsapp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Jumlah</span>
                        <span className="text-sm font-bold text-primary">{formatRupiah(formData.amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Bukti Transfer</Label>
                    <div className="mt-2">
                      {!proofImage ? (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Klik untuk upload</span>
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 5MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setProofImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      ) : (
                        <div className="relative">
                          <img
                            src={proofImage}
                            alt="Bukti Transfer"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setProofImage(null)}
                          >
                            Hapus
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 font-semibold"
                  onClick={handleSubmit}
                >
                  Konfirmasi Donasi
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DonationForm;
