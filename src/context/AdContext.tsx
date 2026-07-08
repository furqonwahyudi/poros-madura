import React, { createContext, useState, useEffect, useContext } from "react";
import { Ad, AdSlot, AdSettings, Advertiser, Campaign, AdCategory, AdPricing, AdMediaFile } from "../types";

interface AdContextProps {
  ads: Ad[];
  adSlots: AdSlot[];
  adSettings: AdSettings;
  advertisers: Advertiser[];
  campaigns: Campaign[];
  adCategories: AdCategory[];
  adPricing: AdPricing[];
  adMediaLibrary: AdMediaFile[];
  loading: boolean;
  loadAdSystemData: () => Promise<void>;
  trackImpression: (adId: string) => void;
  trackClick: (adId: string) => void;
  getAdForSlot: (
    slotSlug: string,
    currentPage: string,
    category?: string | null
  ) => Ad | null;
}

const AdContext = createContext<AdContextProps | undefined>(undefined);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [adSettings, setAdSettings] = useState<AdSettings>({});
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adCategories, setAdCategories] = useState<AdCategory[]>([]);
  const [adPricing, setAdPricing] = useState<AdPricing[]>([]);
  const [adMediaLibrary, setAdMediaLibrary] = useState<AdMediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdSystemData = async () => {
    try {
      const [
        resAds, resSlots, resSettings, resAdvertisers, resCampaigns, resCategories, resPricing, resMedia
      ] = await Promise.all([
        fetch("/api/ads"),
        fetch("/api/ad-slots"),
        fetch("/api/ad-settings"),
        fetch("/api/advertisers"),
        fetch("/api/campaigns"),
        fetch("/api/ad-categories"),
        fetch("/api/ad-pricing"),
        fetch("/api/ad-media")
      ]);

      if (resAds.ok) setAds(await resAds.json());
      if (resSlots.ok) setAdSlots(await resSlots.json());
      if (resSettings.ok) setAdSettings(await resSettings.json());
      if (resAdvertisers.ok) setAdvertisers(await resAdvertisers.json());
      if (resCampaigns.ok) setCampaigns(await resCampaigns.json());
      if (resCategories.ok) setAdCategories(await resCategories.json());
      if (resPricing.ok) setAdPricing(await resPricing.json());
      if (resMedia.ok) setAdMediaLibrary(await resMedia.json());
    } catch (err) {
      console.error("Failed to load enterprise ad system data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdSystemData();
  }, []);

  const trackImpression = (adId: string) => {
    fetch("/api/ads/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId, action: "impression" })
    }).catch(err => console.error("Failed to track ad impression:", err));
  };

  const trackClick = (adId: string) => {
    fetch("/api/ads/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId, action: "click" })
    }).catch(err => console.error("Failed to track ad click:", err));
  };

  const getAdForSlot = (
    slotSlug: string,
    currentPage: string,
    category?: string | null
  ): Ad | null => {
    // 0. Verify slot exists, is active, and configured for this page
    const slot = adSlots.find(s => s.slug === slotSlug);
    if (!slot || slot.status === "inactive") return null;
    if (slot.page) {
      const allowedSlotPages = slot.page.split(",").map(p => p.trim().toLowerCase());
      const currentPageNorm = currentPage.trim().toLowerCase();
      const slotPageAllowed =
        allowedSlotPages.includes("all") ||
        allowedSlotPages.includes(currentPageNorm);
      if (!slotPageAllowed) return null;
    }

    const activeAds = ads.filter(ad => {
      // 1. Match slot slug
      if (ad.slotSlug !== slotSlug) return false;

      // 2. Must be active status
      if (ad.status !== "active") return false;

      // 3. Page Penargetan check (ad-level — may differ from slot-level)
      const targetPages = ad.targetPages || [];
      // If targetPages is empty or contains "all", allow any page
      if (targetPages.length > 0 && !targetPages.includes("all")) {
        const currentPageNorm = currentPage.trim().toLowerCase();
        const adPageAllowed = targetPages.some(p => p.trim().toLowerCase() === currentPageNorm);
        if (!adPageAllowed) return false;
      }

      // 4. Device detection check
      const width = window.innerWidth;
      const device = ad.targetDevice || "all";
      if (device !== "all") {
        if (device === "mobile" && width >= 768) return false;
        if (device === "tablet" && (width < 768 || width >= 1024)) return false;
        if (device === "laptop" && (width < 1024 || width >= 1280)) return false;
        if (device === "desktop" && width < 1024) return false;
      }

      // 5. Date Scheduling check
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      if (ad.startDate && todayStr < ad.startDate) return false;
      if (ad.endDate && todayStr > ad.endDate) return false;

      // 6. Time & Hour Scheduling check (schedule contains array of hours)
      const currentHour = now.getHours();
      const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      if (ad.schedule) {
        if (ad.schedule.hours && ad.schedule.hours.length > 0 && !ad.schedule.hours.includes(currentHour)) {
          return false;
        }
        if (ad.schedule.days && ad.schedule.days.length > 0 && !ad.schedule.days.map(d => d.toLowerCase()).includes(currentDay)) {
          return false;
        }
      }

      return true;
    });

    if (activeAds.length === 0) return null;

    // Sort by priority (1 is highest, then 2, 3, 4)
    activeAds.sort((a, b) => (a.priority || 4) - (b.priority || 4));

    return activeAds[0];
  };


  return (
    <AdContext.Provider
      value={{
        ads,
        adSlots,
        adSettings,
        advertisers,
        campaigns,
        adCategories,
        adPricing,
        adMediaLibrary,
        loading,
        loadAdSystemData,
        trackImpression,
        trackClick,
        getAdForSlot
      }}
    >
      {children}
    </AdContext.Provider>
  );
};

export const useAdSystem = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error("useAdSystem must be used within an AdProvider");
  }
  return context;
};
