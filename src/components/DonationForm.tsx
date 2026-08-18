import { useEffect, useMemo, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Check, Upload, Copy, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";
import Footer from "./Footer";
import { createDonation, fetchBanks, confirmDonationReceipt, fetchDonationDetail, fetchOnlinePaymentConfig, type BankItem, type DonationDetailResponse } from "@/lib/api";

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
  const [donationDetail, setDonationDetail] = useState<DonationDetailResponse["data"] | null>(null);
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [banksLoading, setBanksLoading] = useState<boolean>(false);
  const [banksError, setBanksError] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "online_xendit">("bank_transfer");
  const [xenditInvoiceUrl, setXenditInvoiceUrl] = useState<string | null>(null);
  const [onlinePaymentStatus, setOnlinePaymentStatus] = useState<"ACTIVE" | "INACTIVE">("INACTIVE");
  const [isPollingStatus, setIsPollingStatus] = useState<boolean>(false);
  const [creatingDonation, setCreatingDonation] = useState<boolean>(false);
  const [donationCreatedMsg, setDonationCreatedMsg] = useState<string | null>(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState<boolean>(false);
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);
  const [flowCompleted, setFlowCompleted] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const { toast } = useToast();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          description: "Mohon lengkapi data wajib: Nama Lengkap, Nomor WhatsApp, dan Jumlah Donasi",
          variant: "destructive",
        });
        return;
      }
      setShowConfirmModal(true);
    }
  };

  const handleConfirmData = () => {
    setShowConfirmModal(false);
    setStep(2);
  };

  const handleCreateDonation = async () => {
    try {
      setCreatingDonation(true);
      setDonationCreatedMsg(null);
      
      // Validate based on payment method
      if (paymentMethod === "online_xendit" && onlinePaymentStatus !== "ACTIVE") {
        toast({
          title: "Pembayaran online tidak tersedia",
          description: "Silakan pilih metode transfer bank",
          variant: "destructive",
        });
        setPaymentMethod("bank_transfer");
        setCreatingDonation(false);
        return;
      }

      if (paymentMethod === "bank_transfer" && !selectedBankId) {
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

      // Handle XENDIT payment
      if (paymentMethod === "online_xendit") {
        const payload = {
          campaign_id: campaign.id,
          amount: formData.amount,
          name: formData.name,
          email: formData.email,
          phone_number: formData.whatsapp,
          doa: formData.doa || undefined,
          bank_id: "XENDIT",
        };
        
        const res = await createDonation(payload);
        
        // Store donation ID (could be transaction_id for XENDIT)
        const donationIdFromResponse = res.donation_id || res.transaction_id || "";
        setDonationId(donationIdFromResponse);
        
        // Store invoice URL
        if (res.invoice_url) {
          setXenditInvoiceUrl(res.invoice_url);
        }
        
        // Fetch detail to get latest info
        if (donationIdFromResponse) {
          try {
            const detail = await fetchDonationDetail(donationIdFromResponse);
            setDonationDetail(detail);
            
            // Start polling for status updates
            startStatusPolling(donationIdFromResponse);
          } catch (err) {
            console.error("Failed to fetch donation detail:", err);
          }
        }
        
        toast({ 
          title: "Invoice dibuat", 
          description: "Silakan selesaikan pembayaran online" 
        });
        
        // Move to step 3 to show iframe
        setStep(3);
        return;
      }

      // Handle Bank Transfer payment
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
      const donationIdFromResponse = res.donation_id || res.transaction_id || "";
      setDonationId(donationIdFromResponse);
      try {
        const detail = await fetchDonationDetail(donationIdFromResponse);
        setDonationDetail(detail);
      } catch (err) {
        // Non-fatal: proceed without detail
      }
      setDonationCreatedMsg(`Donasi berhasil dibuat. ID: ${donationIdFromResponse}`);
      toast({ title: "Donasi dibuat", description: `` });
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
      toast({ title: "Konfirmasi donasi berhasil!", description: `` });
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

  // Polling function to check payment status
  const startStatusPolling = (donationIdToCheck: string) => {
    setIsPollingStatus(true);
    
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const detail = await fetchDonationDetail(donationIdToCheck);
        setDonationDetail(detail);
        
        // If status is PAID, stop polling and show success
        if (detail.status === "PAID") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
          }
          setIsPollingStatus(false);
          setFlowCompleted(true);
          setXenditInvoiceUrl(null); // Hide iframe
          toast({ 
            title: "Pembayaran Berhasil!", 
            description: "Terima kasih atas donasi Anda" 
          });
        }
      } catch (err) {
        console.error("Failed to poll donation status:", err);
      }
    }, 3000); // Poll every 3 seconds
    
    // Stop polling after 10 minutes (600 seconds)
    pollingTimeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setIsPollingStatus(false);
    }, 600000);
  };

  const handleBackNavigation = () => {
    if (step === 1) {
      // Jika di step 1, kembali ke campaign detail
      onBack();
    } else if (step === 2) {
      // Jika di step 2, kembali ke step 1 tanpa menghapus data
      setStep(1);
    } else if (step === 3 && !flowCompleted) {
      // Jika di step 3 dan belum selesai, kembali ke step 2 tanpa menghapus data
      setStep(2);
    } else {
      // Jika sudah selesai, kembali ke campaign detail
      onBack();
    }
  };

  const downloadQRIS = async (imageUrl: string, bankName: string) => {
    try {
      // Coba download langsung terlebih dahulu
      const response = await fetch(imageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QRIS_${bankName.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Berhasil!",
        description: "Gambar QRIS berhasil diunduh",
      });
    } catch (error) {
      // Jika CORS error, buka di tab baru
      window.open(imageUrl, '_blank');
      toast({
        title: "Buka di Tab Baru",
        description: "Silakan klik kanan pada gambar dan pilih 'Simpan gambar sebagai...' untuk mengunduh",
      });
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File terlalu besar",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format file tidak didukung",
        description: "Silakan upload file gambar (PNG, JPG, JPEG)",
        variant: "destructive",
      });
      return;
    }

    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  useEffect(() => {
    const loadBanks = async () => {
      setBanksLoading(true);
      setBanksError(null);
      try {
        const list = await fetchBanks(campaign.id);
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
  }, [campaign.id]);

  useEffect(() => {
    const loadOnlinePaymentConfig = async () => {
      try {
        const status = await fetchOnlinePaymentConfig();
        setOnlinePaymentStatus(status);
      } catch (err) {
        // Fallback to INACTIVE if config fails, to avoid showing unavailable method.
        setOnlinePaymentStatus("INACTIVE");
      }
    };

    loadOnlinePaymentConfig();
  }, []);

  useEffect(() => {
    if (onlinePaymentStatus !== "ACTIVE" && paymentMethod === "online_xendit") {
      setPaymentMethod("bank_transfer");
    }
  }, [onlinePaymentStatus, paymentMethod]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
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
            onClick={handleBackNavigation}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
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
                      className={`h-1 w-12 sm:w-16 mx-2 ${
                        s < step ? "bg-primary" : "bg-muted"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8 text-sm">
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
                    <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="Masukkan nama Anda"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email <span className="text-muted-foreground text-sm">(opsional)</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@contoh.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">Nomor WhatsApp <span className="text-red-500">*</span></Label>
                    <Input
                      id="whatsapp"
                      placeholder="08123456789"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      required
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
                    <Label htmlFor="doa">Doa/Keterangan (opsional)</Label>
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
                    Pilih Metode Pembayaran
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Pilih metode pembayaran yang Anda inginkan
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>Metode Pembayaran</Label>
                  <div
                    className={`grid grid-cols-1 gap-3 ${
                      onlinePaymentStatus === "ACTIVE" ? "sm:grid-cols-2" : "sm:grid-cols-1"
                    }`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setPaymentMethod("bank_transfer")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setPaymentMethod("bank_transfer");
                      }}
                      className={`relative p-5 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        paymentMethod === "bank_transfer"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50 bg-white"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold">Transfer Bank</div>
                          <div className="text-xs text-muted-foreground mt-1">Transfer manual ke rekening</div>
                        </div>
                      </div>
                      {paymentMethod === "bank_transfer" && (
                        <div className="absolute top-2 right-2 text-primary">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    {onlinePaymentStatus === "ACTIVE" && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setPaymentMethod("online_xendit")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setPaymentMethod("online_xendit");
                        }}
                        className={`relative p-5 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                          paymentMethod === "online_xendit"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50 bg-white"
                        }`}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold">Pembayaran Online</div>
                            <div className="text-xs text-muted-foreground mt-1">Bayar instan dengan berbagai metode</div>
                          </div>
                        </div>
                        {paymentMethod === "online_xendit" && (
                          <div className="absolute top-2 right-2 text-primary">
                            <Check className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Transfer Section */}
                {paymentMethod === "bank_transfer" && (
                  <>
                    <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary">
                      <div className="text-sm text-muted-foreground mb-1">Jumlah yang harus dibayar</div>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {formatRupiah(donationDetail?.amount ?? formData.amount)}
                      </div>
                      {donationDetail?.transaction_number && (
                        <div className="text-xs text-muted-foreground">
                          No. Transaksi: <span className="font-mono">{donationDetail.transaction_number}</span>
                        </div>
                      )}
                      
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
                                      <img
                                        src={logo}
                                        alt={b.bank_name}
                                        className={`${b.type?.toUpperCase() === 'QRIS' || /qris/i.test(b.bank_name) || /qris/i.test(b.name) ? "h-16 w-16" : "h-10 w-10"} object-contain`}
                                      />
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
                                {selectedBank.type?.toUpperCase() === 'QRIS' || /qris/i.test(selectedBank.bank_name) || /qris/i.test(selectedBank.name) ? (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => downloadQRIS(selectedBank.icon_url || selectedBank.logo, selectedBank.bank_name)}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Unduh QR
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(selectedBank.account_number)}
                                  >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Salin
                                  </Button>
                                )}
                              </div>
                              {selectedBank.type?.toUpperCase() === 'QRIS' || /qris/i.test(selectedBank.bank_name) || /qris/i.test(selectedBank.name) ? (
                                <div className="flex items-center justify-center p-2">
                                  <img
                                    src={selectedBank.icon_url || selectedBank.logo}
                                    alt="QRIS"
                                    className="max-h-80 w-auto object-contain rounded-md border"
                                  />
                                </div>
                              ) : (
                                <>
                                  <div className="text-2xl font-bold text-foreground">{selectedBank.account_number}</div>
                                  <div className="text-sm text-muted-foreground mt-1">a.n. {selectedBank.name}</div>
                                </>
                              )}
                            </div>
                          )}
                          {donationDetail && (
                            <div className="bg-white p-4 rounded-lg border border-muted">
                              <div className="font-semibold mb-2">Ringkasan Pembayaran</div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Metode: {donationDetail.payment_method}</div>
                                <div>Bank: {donationDetail.bank_name}</div>
                                <div>No. Rekening: {donationDetail.bank_account}</div>
                                <div>a.n. {donationDetail.bank_account_name}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">{selectedBank?.type?.toUpperCase() === 'QRIS' || (selectedBank && (/qris/i.test(selectedBank.bank_name) || /qris/i.test(selectedBank.name))) ? "Cara Bayar QRIS:" : "Cara Transfer:"}</h3>
                  {selectedBank?.type?.toUpperCase() === 'QRIS' || (selectedBank && (/qris/i.test(selectedBank.bank_name) || /qris/i.test(selectedBank.name))) ? (
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Buka aplikasi pembayaran yang mendukung QRIS</li>
                      <li>Pilih menu scan QR</li>
                      <li>Scan gambar QR di atas</li>
                      <li>Pastikan nominal sesuai yang tertera</li>
                      <li>Konfirmasi pembayaran</li>
                      <li>Simpan bukti pembayaran untuk konfirmasi</li>
                    </ol>
                  ) : (
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Buka aplikasi mobile banking Anda</li>
                      <li>Pilih menu transfer ke bank tujuan</li>
                      <li>Masukkan nomor rekening</li>
                      <li>Input nominal sesuai yang tertera</li>
                      <li>Konfirmasi dan selesaikan transaksi</li>
                      <li>Simpan bukti transfer untuk konfirmasi</li>
                    </ol>
                  )}
                    </div>
                  </>
                )}

                {/* Online XENDIT Section */}
                {paymentMethod === "online_xendit" && (
                  <div className="space-y-6">
                    <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary">
                      <div className="text-sm text-muted-foreground mb-1">Jumlah yang harus dibayar</div>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {formatRupiah(donationDetail?.amount ?? formData.amount)}
                      </div>
                      {donationDetail?.transaction_number && (
                        <div className="text-xs text-muted-foreground">
                          No. Transaksi: <span className="font-mono">{donationDetail.transaction_number}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-lg border-2 border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Online Payment Gateway</h3>
                          <p className="text-sm text-muted-foreground">Aman, Cepat & Terpercaya</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-3">Metode Pembayaran yang Tersedia:</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span>Virtual Account (BCA, BNI, BRI, Mandiri, dll)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span>E-Wallet (OVO, DANA, LinkAja, ShopeePay)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span>QRIS (Semua aplikasi e-wallet)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span>Kartu Kredit/Debit</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span>Alfamart & Indomaret</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span>Direct Debit</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <div className="flex gap-3">
                            <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-blue-800">
                              <p className="font-semibold mb-1">Cara Pembayaran:</p>
                              <ol className="list-decimal list-inside space-y-1">
                                <li>Klik tombol "Bayar Sekarang"</li>
                                <li>Anda akan diarahkan ke halaman pembayaran online</li>
                                <li>Pilih metode pembayaran yang Anda inginkan</li>
                                <li>Ikuti instruksi pembayaran</li>
                                <li>Setelah berhasil, Anda akan otomatis kembali ke halaman konfirmasi</li>
                              </ol>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          <span>Transaksi Anda dijamin aman dan terenkripsi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {donationCreatedMsg && paymentMethod === "bank_transfer" && (
                  <div className="p-4 rounded-lg border border-green-200 bg-green-50 text-green-800">
                    {donationCreatedMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                  <Button
                    className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 font-semibold"
                    onClick={handleCreateDonation}
                    disabled={creatingDonation || (paymentMethod === "bank_transfer" && !selectedBankId)}
                  >
                    {creatingDonation ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {paymentMethod === "online_xendit" ? "Memproses..." : "Membuat Donasi..."}
                      </span>
                    ) : (
                      paymentMethod === "online_xendit" ? "Bayar Sekarang" : "Buat Donasi"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Upload Proof or XENDIT Payment or Success Pane */}
            {step === 3 && !flowCompleted && paymentMethod === "bank_transfer" && (
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
                        <span className="text-sm font-bold text-primary">{formatRupiah(donationDetail?.amount ?? formData.amount)}</span>
                      </div>
                      {donationDetail?.transaction_number && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">No. Transaksi</span>
                          <span className="text-sm font-mono">{donationDetail.transaction_number}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Bukti Transfer</Label>
                    <div className="mt-2">
                      {!proofImage ? (
                        <label 
                          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                            isDragOver 
                              ? 'border-primary bg-primary/5 border-solid' 
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className={`h-10 w-10 mb-3 transition-colors ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">
                                {isDragOver ? 'Lepaskan file di sini' : 'Klik untuk upload atau seret file ke sini'}
                              </span>
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
                                handleFileSelect(file);
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
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
              </div>
            )}

            {/* Step 3: Online Payment */}
            {step === 3 && !flowCompleted && paymentMethod === "online_xendit" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Selesaikan Pembayaran
                  </h2>
                  <p className="text-muted-foreground">
                    Silakan lakukan pembayaran melalui halaman pembayaran di bawah ini
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
                        <span className="text-sm font-bold text-primary">{formatRupiah(donationDetail?.amount ?? formData.amount)}</span>
                      </div>
                      {donationDetail?.transaction_number && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">No. Transaksi</span>
                          <span className="text-sm font-mono">{donationDetail.transaction_number}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className={`text-sm font-semibold ${
                          donationDetail?.status === "PAID" ? "text-green-600" : "text-yellow-600"
                        }`}>
                          {donationDetail?.status === "PAID" ? "✓ LUNAS" : "⏱ MENUNGGU PEMBAYARAN"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {xenditInvoiceUrl && (
                    <div className="space-y-3">
                      <Label>Halaman Pembayaran Online</Label>
                      <div className="border-2 border-border rounded-lg overflow-hidden bg-white">
                        <iframe
                          src={xenditInvoiceUrl}
                          className="w-full h-[600px]"
                          title="Online Payment"
                          allow="payment"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className={`h-4 w-4 ${isPollingStatus ? 'animate-spin' : ''}`} />
                        <span>
                          {isPollingStatus 
                            ? "Menunggu konfirmasi pembayaran..." 
                            : "Silakan selesaikan pembayaran di atas"}
                        </span>
                      </div>
                    </div>
                  )}

                  {!xenditInvoiceUrl && donationDetail?.payment_url && (
                    <div className="space-y-3">
                      <Label>Link Pembayaran</Label>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <a 
                          href={donationDetail.payment_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {donationDetail.payment_url}
                        </a>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => window.open(donationDetail.payment_url!, "_blank")}
                        className="w-full"
                      >
                        Buka Halaman Pembayaran
                      </Button>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Catatan Penting:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Selesaikan pembayaran di halaman pembayaran online</li>
                        <li>Jangan tutup halaman ini sampai pembayaran selesai</li>
                        <li>Status akan diperbarui otomatis setelah pembayaran berhasil</li>
                        <li>Jika ada masalah, hubungi customer service</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(2);
                      setXenditInvoiceUrl(null);
                      setIsPollingStatus(false);
                      if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current);
                        pollingIntervalRef.current = null;
                      }
                      if (pollingTimeoutRef.current) {
                        clearTimeout(pollingTimeoutRef.current);
                        pollingTimeoutRef.current = null;
                      }
                    }}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      if (donationId) {
                        try {
                          const detail = await fetchDonationDetail(donationId);
                          setDonationDetail(detail);
                          if (detail.status === "PAID") {
                            setFlowCompleted(true);
                            setXenditInvoiceUrl(null);
                            if (pollingIntervalRef.current) {
                              clearInterval(pollingIntervalRef.current);
                              pollingIntervalRef.current = null;
                            }
                            if (pollingTimeoutRef.current) {
                              clearTimeout(pollingTimeoutRef.current);
                              pollingTimeoutRef.current = null;
                            }
                            toast({ 
                              title: "Pembayaran Berhasil!", 
                              description: "Terima kasih atas donasi Anda" 
                            });
                          } else {
                            toast({ 
                              title: "Status: " + detail.status, 
                              description: "Pembayaran masih dalam proses" 
                            });
                          }
                        } catch (err) {
                          toast({ 
                            title: "Gagal memeriksa status", 
                            variant: "destructive" 
                          });
                        }
                      }
                    }}
                    className="w-full"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Cek Status Manual
                  </Button>
                </div>
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

                  {donationDetail?.transaction_number && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <span className="text-sm">No. Transaksi:</span>
                      <span className="font-mono text-sm font-semibold">{donationDetail.transaction_number}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(donationDetail.transaction_number)}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Salin
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-3 w-full mt-6">
                    {/* Primary Action Buttons - Always centered */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                      <Button 
                        className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300 font-semibold" 
                        size="lg"
                        onClick={onBack}
                      >
                        Kembali ke Campaign
                      </Button>
                      <Button
                        className="w-full font-semibold"
                        variant="secondary"
                        size="lg"
                        onClick={() => {
                          const text = encodeURIComponent(`assalamu'alaikum warahmatullahi wabarakatuh, info admin.. saya sudah berdonasi, tolong bantu verifikasi.. terima kasih\njazaakumullahu khairan 🍃`);
                          window.open(`https://wa.me/6281235707515?text=${text}`, "_blank");
                        }}
                      >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Konfirmasi via WhatsApp
                      </Button>
                    </div>
                    
                    {/* Secondary Action - Only for Bank Transfer */}
                    {paymentMethod === "bank_transfer" && (
                      <Button
                        className="w-full max-w-md"
                        variant="outline"
                        onClick={() => {
                          setFlowCompleted(false);
                          setConfirmSuccess(null);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Ulang Bukti Transfer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Data</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Data Yang Anda inputkan sudah benar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nama Lengkap:</span>
              <span className="text-sm font-medium">{formData.name}</span>
            </div>
            {formData.email && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{formData.email}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">WhatsApp:</span>
              <span className="text-sm font-medium">{formData.whatsapp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Jumlah Donasi:</span>
              <span className="text-sm font-bold text-primary">{formatRupiah(formData.amount)}</span>
            </div>
            {formData.doa && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Doa/Keterangan:</span>
                <span className="text-sm font-medium">{formData.doa}</span>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Ubah Data</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmData}
              className="bg-gradient-hero hover:shadow-glow"
            >
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DonationForm;
