import { useEffect, useState } from "react";
import CampaignCard from "./CampaignCard";
import { fetchCampaigns, fetchCategories, fetchSubCategories, CampaignApiItem, CategoryItem, SubCategoryItem } from "@/lib/api";

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
  
  // Category filter states
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState<boolean>(false);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (e) {
        console.error("Failed to load categories:", e);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Load sub-categories when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const loadSubCategories = async () => {
        setLoadingSubCategories(true);
        setSelectedSubCategoryId(""); // Reset sub-category selection
        try {
          const data = await fetchSubCategories(selectedCategoryId);
          setSubCategories(data);
        } catch (e) {
          console.error("Failed to load sub-categories:", e);
          setSubCategories([]);
        } finally {
          setLoadingSubCategories(false);
        }
      };
      loadSubCategories();
    } else {
      setSubCategories([]);
      setSelectedSubCategoryId("");
    }
  }, [selectedCategoryId]);

  // Load campaigns with filters
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: CampaignApiItem[] = await fetchCampaigns(
          1, 
          10, 
          selectedCategoryId || undefined, 
          selectedSubCategoryId || undefined
        );
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
  }, [selectedCategoryId, selectedSubCategoryId]);

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

        {/* Category Filters */}
        <div className="mb-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Filter Campaign</h3>
            <p className="text-sm text-gray-600">Pilih kategori untuk menemukan campaign yang sesuai</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 justify-center items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Category Filter */}
              <div className="relative min-w-[240px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📂 Kategori
                </label>
                <div className="relative">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    disabled={loadingCategories}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">🏠 Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {loadingCategories && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Category Filter */}
              <div className="relative min-w-[240px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📋 Sub-Kategori
                </label>
                <div className="relative">
                  <select
                    value={selectedSubCategoryId}
                    onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                    disabled={!selectedCategoryId || loadingSubCategories}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedCategoryId ? "🔒 Pilih kategori dulu" : "📄 Semua Sub-Kategori"}
                    </option>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                  {loadingSubCategories && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-3 mt-4 lg:mt-0">
              {/* Active Filter Indicator */}
              {(selectedCategoryId || selectedSubCategoryId) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Filter aktif
                </div>
              )}
              
              {/* Clear Filters Button */}
              {(selectedCategoryId || selectedSubCategoryId) && (
                <button
                  onClick={() => {
                    setSelectedCategoryId("");
                    setSelectedSubCategoryId("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
                >
                  <span>🔄</span>
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Filter Summary */}
          {(selectedCategoryId || selectedSubCategoryId) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedCategoryId && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    📂 {categories.find(c => c.id === selectedCategoryId)?.name}
                  </span>
                )}
                {selectedSubCategoryId && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    📋 {subCategories.find(sc => sc.id === selectedSubCategoryId)?.name}
                  </span>
                )}
              </div>
            </div>
          )}
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
