type CampaignApiRaiser = {
  id: string;
  name: string;
  profile_img?: string;
  is_verified?: number;
};

export type CampaignApiItem = {
  id: string;
  name: string;
  total_fund: number;
  current_fund: number;
  start_fund?: string;
  end_fund?: string;
  hero_img?: string;
  description?: string;
  count_day_string?: number;
  raiser?: CampaignApiRaiser;
  funder_count?: number;
};

export type CampaignListResponse = {
  meta: {
    code: number;
    status: string;
    message: string;
    description: string;
  };
  data: CampaignApiItem[];
};

type DonationItem = Record<string, unknown>;

export type UsageItem = {
  id: string;
  usage_category_id: string;
  usage_category_name: string;
  amount: string;
  created_at: string;
  icon_url?: string;
};

export type CampaignDetailResponse = {
  meta: {
    code: number;
    status: string;
    message: string;
    description: string;
  };
  data: CampaignApiItem & {
    donations?: DonationItem[];
    bank?: {
      id: string;
      name: string;
      bank_name: string;
      account_number: string;
      logo?: string;
    };
    usages?: UsageItem[];
  };
};

// Banks API
export type BankItem = {
  id: string;
  name: string;
  logo?: string; // may be a relative path
  bank_name: string;
  account_number: string;
  icon_url?: string; // fully qualified URL from API, may contain backticks
};

export type BankListResponse = {
  meta: {
    code: number;
    status: string;
    message: string;
    description: string;
  };
  data: BankItem[];
};

// Donations API
export type CreateDonationPayload = {
  campaign_id: string;
  amount: number;
  name: string;
  email: string;
  phone_number: string;
  doa?: string;
  bank_id: string;
};

export type CreateDonationResponse = {
  meta: {
    code: number;
    status: string;
    message: string;
    description: string;
  };
  data: {
    donation_id: string;
  };
};

// Donation Detail API
export type DonationDetailResponse = {
  meta: {
    code: number;
    status: string;
    message: string;
    description: string;
  };
  data: {
    id: string;
    transaction_number: string;
    name: string;
    payment_method: string;
    bank_name: string;
    bank_account: string;
    bank_account_name: string;
    amount: number;
    status: string;
    created_at: string;
  };
};

export type CategoryItem = {
  id: string;
  name: string;
};

export type CategoryListResponse = {
  meta: {
    code: number;
    status: string;
    message: string;
    description: string;
  };
  data: CategoryItem[];
};

export type SubCategoryItem = {
  id: string;
  name: string;
};

export type SubCategoryListResponse = {
  meta: {
    code: number;
    status: string;
    message: string;
    description: string;
  };
  data: SubCategoryItem[];
};

const stripTicksAndQuotes = (value?: string) => {
  if (!value) return value;
  // remove backticks and stray quotes/spaces
  return value.replace(/[`"']/g, "").trim();
};

export const fetchCampaigns = async (
  page = 1, 
  limit = 10, 
  categoryId?: string, 
  subCategoryId?: string
): Promise<CampaignApiItem[]> => {
  const host = import.meta.env.VITE_API_HOST as string | undefined;
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

  if (!host) {
    throw new Error("VITE_API_HOST is not set in .env");
  }
  if (!apiKey) {
    throw new Error("VITE_API_KEY is not set in .env");
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (categoryId) {
    params.append('category_id', categoryId);
  }
  if (subCategoryId) {
    params.append('sub_category_id', subCategoryId);
  }

  const url = `${host}/api/campaigns?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "api-key": apiKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch campaigns: ${res.status} ${text}`);
  }

  const json = (await res.json()) as CampaignListResponse;
  const items = json?.data ?? [];

  // sanitize URLs that may include backticks in API payload
  return items.map((it) => ({
    ...it,
    hero_img: stripTicksAndQuotes(it.hero_img),
    description: stripTicksAndQuotes(it.description),
    raiser: it.raiser
      ? {
          ...it.raiser,
          profile_img: stripTicksAndQuotes(it.raiser.profile_img),
        }
      : undefined,
  }));
};

export const fetchCampaignById = async (id: string): Promise<CampaignDetailResponse["data"]> => {
  const host = import.meta.env.VITE_API_HOST as string | undefined;
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

  if (!host) throw new Error("VITE_API_HOST is not set in .env");
  if (!apiKey) throw new Error("VITE_API_KEY is not set in .env");

  const url = `${host}/api/campaigns/${id}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "api-key": apiKey,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch campaign ${id}: ${res.status} ${text}`);
  }
  const json = (await res.json()) as CampaignDetailResponse;
  const d = json.data;
  return {
    ...d,
    hero_img: stripTicksAndQuotes(d.hero_img),
    description: stripTicksAndQuotes(d.description),
    raiser: d.raiser
      ? { ...d.raiser, profile_img: stripTicksAndQuotes(d.raiser.profile_img) }
      : undefined,
    bank: d.bank
      ? { ...d.bank, logo: stripTicksAndQuotes(d.bank.logo) }
      : undefined,
  };
};

export const fetchBanks = async (): Promise<BankItem[]> => {
  const host = import.meta.env.VITE_API_HOST as string | undefined;
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

  if (!host) throw new Error("VITE_API_HOST is not set in .env");
  if (!apiKey) throw new Error("VITE_API_KEY is not set in .env");

  const url = `${host}/api/banks`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "api-key": apiKey,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch banks: ${res.status} ${text}`);
  }
  const json = (await res.json()) as BankListResponse;
  const items = json?.data ?? [];
  return items.map((b) => ({
    ...b,
    logo: stripTicksAndQuotes(b.logo),
    icon_url: stripTicksAndQuotes(b.icon_url),
  }));
};

export const createDonation = async (
  payload: CreateDonationPayload
): Promise<CreateDonationResponse["data"]> => {
  const host = import.meta.env.VITE_API_HOST as string | undefined;
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

  if (!host) throw new Error("VITE_API_HOST is not set in .env");
  if (!apiKey) throw new Error("VITE_API_KEY is not set in .env");

  const url = `${host}/api/donations`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create donation: ${res.status} ${text}`);
  }
  const json = (await res.json()) as CreateDonationResponse;
  return json.data;
};

export const confirmDonationReceipt = async (
  donationId: string,
  file: File
): Promise<void> => {
  const host = import.meta.env.VITE_API_HOST as string | undefined;
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

  if (!host) throw new Error("VITE_API_HOST is not set in .env");
  if (!apiKey) throw new Error("VITE_API_KEY is not set in .env");

  const url = `${host}/api/donations/${donationId}`;
  const form = new FormData();
  form.append("receipt_file", file);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      // Do NOT set Content-Type manually when using FormData
    },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to confirm donation: ${res.status} ${text}`);
  }
};

export const fetchDonationDetail = async (
  donationId: string
): Promise<DonationDetailResponse["data"]> => {
  const host = import.meta.env.VITE_API_HOST as string | undefined;
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

  if (!host) throw new Error("VITE_API_HOST is not set in .env");
  if (!apiKey) throw new Error("VITE_API_KEY is not set in .env");

  const url = `${host}/api/donations/${donationId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "api-key": apiKey,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch donation detail: ${res.status} ${text}`);
  }
  const json = (await res.json()) as DonationDetailResponse;
  return json.data;
};

export const fetchCategories = async (): Promise<CategoryItem[]> => {
  const host = import.meta.env.VITE_API_HOST as string | undefined;
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

  if (!host) throw new Error("VITE_API_HOST is not set in .env");
  if (!apiKey) throw new Error("VITE_API_KEY is not set in .env");

  const url = `${host}/api/categories`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "api-key": apiKey,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch categories: ${res.status} ${text}`);
  }
  const json = (await res.json()) as CategoryListResponse;
  return json.data ?? [];
};

export const fetchSubCategories = async (categoryId: string): Promise<SubCategoryItem[]> => {
  const host = import.meta.env.VITE_API_HOST as string | undefined;
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

  if (!host) throw new Error("VITE_API_HOST is not set in .env");
  if (!apiKey) throw new Error("VITE_API_KEY is not set in .env");

  const url = `${host}/api/new-sub-categories?category_id=${categoryId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "api-key": apiKey,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch sub-categories: ${res.status} ${text}`);
  }
  const json = (await res.json()) as SubCategoryListResponse;
  return json.data ?? [];
};