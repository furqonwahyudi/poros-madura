import React, { useState, useEffect } from "react";
import { useAdSystem } from "../context/AdContext";
import { Ad, AdSlot, Advertiser, Campaign, AdCategory, AdPricing, AdMediaFile } from "../types";
import { 
  Megaphone, Plus, Edit, Trash2, Download, Search, Image as ImageIcon, 
  Calendar, Settings, DollarSign, Clock, Grid, FileText, Filter, 
  Check, X, RefreshCw, BarChart2, Briefcase, User, Tag, HelpCircle
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, LineChart, Line 
} from "recharts";
import { useDialog } from "../context/DialogContext";

interface AdminAdsManagerProps {
  lang: "ID" | "EN";
}

type SubTab = "dashboard" | "all-ads" | "ad-slots" | "campaign" | "advertiser" | 
             "categories" | "analytics" | "reports" | "pricing" | "media-library" | 
             "schedule" | "settings";

export default function AdminAdsManager({ lang }: AdminAdsManagerProps) {
  const { showAlert, showConfirm } = useDialog();
  const { 
    ads, adSlots, adSettings, advertisers, campaigns, adCategories, adPricing, adMediaLibrary,
    loadAdSystemData, trackImpression, trackClick
  } = useAdSystem();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>("dashboard");
  const [summary, setSummary] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Form Modals states
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<Partial<Ad> | null>(null);

  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<Partial<AdSlot> | null>(null);

  const [isAdvModalOpen, setIsAdvModalOpen] = useState(false);
  const [currentAdv, setCurrentAdv] = useState<Partial<Advertiser> | null>(null);

  const [isCampModalOpen, setIsCampModalOpen] = useState(false);
  const [currentCamp, setCurrentCamp] = useState<Partial<Campaign> | null>(null);

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [currentPricing, setCurrentPricing] = useState<Partial<AdPricing> | null>(null);

  const [mediaUploadUrl, setMediaUploadUrl] = useState("");
  const [mediaUploadName, setMediaUploadName] = useState("");
  const [mediaUploadTags, setMediaUploadTags] = useState("");

  // Settings State
  const [adsensePub, setAdsensePub] = useState(adSettings.adsensePublisherId || "");
  const [gamId, setGamId] = useState(adSettings.googleAdManagerId || "");
  const [feedGap, setFeedGap] = useState(adSettings.inFeedGap || 4);
  const [articleParagraphs, setArticleParagraphs] = useState((adSettings.inArticleParagraphs || [3, 6, 10, 15]).join(", "));

  // Fetch summary data
  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/ad-system/summary");
      if (res.ok) {
        setSummary(await res.json());
      }
    } catch (err) {
      console.error("Error fetching ad system summary:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [ads, adSlots]);

  // Sync settings when context loaded
  useEffect(() => {
    if (adSettings) {
      setAdsensePub(adSettings.adsensePublisherId || "");
      setGamId(adSettings.googleAdManagerId || "");
      setFeedGap(adSettings.inFeedGap || 4);
      setArticleParagraphs((adSettings.inArticleParagraphs || [3, 6, 10, 15]).join(", "));
    }
  }, [adSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = {
        adsensePublisherId: adsensePub,
        googleAdManagerId: gamId,
        inFeedGap: Number(feedGap),
        inArticleParagraphs: articleParagraphs.split(",").map(p => Number(p.trim())).filter(p => !isNaN(p))
      };
      const res = await fetch("/api/ad-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        showAlert("Konfigurasi iklan berhasil disimpan!", "Sukses", "success");
        loadAdSystemData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Actions
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAd) return;
    try {
      const isNew = !currentAd.id;
      const url = isNew ? "/api/ads" : `/api/ads/${currentAd.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentAd,
          priority: Number(currentAd.priority || 1),
          targetBlank: !!currentAd.targetBlank
        })
      });
      if (res.ok) {
        showAlert(isNew ? "Iklan baru berhasil dibuat!" : "Materi iklan berhasil diperbarui!", "Sukses", "success");
        setIsAdModalOpen(false);
        setCurrentAd(null);
        loadAdSystemData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAd = async (id: string) => {
    showConfirm("Apakah Anda yakin ingin menghapus iklan ini secara permanen?", async () => {
      try {
        const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });
        if (res.ok) {
          showAlert("Iklan berhasil dihapus!", "Sukses", "success");
          loadAdSystemData();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSlot) return;
    try {
      const isNew = !currentSlot.id;
      const url = isNew ? "/api/ad-slots" : `/api/ad-slots/${currentSlot.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentSlot,
          priority: Number(currentSlot.priority || 1),
          lazyLoad: !!currentSlot.lazyLoad,
          sticky: !!currentSlot.sticky,
          floating: !!currentSlot.floating,
          closeButton: !!currentSlot.closeButton,
          responsive: !!currentSlot.responsive
        })
      });
      if (res.ok) {
        showAlert(isNew ? "Slot iklan baru berhasil didaftarkan!" : "Konfigurasi slot berhasil disimpan!", "Sukses", "success");
        setIsSlotModalOpen(false);
        setCurrentSlot(null);
        loadAdSystemData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    showConfirm("Apakah Anda yakin ingin menghapus slot iklan ini secara permanen?", async () => {
      try {
        const res = await fetch(`/api/ad-slots/${id}`, { method: "DELETE" });
        if (res.ok) {
          showAlert("Slot iklan berhasil dihapus!", "Sukses", "success");
          loadAdSystemData();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleSaveAdvertiser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdv) return;
    try {
      const isNew = !currentAdv.id;
      const url = isNew ? "/api/advertisers" : `/api/advertisers/${currentAdv.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentAdv)
      });
      if (res.ok) {
        showAlert(isNew ? "Pengiklan baru terdaftar!" : "Profil pengiklan diperbarui!", "Sukses", "success");
        setIsAdvModalOpen(false);
        setCurrentAdv(null);
        loadAdSystemData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAdv = async (id: string) => {
    showConfirm("Hapus pengiklan ini? Kampanye terikat mungkin terpengaruh.", async () => {
      try {
        const res = await fetch(`/api/advertisers/${id}`, { method: "DELETE" });
        if (res.ok) {
          showAlert("Pengiklan berhasil dihapus!", "Sukses", "success");
          loadAdSystemData();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCamp) return;
    try {
      const isNew = !currentCamp.id;
      const url = isNew ? "/api/campaigns" : `/api/campaigns/${currentCamp.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentCamp,
          budget: Number(currentCamp.budget || 0)
        })
      });
      if (res.ok) {
        showAlert(isNew ? "Kampanye iklan baru berhasil dibuat!" : "Detail kampanye diperbarui!", "Sukses", "success");
        setIsCampModalOpen(false);
        setCurrentCamp(null);
        loadAdSystemData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCamp = async (id: string) => {
    showConfirm("Hapus kampanye ini secara permanen?", async () => {
      try {
        const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
        if (res.ok) {
          showAlert("Kampanye berhasil dihapus!", "Sukses", "success");
          loadAdSystemData();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  // Media Library upload mock
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUploadUrl || !mediaUploadName) return;
    try {
      const newMedia = {
        name: mediaUploadName,
        url: mediaUploadUrl,
        tags: mediaUploadTags.split(",").map(t => t.trim()).filter(t => t !== "")
      };
      const res = await fetch("/api/ad-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMedia)
      });
      if (res.ok) {
        showAlert("Aset media berhasil diunggah!", "Sukses", "success");
        setMediaUploadName("");
        setMediaUploadUrl("");
        setMediaUploadTags("");
        loadAdSystemData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    showConfirm("Hapus file media ini dari pustaka?", async () => {
      try {
        const res = await fetch(`/api/ad-media/${id}`, { method: "DELETE" });
        if (res.ok) {
          showAlert("Media dihapus!", "Sukses", "success");
          loadAdSystemData();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  // Pricing CRUD
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPricing) return;
    try {
      const isNew = !currentPricing.id;
      const url = isNew ? "/api/ad-pricing" : `/api/ad-pricing/${currentPricing.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentPricing,
          pricePerDay: Number(currentPricing.pricePerDay || 0),
          pricePerImpression: Number(currentPricing.pricePerImpression || 0),
          pricePerClick: Number(currentPricing.pricePerClick || 0)
        })
      });
      if (res.ok) {
        showAlert("Tarif sewa slot berhasil disimpan!", "Sukses", "success");
        setIsPricingModalOpen(false);
        setCurrentPricing(null);
        loadAdSystemData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePricing = async (id: string) => {
    showConfirm("Hapus tarif sewa ini?", async () => {
      try {
        const res = await fetch(`/api/ad-pricing/${id}`, { method: "DELETE" });
        if (res.ok) {
          showAlert("Tarif sewa dihapus!", "Sukses", "success");
          loadAdSystemData();
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!summary) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metrik,Nilai\n";
    csvContent += `Total Ads,${summary.totalAds}\n`;
    csvContent += `Active Ads,${summary.adsActive}\n`;
    csvContent += `Expired Ads,${summary.adsExpired}\n`;
    csvContent += `Pending Ads,${summary.pending}\n`;
    csvContent += `Total Impresi,${summary.totalImpression}\n`;
    csvContent += `Total Klik,${summary.totalClick}\n`;
    csvContent += `CTR (%),${summary.ctr}\n`;
    csvContent += `Revenue (Rp),${summary.revenue}\n`;
    csvContent += `Viewability (%),${summary.viewability}\n`;
    csvContent += `Top Advertiser,${summary.topAdvertiser}\n`;
    csvContent += `Top Ad Slot,${summary.topSlot}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `poros-madura-ad-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const handleExportPDF = () => {
    window.print();
  };

  // Render Sub Tabs
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: <Grid size={14} /> },
    { id: "all-ads", name: "All Ads", icon: <Megaphone size={14} /> },
    { id: "ad-slots", name: "Ad Slots (35)", icon: <Clock size={14} /> },
    { id: "campaign", name: "Campaign", icon: <Briefcase size={14} /> },
    { id: "advertiser", name: "Advertiser", icon: <User size={14} /> },
    { id: "categories", name: "Categories", icon: <Tag size={14} /> },
    { id: "analytics", name: "Analytics", icon: <BarChart2 size={14} /> },
    { id: "reports", name: "Reports & Export", icon: <FileText size={14} /> },
    { id: "pricing", name: "Pricing Setup", icon: <DollarSign size={14} /> },
    { id: "media-library", name: "Media Library", icon: <ImageIcon size={14} /> },
    { id: "schedule", name: "Schedule", icon: <Calendar size={14} /> },
    { id: "settings", name: "Global Settings", icon: <Settings size={14} /> }
  ];

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.name.toLowerCase().includes(searchQuery.toLowerCase()) || ad.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* CMS AD Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100 tracking-tight">
            <Megaphone className="text-[#D71920]" />
            <span>ADVERTISEMENT CONTROL CENTER</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Kelola kampanye, penempatan banner, target pemirsa, dan pantau metrik CTR & Revenue Poros Madura.</p>
        </div>
        <button 
          onClick={loadAdSystemData}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow"
        >
          <RefreshCw size={12} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Sub tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2 select-none">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id as SubTab)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === item.id 
                ? "bg-[#D71920] text-slate-950 font-black shadow-md shadow-[#D71920]/15" 
                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* 1. DASHBOARD */}
      {activeSubTab === "dashboard" && summary && (
        <div className="flex flex-col gap-6">
          {/* Metrik Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Iklan</span>
              <span className="text-2xl font-black text-white">{summary.totalAds}</span>
              <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                <span className="text-green-500 font-bold">● {summary.adsActive} Aktif</span>
                <span>• {summary.pending} Pending</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Impresi (Views)</span>
              <span className="text-2xl font-black text-[#D71920]">{summary.totalImpression.toLocaleString()}</span>
              <span className="text-[9px] block text-slate-500 font-mono mt-1">Diukur secara asinkron</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rata-rata CTR</span>
              <span className="text-2xl font-black text-blue-400">{summary.ctr}%</span>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-mono text-slate-400">
                <span className="bg-blue-950 text-blue-400 px-1.5 py-0.5 rounded font-bold">{summary.totalClick} Klik</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs bg-linear-to-br from-slate-900 to-green-950/20">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estimasi Pendapatan (IDR)</span>
              <span className="text-2xl font-black text-green-400">Rp {summary.revenue.toLocaleString()}</span>
              <span className="text-[9px] block text-green-500/80 font-bold font-mono mt-1">Target tercapai 92%</span>
            </div>
          </div>

          {/* Quick info row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Top Advertiser</span>
                <span className="text-xs font-bold text-white uppercase">{summary.topAdvertiser}</span>
              </div>
              <span className="text-2xl font-black text-green-400">👑</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Top Ad Slot Position</span>
                <span className="text-xs font-bold text-white uppercase">{summary.topSlot}</span>
              </div>
              <span className="text-2xl font-black text-[#D71920]">📈</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Rata-rata Viewability</span>
                <span className="text-xs font-bold text-white">{summary.viewability}%</span>
              </div>
              <span className="text-2xl font-black text-blue-400">👁️</span>
            </div>
          </div>

          {/* Recharts Chart Section */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
              <BarChart2 size={13} className="text-[#D71920]" />
              <span>Grafik Kinerja Mingguan (Impresi & Klik)</span>
            </h4>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.chartDaily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D71920" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#D71920" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCli" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc" }} />
                  <Legend />
                  <Area type="monotone" dataKey="impressions" name="Impresi (Views)" stroke="#D71920" fillOpacity={1} fill="url(#colorImp)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="clicks" name="Klik (Clicks)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCli)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. ALL ADS */}
      {activeSubTab === "all-ads" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Search size={14} /></span>
              <input 
                type="text" 
                placeholder="Cari nama atau judul iklan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>
            <button
              onClick={() => {
                setCurrentAd({
                  priority: 1,
                  status: "active",
                  targetDevice: "all",
                  targetPages: ["all"],
                  format: "image",
                  targetBlank: true
                });
                setIsAdModalOpen(true);
              }}
              className="bg-[#D71920] hover:bg-[#D71920]/90 text-slate-950 font-black px-4.5 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
            >
              <Plus size={14} />
              <span>Buat Iklan Baru</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-bold uppercase select-none border-b border-slate-800">
                <tr>
                  <th className="p-4">Nama Iklan</th>
                  <th className="p-4">Slot</th>
                  <th className="p-4">Format</th>
                  <th className="p-4">Prioritas</th>
                  <th className="p-4 text-center">Impresi</th>
                  <th className="p-4 text-center">Klik</th>
                  <th className="p-4 text-center">CTR</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAds.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 italic">Tidak ada materi iklan terdaftar.</td>
                  </tr>
                ) : (
                  filteredAds.map(ad => {
                    const ctrVal = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00";
                    return (
                      <tr key={ad.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-bold text-white">
                          <div>{ad.name}</div>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{ad.title || "No Title"}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{ad.slotSlug}</td>
                        <td className="p-4">
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono">{ad.format}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-300 font-mono">Prio {ad.priority}</span>
                        </td>
                        <td className="p-4 text-center font-mono text-slate-400">{ad.impressions.toLocaleString()}</td>
                        <td className="p-4 text-center font-mono text-slate-400">{ad.clicks.toLocaleString()}</td>
                        <td className="p-4 text-center font-mono text-blue-400 font-bold">{ctrVal}%</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ad.status === "active" ? "bg-green-950 text-green-400" :
                            ad.status === "expired" ? "bg-red-950 text-red-400" : "bg-slate-800 text-slate-400"
                          }`}>
                            {ad.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => {
                                setCurrentAd(ad);
                                setIsAdModalOpen(true);
                              }}
                              className="p-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. AD SLOTS */}
      {activeSubTab === "ad-slots" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <span className="text-xs text-slate-400">Total slot bawaan: <strong className="text-white">35 Slot Aktif</strong></span>
            <button
              onClick={() => {
                setCurrentSlot({
                  status: "active",
                  lazyLoad: true,
                  responsive: true
                });
                setIsSlotModalOpen(true);
              }}
              className="bg-[#D71920] hover:bg-[#D71920]/90 text-slate-950 font-black px-4.5 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
            >
              <Plus size={14} />
              <span>Daftarkan Slot Kustom</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-bold uppercase select-none border-b border-slate-800">
                <tr>
                  <th className="p-4">Nama Posisi Slot</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Ukuran Bawaan</th>
                  <th className="p-4">Tipe Slot</th>
                  <th className="p-4">Halaman</th>
                  <th className="p-4">Premium</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {adSlots.map(slot => (
                  <tr key={slot.id} className={`hover:bg-slate-800/40 transition-colors ${slot.isPremium ? "bg-amber-950/10 border-l-2 border-amber-500" : ""}`}>
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      {slot.name}
                      {slot.isPremium && (
                        <span className="bg-gradient-to-r from-amber-500 to-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">PREMIUM</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-slate-400">{slot.slug}</td>
                    <td className="p-4 font-mono text-green-400 font-bold">{slot.size}</td>
                    <td className="p-4 uppercase font-mono text-slate-400">{slot.type}</td>
                    <td className="p-4 capitalize text-slate-400">{slot.page}</td>
                    <td className="p-4">
                      {slot.isPremium ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-amber-400 font-bold text-[9px]">✓ Always Visible</span>
                          <span className="text-amber-400 font-bold text-[9px]">✓ No Close</span>
                          <span className="text-amber-400 font-bold text-[9px]">✓ Layout Grid</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[9px]">Standard</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        slot.status === "active" ? "bg-green-950 text-green-400" : "bg-slate-800 text-slate-400"
                      }`}>
                        {slot.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            setCurrentSlot(slot);
                            setIsSlotModalOpen(true);
                          }}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CAMPAIGN */}
      {activeSubTab === "campaign" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <span className="text-xs text-slate-400">Total kampanye aktif pengiklan</span>
            <button
              onClick={() => {
                setCurrentCamp({
                  status: "active",
                  budget: 5000000
                });
                setIsCampModalOpen(true);
              }}
              className="bg-[#D71920] hover:bg-[#D71920]/90 text-slate-950 font-black px-4.5 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
            >
              <Plus size={14} />
              <span>Buat Kampanye</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-bold uppercase select-none border-b border-slate-800">
                <tr>
                  <th className="p-4">Nama Kampanye</th>
                  <th className="p-4">ID Pengiklan</th>
                  <th className="p-4">Anggaran Total</th>
                  <th className="p-4">Mulai</th>
                  <th className="p-4">Selesai</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 italic">Belum ada kampanye iklan aktif.</td>
                  </tr>
                ) : (
                  campaigns.map(camp => (
                    <tr key={camp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">{camp.name}</td>
                      <td className="p-4 font-mono text-slate-400">{camp.advertiserId}</td>
                      <td className="p-4 font-mono text-green-400 font-bold">Rp {camp.budget.toLocaleString()}</td>
                      <td className="p-4 font-mono text-slate-400">{camp.startDate}</td>
                      <td className="p-4 font-mono text-slate-400">{camp.endDate}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          camp.status === "active" ? "bg-green-950 text-green-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {camp.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => {
                              setCurrentCamp(camp);
                              setIsCampModalOpen(true);
                            }}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCamp(camp.id)}
                            className="p-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ADVERTISER */}
      {activeSubTab === "advertiser" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <span className="text-xs text-slate-400">Database kontak advertiser langsung</span>
            <button
              onClick={() => {
                setCurrentAdv({ status: "active" });
                setIsAdvModalOpen(true);
              }}
              className="bg-[#D71920] hover:bg-[#D71920]/90 text-slate-950 font-black px-4.5 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
            >
              <Plus size={14} />
              <span>Daftarkan Pengiklan</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-bold uppercase select-none border-b border-slate-800">
                <tr>
                  <th className="p-4">Nama Pengiklan</th>
                  <th className="p-4">Perusahaan / Agensi</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Telepon</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {advertisers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 italic">Belum ada advertiser terdaftar.</td>
                  </tr>
                ) : (
                  advertisers.map(adv => (
                    <tr key={adv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">{adv.name}</td>
                      <td className="p-4 font-bold text-slate-400">{adv.company}</td>
                      <td className="p-4 font-mono text-slate-400">{adv.email}</td>
                      <td className="p-4 font-mono text-slate-400">{adv.phone}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          adv.status === "active" ? "bg-green-950 text-green-400" : "bg-slate-800 text-slate-400"
                        }`}>
                          {adv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => {
                              setCurrentAdv(adv);
                              setIsAdvModalOpen(true);
                            }}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteAdv(adv.id)}
                            className="p-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CATEGORIES */}
      {activeSubTab === "categories" && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Pengkategorian Konten Iklan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {adCategories.map(cat => (
              <div key={cat.id} className="bg-slate-950 p-4 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{cat.name}</div>
                  <span className="text-[10px] text-slate-500 font-mono">{cat.slug}</span>
                </div>
                <span className="text-[#D71920] font-black">✔</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. ANALYTICS */}
      {activeSubTab === "analytics" && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Estimasi Pendapatan Harian Iklan</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.chartDaily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc" }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue (Rp)" stroke="#22c55e" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Metrik Pendapatan Bulanan (Year-to-date)</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.chartMonthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f8fafc" }} />
                  <Bar dataKey="revenue" name="Estimasi Revenue (IDR)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 8. REPORTS */}
      {activeSubTab === "reports" && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Export Laporan & Audit Performa Iklan</h3>
            <p className="text-xs text-slate-400">Ekspor berkas CSV, Excel, atau cetak dokumen PDF untuk laporan penayangan iklan.</p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <button 
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download size={14} />
              <span>Ekspor Laporan CSV</span>
            </button>
            <button 
              onClick={handleExportCSV}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download size={14} />
              <span>Ekspor Excel Spreadsheet</span>
            </button>
            <button 
              onClick={handleExportPDF}
              className="bg-slate-700 hover:bg-slate-650 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow"
            >
              <FileText size={14} />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* 9. PRICING SETUP */}
      {activeSubTab === "pricing" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <span className="text-xs text-slate-400">Tarif sewa slot per hari / per click</span>
            <button
              onClick={() => {
                setCurrentPricing({
                  pricePerDay: 500000,
                  pricePerImpression: 10,
                  pricePerClick: 500
                });
                setIsPricingModalOpen(true);
              }}
              className="bg-[#D71920] hover:bg-[#D71920]/90 text-slate-950 font-black px-4.5 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
            >
              <Plus size={14} />
              <span>Atur Tarif Baru</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-bold uppercase select-none border-b border-slate-800">
                <tr>
                  <th className="p-4">Slot Slug</th>
                  <th className="p-4">Tarif per Hari (CPD)</th>
                  <th className="p-4">Tarif per Impresi (CPM)</th>
                  <th className="p-4">Tarif per Klik (CPC)</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {adPricing.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white font-mono">{p.slotSlug}</td>
                    <td className="p-4 font-mono text-green-400 font-bold">Rp {p.pricePerDay.toLocaleString()}</td>
                    <td className="p-4 font-mono text-slate-400">Rp {(p.pricePerImpression || 0).toLocaleString()}</td>
                    <td className="p-4 font-mono text-slate-400">Rp {(p.pricePerClick || 0).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            setCurrentPricing(p);
                            setIsPricingModalOpen(true);
                          }}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded transition-colors cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeletePricing(p.id)}
                          className="p-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. MEDIA LIBRARY */}
      {activeSubTab === "media-library" && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleAddMedia} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unggah Gambar Banner Baru ke Media Library</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Aset</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Banner Promo Mandiri 728x90"
                  value={mediaUploadName}
                  onChange={e => setMediaUploadName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">URL Gambar Banner</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={mediaUploadUrl}
                  onChange={e => setMediaUploadUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tag Keywords (dipisahkan koma)</label>
              <input 
                type="text" 
                placeholder="mandiri, promo, leaderboard"
                value={mediaUploadTags}
                onChange={e => setMediaUploadTags(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>
            <button 
              type="submit"
              className="bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 font-black py-2 px-4 rounded-lg text-xs cursor-pointer max-w-xs transition-colors self-start shadow"
            >
              Simpan Aset ke Library
            </button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {adMediaLibrary.map(media => (
              <div key={media.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col group relative">
                <div className="aspect-video bg-slate-950 relative overflow-hidden flex justify-center items-center">
                  <img src={media.url} alt={media.name} className="max-w-full max-h-full object-contain" />
                  <button 
                    onClick={() => handleDeleteMedia(media.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-650 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold text-white truncate block">{media.name}</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {media.tags.map(t => (
                      <span key={t} className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[8px] uppercase font-mono">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. SCHEDULE */}
      {activeSubTab === "schedule" && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Penjadwalan Dinamis Kampanye</h3>
            <p className="text-xs text-slate-400">Kampanye iklan hanya ditayangkan pada hari-hari tertentu yang Anda pilih.</p>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(day => (
              <div key={day} className="bg-slate-950 border border-slate-850 p-4 rounded-lg">
                <div className="font-bold text-white mb-2">{day}</div>
                <span className="bg-green-950 text-green-400 px-2 py-0.5 rounded text-[9px] font-bold">AKTIF</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. GLOBAL SETTINGS */}
      {activeSubTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Integrasi Kode Jaringan Iklan Global</h3>
            <p className="text-xs text-slate-500">Hubungkan portal Poros Madura ke akun Google AdSense & Google Ad Manager Anda secara dinamis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Google AdSense Publisher ID</label>
              <input 
                type="text" 
                placeholder="Contoh: pub-5510668293774811"
                value={adsensePub}
                onChange={e => setAdsensePub(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Google Ad Manager (GAM) ID</label>
              <input 
                type="text" 
                placeholder="Contoh: /1234567/poros_madura_leaderboard"
                value={gamId}
                onChange={e => setGamId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jarak In-Feed Ads (Setiap N Artikel)</label>
              <input 
                type="number" 
                value={feedGap}
                onChange={e => setFeedGap(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Paragraf In-Article Ads (dipisahkan koma)</label>
              <input 
                type="text" 
                value={articleParagraphs}
                onChange={e => setArticleParagraphs(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 font-black py-2.5 px-6 rounded-lg text-xs cursor-pointer max-w-xs transition-colors self-start shadow"
          >
            Simpan Pengaturan Iklan
          </button>
        </form>
      )}


      {/* FORM MODAL: CREATE / EDIT AD */}
      {isAdModalOpen && currentAd && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <form onSubmit={handleSaveAd} className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">{currentAd.id ? "Edit Materi Iklan" : "Buat Iklan Baru"}</h3>
              <button type="button" onClick={() => setIsAdModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Iklan</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Samsung S26 Ultra Banner"
                  value={currentAd.name || ""}
                  onChange={e => setCurrentAd({ ...currentAd, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Judul / Caption Promosi</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Diskon Pre-order s.d 20%!"
                  value={currentAd.title || ""}
                  onChange={e => setCurrentAd({ ...currentAd, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Slot Posisi</label>
                <select 
                  value={currentAd.slotSlug || ""}
                  onChange={e => setCurrentAd({ ...currentAd, slotSlug: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                >
                  <option value="">-- Pilih Slot Posisi --</option>
                  {adSlots.map(s => (
                    <option key={s.id} value={s.slug}>{s.name} ({s.size})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Format Iklan</label>
                <select 
                  value={currentAd.format || "image"}
                  onChange={e => setCurrentAd({ ...currentAd, format: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                >
                  <option value="image">Gambar Banner (Image)</option>
                  <option value="html">Kode HTML Kustom</option>
                  <option value="adsense">Google AdSense</option>
                  <option value="gam">Google Ad Manager (GAM)</option>
                  <option value="video">Materi Video</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Advertiser (Pengiklan)</label>
                <select 
                  value={currentAd.advertiserId || ""}
                  onChange={e => setCurrentAd({ ...currentAd, advertiserId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                >
                  <option value="">-- Pilih Pengiklan --</option>
                  {advertisers.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Campaign (Kampanye)</label>
                <select 
                  value={currentAd.campaignId || ""}
                  onChange={e => setCurrentAd({ ...currentAd, campaignId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                >
                  <option value="">-- Pilih Kampanye --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {currentAd.format === "image" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">URL Banner (Desktop)</label>
                    <input 
                      type="url" 
                      placeholder="https://..."
                      value={currentAd.imageDesktop || ""}
                      onChange={e => setCurrentAd({ ...currentAd, imageDesktop: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">URL Banner (Mobile)</label>
                    <input 
                      type="url" 
                      placeholder="https://..."
                      value={currentAd.imageMobile || ""}
                      onChange={e => setCurrentAd({ ...currentAd, imageMobile: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Link Tujuan (Landing Url)</label>
                    <input 
                      type="url" 
                      placeholder="https://..."
                      value={currentAd.landingUrl || ""}
                      onChange={e => setCurrentAd({ ...currentAd, landingUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4 select-none">
                    <input 
                      type="checkbox" 
                      id="targetBlank"
                      checked={!!currentAd.targetBlank}
                      onChange={e => setCurrentAd({ ...currentAd, targetBlank: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="targetBlank" className="text-slate-300 font-bold">Buka di Tab Baru (Target Blank)</label>
                  </div>
                </div>
              </>
            )}

            {(currentAd.format === "html" || currentAd.format === "adsense" || currentAd.format === "gam") && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kode Embed HTML / Script Iklan</label>
                <textarea 
                  rows={3}
                  placeholder="Paste script tag dari Google AdSense / GAM..."
                  value={currentAd.htmlCode || ""}
                  onChange={e => setCurrentAd({ ...currentAd, htmlCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Prioritas Tampil (1 - 4)</label>
                <select 
                  value={currentAd.priority || 1}
                  onChange={e => setCurrentAd({ ...currentAd, priority: Number(e.target.value) as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                >
                  <option value={1}>1 (Sangat Tinggi / Utama)</option>
                  <option value={2}>2 (Tinggi)</option>
                  <option value={3}>3 (Sedang)</option>
                  <option value={4}>4 (Rendah / Fallback)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status Penayangan</label>
                <select 
                  value={currentAd.status || "active"}
                  onChange={e => setCurrentAd({ ...currentAd, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                >
                  <option value="active">Aktif (Live)</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft (Simpan saja)</option>
                  <option value="expired">Kedaluwarsa (Expired)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Perangkat</label>
                <select 
                  value={currentAd.targetDevice || "all"}
                  onChange={e => setCurrentAd({ ...currentAd, targetDevice: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                >
                  <option value="all">Semua Perangkat (All)</option>
                  <option value="desktop">Hanya Komputer (Desktop)</option>
                  <option value="mobile">Hanya Ponsel (Mobile)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tanggal Mulai Tayang</label>
                <input 
                  type="date" 
                  value={currentAd.startDate || ""}
                  onChange={e => setCurrentAd({ ...currentAd, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tanggal Selesai Tayang</label>
                <input 
                  type="date" 
                  value={currentAd.endDate || ""}
                  onChange={e => setCurrentAd({ ...currentAd, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end gap-2.5">
              <button type="button" onClick={() => setIsAdModalOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors">Batal</button>
              <button type="submit" className="bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 font-black py-2 px-6 rounded-lg cursor-pointer transition-colors shadow">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* FORM MODAL: EDIT SLOT */}
      {isSlotModalOpen && currentSlot && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleSaveSlot} className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">{currentSlot.id ? "Edit Detail Slot" : "Daftarkan Slot Baru"}</h3>
              <button type="button" onClick={() => setIsSlotModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Posisi Slot</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Hero Banner Utama"
                value={currentSlot.name || ""}
                onChange={e => setCurrentSlot({ ...currentSlot, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Slug (Kata Kunci Referensi)</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: hero-banner"
                value={currentSlot.slug || ""}
                onChange={e => setCurrentSlot({ ...currentSlot, slug: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ukuran Asli Slot (WxH)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: 728x90"
                  value={currentSlot.size || ""}
                  onChange={e => setCurrentSlot({ ...currentSlot, size: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Halaman Tampil</label>
                <select 
                  value={currentSlot.page || "homepage"}
                  onChange={e => setCurrentSlot({ ...currentSlot, page: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                >
                  <option value="all">Semua Halaman (All)</option>
                  <option value="homepage">Beranda (Homepage)</option>
                  <option value="kategori">Kategori</option>
                  <option value="artikel">Artikel Detail</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 select-none">
                <input 
                  type="checkbox" 
                  id="lazyLoad"
                  checked={!!currentSlot.lazyLoad}
                  onChange={e => setCurrentSlot({ ...currentSlot, lazyLoad: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="lazyLoad" className="text-slate-300 font-bold">Lazy Load</label>
              </div>
              <div className="flex items-center gap-2 select-none">
                <input 
                  type="checkbox" 
                  id="status"
                  checked={currentSlot.status === "active"}
                  onChange={e => setCurrentSlot({ ...currentSlot, status: e.target.checked ? "active" : "inactive" })}
                  className="w-4 h-4"
                />
                <label htmlFor="status" className="text-slate-300 font-bold">Status Aktif</label>
              </div>
            </div>

            {/* ── Premium Floating Settings ──────────────────────────── */}
            {(currentSlot.type === "floating" || currentSlot.isPremium) && (
              <div className="border border-amber-500/30 bg-amber-950/10 rounded-xl p-4 flex flex-col gap-4">
                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  Premium Floating Slot Settings
                </h4>

                {/* General premium toggles */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    { id: "isPremium", label: "✓ Premium Slot", field: "isPremium" },
                    { id: "alwaysVisible", label: "✓ Always Visible", field: "alwaysVisible" },
                    { id: "desktopOnly", label: "✓ Desktop Only", field: "desktopOnly" },
                    { id: "autoHideSmall", label: "✓ Auto Hide On Small Screen", field: "autoHideSmall" },
                    { id: "reserveLayout", label: "✓ Reserved Layout Space", field: "reserveLayout" },
                  ].map(item => (
                    <div key={item.id} className="flex items-center gap-2 select-none">
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={!!(currentSlot as any)[item.field]}
                        onChange={e => setCurrentSlot({ ...currentSlot, [item.field]: e.target.checked })}
                        className="w-4 h-4 accent-amber-500"
                      />
                      <label htmlFor={item.id} className="text-amber-200 text-[10px] font-bold">{item.label}</label>
                    </div>
                  ))}
                </div>

                {/* Locked behavior fields — visual only, always disabled */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col gap-1.5">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Behavior (Dikunci — Tidak Dapat Diubah)</p>
                  {[
                    { label: "Overlay", value: "FALSE — Layout Grid, Bukan Overlay" },
                    { label: "Closable", value: "FALSE — Tidak Ada Tombol Close" },
                    { label: "Collapsible", value: "FALSE — Tidak Dapat Disembunyikan" },
                    { label: "Sticky", value: "TRUE — Mengikuti Scroll" },
                    { label: "Reserve Layout", value: "TRUE — Grid Kolom Diproteksi" },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 font-mono">{item.label}</span>
                      <span className="text-[9px] text-amber-400 font-bold font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Floating dimensions */}
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Floating Behavior (Layout Engine)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Width (px)", field: "floatingConfig.width", placeholder: "160" },
                      { label: "Height (px)", field: "floatingConfig.height", placeholder: "600" },
                      { label: "Top Offset (px)", field: "floatingConfig.topOffset", placeholder: "88" },
                      { label: "Left Gap (px)", field: "floatingConfig.leftGap", placeholder: "20" },
                      { label: "Right Gap (px)", field: "floatingConfig.rightGap", placeholder: "20" },
                      { label: "Scroll Offset (px)", field: "floatingConfig.scrollOffset", placeholder: "0" },
                    ].map(item => (
                      <div key={item.label}>
                        <label className="text-[9px] text-slate-400 block mb-0.5">{item.label}</label>
                        <input
                          type="number"
                          placeholder={item.placeholder}
                          value={(currentSlot as any).floatingConfig?.[item.field.split(".")[1]] ?? ""}
                          onChange={e => {
                            const fieldKey = item.field.split(".")[1];
                            setCurrentSlot({
                              ...currentSlot,
                              floatingConfig: {
                                width: 160, height: 600, topOffset: 88,
                                leftGap: 20, rightGap: 20, scrollOffset: 0,
                                overlay: false, closable: false, collapsible: false,
                                autoHide: false, sticky: true, reserveLayout: true,
                                ...(currentSlot.floatingConfig || {}),
                                [fieldKey]: Number(e.target.value)
                              }
                            });
                          }}
                          className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-800 pt-4 flex justify-end gap-2.5">
              <button type="button" onClick={() => setIsSlotModalOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors">Batal</button>
              <button type="submit" className="bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 font-black py-2 px-6 rounded-lg cursor-pointer transition-colors shadow">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* FORM MODAL: EDIT/CREATE ADVERTISER */}
      {isAdvModalOpen && currentAdv && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleSaveAdvertiser} className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">{currentAdv.id ? "Edit Profil Advertiser" : "Daftarkan Pengiklan Baru"}</h3>
              <button type="button" onClick={() => setIsAdvModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Kontak</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Budi Santoso"
                value={currentAdv.name || ""}
                onChange={e => setCurrentAdv({ ...currentAdv, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Perusahaan / Instansi</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: PT Telkom Indonesia Tbk"
                value={currentAdv.company || ""}
                onChange={e => setCurrentAdv({ ...currentAdv, company: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email Korespondensi</label>
              <input 
                type="email" 
                required
                placeholder="ads@telkom.co.id"
                value={currentAdv.email || ""}
                onChange={e => setCurrentAdv({ ...currentAdv, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nomor Telepon</label>
              <input 
                type="text" 
                placeholder="+62 21 ..."
                value={currentAdv.phone || ""}
                onChange={e => setCurrentAdv({ ...currentAdv, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end gap-2.5">
              <button type="button" onClick={() => setIsAdvModalOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors">Batal</button>
              <button type="submit" className="bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 font-black py-2 px-6 rounded-lg cursor-pointer transition-colors shadow">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* FORM MODAL: EDIT/CREATE CAMPAIGN */}
      {isCampModalOpen && currentCamp && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleSaveCampaign} className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">{currentCamp.id ? "Edit Kampanye" : "Buat Kampanye Iklan"}</h3>
              <button type="button" onClick={() => setIsCampModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Kampanye</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Livin by Mandiri Promo 2026"
                value={currentCamp.name || ""}
                onChange={e => setCurrentCamp({ ...currentCamp, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Advertiser (Pengiklan Terikat)</label>
              <select 
                value={currentCamp.advertiserId || ""}
                onChange={e => setCurrentCamp({ ...currentCamp, advertiserId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              >
                <option value="">-- Pilih Pengiklan --</option>
                {advertisers.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Anggaran Finansial Total (Rp)</label>
              <input 
                type="number" 
                value={currentCamp.budget || 0}
                onChange={e => setCurrentCamp({ ...currentCamp, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mulai Tayang</label>
                <input 
                  type="date" 
                  value={currentCamp.startDate || ""}
                  onChange={e => setCurrentCamp({ ...currentCamp, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Akhir Tayang</label>
                <input 
                  type="date" 
                  value={currentCamp.endDate || ""}
                  onChange={e => setCurrentCamp({ ...currentCamp, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end gap-2.5">
              <button type="button" onClick={() => setIsCampModalOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors">Batal</button>
              <button type="submit" className="bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 font-black py-2 px-6 rounded-lg cursor-pointer transition-colors shadow">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* FORM MODAL: EDIT/CREATE PRICING */}
      {isPricingModalOpen && currentPricing && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
          <form onSubmit={handleSavePricing} className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase">{currentPricing.id ? "Edit Tarif Sewa" : "Atur Tarif Slot Baru"}</h3>
              <button type="button" onClick={() => setIsPricingModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Slot Slug</label>
              <select 
                value={currentPricing.slotSlug || ""}
                onChange={e => setCurrentPricing({ ...currentPricing, slotSlug: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              >
                <option value="">-- Pilih Slot Posisi --</option>
                {adSlots.map(s => (
                  <option key={s.id} value={s.slug}>{s.name} ({s.size})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Harga Sewa per Hari (CPD / Rp)</label>
              <input 
                type="number" 
                value={currentPricing.pricePerDay || 0}
                onChange={e => setCurrentPricing({ ...currentPricing, pricePerDay: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Harga per Impresi (CPM / Rp)</label>
                <input 
                  type="number" 
                  value={currentPricing.pricePerImpression || 0}
                  onChange={e => setCurrentPricing({ ...currentPricing, pricePerImpression: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Harga per Klik (CPC / Rp)</label>
                <input 
                  type="number" 
                  value={currentPricing.pricePerClick || 0}
                  onChange={e => setCurrentPricing({ ...currentPricing, pricePerClick: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D71920] text-slate-200"
                />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end gap-2.5">
              <button type="button" onClick={() => setIsPricingModalOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors">Batal</button>
              <button type="submit" className="bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 font-black py-2 px-6 rounded-lg cursor-pointer transition-colors shadow">Simpan</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
