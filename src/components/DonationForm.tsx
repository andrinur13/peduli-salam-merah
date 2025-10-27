import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Upload, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";
import Footer from "./Footer";
import { createDonation, fetchBanks, confirmDonationReceipt, type BankItem } from "@/lib/api";

interface DonationFormProps {
  campaign: { id: string; title: string };
  onBack: () => void;
}

const DonationForm = ({ campaign, onBack }: DonationFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    doa: "",
    amount: 0,
    customAmount: "",
  });
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [banksLoading, setBanksLoading] = useState<boolean>(false);
  const [banksError, setBanksError] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [creatingDonation, setCreatingDonation] = useState<boolean>(false);
  const [donationCreatedMsg, setDonationCreatedMsg] = useState<string | null>(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState<boolean>(false);
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);
  const [flowCompleted, setFlowCompleted] = useState<boolean>(false);
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
      if (!formData.name || !formData.whatsapp || !formData.email || formData.amount === 0) {
        toast({
          title: "Data belum lengkap",
          description: "Mohon lengkapi semua data donasi (nama, WhatsApp, email, jumlah)",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    }
  };

  const handleCreateDonation = async () => {
    try {
      setCreatingDonation(true);
      setDonationCreatedMsg(null);
      if (!selectedBankId) {
        toast({
          title: "Pilih rekening terlebih dahulu",
          description: "Mohon pilih rekening tujuan bank",
          variant: "destructive",
        });
        setCreatingDonation(false);
        return;
      }
      if (formData.amount <= 0) {
        toast({
          title: "Jumlah donasi tidak valid",
          description: "Mohon isi jumlah donasi",
          variant: "destructive",
        });
        setCreatingDonation(false);
        return;
      }

      const payload = {
        campaign_id: campaign.id,
        amount: formData.amount,
        name: formData.name,
        email: formData.email,
        phone_number: formData.whatsapp,
        doa: formData.doa || undefined,
        bank_id: selectedBankId,
      };
      const res = await createDonation(payload);
      setDonationId(res.donation_id);
      setDonationCreatedMsg(`Donasi berhasil dibuat. ID: ${res.donation_id}`);
      toast({ title: "Donasi dibuat", description: `ID Donasi: ${res.donation_id}` });
      setStep(3);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal membuat donasi";
      toast({ title: "Terjadi kesalahan", description: message, variant: "destructive" });
    } finally {
      setCreatingDonation(false);
    }
  };

  const handleConfirmReceipt = async () => {
    try {
      setConfirmingReceipt(true);
      setConfirmSuccess(null);
      if (!donationId) {
        toast({ title: "Donasi belum dibuat", description: "Silakan buat donasi terlebih dahulu", variant: "destructive" });
        setConfirmingReceipt(false);
        return;
      }
      if (!proofFile) {
        toast({
          title: "Bukti transfer belum diunggah",
          description: "Mohon unggah bukti transfer Anda",
          variant: "destructive",
        });
        setConfirmingReceipt(false);
        return;
      }
      await confirmDonationReceipt(donationId, proofFile);
      toast({ title: "Konfirmasi donasi berhasil!", description: `ID Donasi: ${donationId}` });
      setConfirmSuccess(`Donasi berhasil dikonfirmasi. ID: ${donationId}`);
      setFlowCompleted(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal mengonfirmasi donasi";
      toast({ title: "Terjadi kesalahan", description: message, variant: "destructive" });
    } finally {
      setConfirmingReceipt(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Disalin!",
      description: "Nomor rekening berhasil disalin",
    });
  };

  useEffect(() => {
    const loadBanks = async () => {
      setBanksLoading(true);
      setBanksError(null);
      try {
        const list = await fetchBanks();
        setBanks(list);
        if (list.length > 0) {
          setSelectedBankId(list[0].id);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Gagal memuat rekening";
        setBanksError(message);
      } finally {
        setBanksLoading(false);
      }
    };
    loadBanks();
  }, []);

  const selectedBank = useMemo(() => banks.find(b => b.id === selectedBankId), [banks, selectedBankId]);

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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@contoh.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

                  <div>
                    <Label htmlFor="doa">Doa/Keterangan</Label>
                    <Input
                      id="doa"
                      placeholder="Doa atau pesan untuk campaign"
                      value={formData.doa}
                      onChange={(e) => setFormData({ ...formData, doa: e.target.value })}
                    />
                  </div>
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
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    Pilih Rekening & Pembayaran
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Pilih rekening tujuan terlebih dahulu, lalu lakukan transfer sesuai nominal
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
                      {banksLoading && (
                        <div className="text-sm text-muted-foreground">Memuat rekening...</div>
                      )}
                      {banksError && (
                        <div className="text-sm text-red-600">{banksError}</div>
                      )}
                      {!banksLoading && !banksError && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {banks.map((b) => {
                              const isSelected = selectedBankId === b.id;
                              const logo = b.icon_url || b.logo;
                              return (
                                <div
                                  key={b.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setSelectedBankId(b.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") setSelectedBankId(b.id);
                                  }}
                                  className={`relative p-4 rounded-lg border transition-all duration-200 cursor-pointer bg-white ${
                                    isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {logo ? (
                                      <img src={logo} alt={b.bank_name} className="h-10 w-10 object-contain" />
                                    ) : (
                                      <div className="h-10 w-10 rounded bg-muted" />
                                    )}
                                    <div className="min-w-0">
                                      <div className="font-semibold truncate">{b.bank_name}</div>
                                      <div className="text-xs text-muted-foreground truncate">a.n. {b.name}</div>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 text-primary">
                                      <Check className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {selectedBank && (
                            <div className="bg-white p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{selectedBank.bank_name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(selectedBank.account_number)}
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Salin
                                </Button>
                              </div>
                              <div className="text-2xl font-bold text-foreground">{selectedBank.account_number}</div>
                              <div className="text-sm text-muted-foreground mt-1">a.n. {selectedBank.name}</div>
                            </div>
                          )}
                        </div>
                      )}
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

                {donationCreatedMsg && (
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50 text-green-800">
                    {donationCreatedMsg}
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 font-semibold"
                  onClick={handleCreateDonation}
                  disabled={creatingDonation}
                >
                  {creatingDonation ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Membuat Donasi...
                    </span>
                  ) : (
                    "Buat Donasi"
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Upload Proof or Success Pane */}
            {step === 3 && !flowCompleted && (
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
                              const file = e.target.files?.[0] ?? null;
                              setProofFile(file);
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setProofImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              } else {
                                setProofImage(null);
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
                            onClick={() => {
                              setProofImage(null);
                              setProofFile(null);
                            }}
                          >
                            Hapus
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {confirmSuccess && (
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50 text-green-800">
                    {confirmSuccess}
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 font-semibold"
                  onClick={handleConfirmReceipt}
                  disabled={confirmingReceipt}
                >
                  {confirmingReceipt ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengonfirmasi...
                    </span>
                  ) : (
                    "Konfirmasi Donasi"
                  )}
                </Button>
              </div>
            )}

            {step === 3 && flowCompleted && (
              <div className="relative overflow-hidden">
                {/* Confetti dots */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute top-6 left-8 h-2 w-2 rounded-full bg-pink-400 animate-bounce" />
                  <div className="absolute top-12 right-10 h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
                  <div className="absolute bottom-10 left-16 h-2 w-2 rounded-full bg-yellow-400 animate-bounce" />
                  <div className="absolute bottom-6 right-14 h-2 w-2 rounded-full bg-green-500 animate-bounce" />
                  <div className="absolute top-1/2 left-4 h-2 w-2 rounded-full bg-purple-500 animate-bounce" />
                  <div className="absolute top-1/3 right-6 h-2 w-2 rounded-full bg-orange-500 animate-bounce" />
                </div>

                <div className="flex flex-col items-center text-center space-y-4 p-10">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-green-500/15 flex items-center justify-center">
                      <div className="absolute inline-flex h-20 w-20 rounded-full bg-green-400/20 animate-ping" />
                      <div className="relative h-14 w-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md">
                        <Check className="h-8 w-8" />
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold">Terima kasih! Donasi Anda berhasil dikonfirmasi.</h2>
                  <p className="text-muted-foreground max-w-md">
                    Kami telah menerima bukti transfer Anda. Tim kami akan segera memverifikasi dan mengupdate status donasi.
                  </p>

                  {donationId && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">ID Donasi:</span>
                      <span className="font-mono text-sm font-semibold">{donationId}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(donationId)}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Salin
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-4">
                    <Button className="w-full" onClick={onBack}>
                      Kembali ke Campaign
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => {
                        const text = encodeURIComponent(`Saya baru saja berdonasi untuk "${campaign.title}". ID Donasi: ${donationId ?? "-"}`);
                        window.open(`https://wa.me/?text=${text}`, "_blank");
                      }}
                    >
                      Bagikan via WhatsApp
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setFlowCompleted(false);
                        setConfirmSuccess(null);
                      }}
                    >
                      Upload Ulang Bukti
                    </Button>
                  </div>
                </div>
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
