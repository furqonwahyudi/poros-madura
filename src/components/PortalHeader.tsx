import React, { useState, useEffect, useRef } from "react";
import { Search, Menu, X, Landmark, Globe, Radio, Sparkles, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { Article } from "../types";
import AdManagerSlot from "./AdManagerSlot";
import logoUrl from "@/Logo_Type_trans.png";
import iconUrl from "@/ICON.png";

interface PortalHeaderProps {
  onCategorySelect: (category: string | null, subCategory?: string | null) => void;
  selectedCategory: string | null;
  selectedSubCategory?: string | null;
  onSearch: (query: string) => void;
  onSelectArticle: (article: Article) => void;
  lang: "ID" | "EN";
  setLang: (l: "ID" | "EN") => void;
  onGoToAdmin: () => void;
  currentPage: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PortalHeader({
  onCategorySelect,
  selectedCategory,
  selectedSubCategory,
  onSearch,
  onSelectArticle,
  lang,
  setLang,
  onGoToAdmin,
  currentPage
}: PortalHeaderProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [iconError, setIconError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: [0], rootMargin: "-1px 0px 0px 0px" }
    );
    const curr = sentinelRef.current;
    if (curr) observer.observe(curr);
    return () => {
      if (curr) observer.unobserve(curr);
    };
  }, []);

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setActiveDropdown(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, menuKey: string) => {
    if (e.key === "Escape") {
      setActiveDropdown(null);
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const menuItems = [
    { name: { ID: "BERANDA", EN: "HOME" }, category: null },
    {
      name: { ID: "BERITA", EN: "NEWS" },
      category: "Berita",
      subItems: [
        { name: "Politik", category: "Berita", subCategory: "Politik" },
        { name: "Pemerintahan", category: "Berita", subCategory: "Pemerintahan" },
        { name: "Hukum", category: "Berita", subCategory: "Hukum" },
        { name: "Kriminal", category: "Berita", subCategory: "Kriminal" },
        { name: "Pendidikan", category: "Berita", subCategory: "Pendidikan" },
        { name: "Ekonomi", category: "Berita", subCategory: "Ekonomi" },
        { name: "Kesehatan", category: "Berita", subCategory: "Kesehatan" },
      ]
    },
    {
      name: { ID: "DAERAH", EN: "REGIONS" },
      category: "Daerah",
      subItems: [
        { name: "Bangkalan", category: "Daerah", subCategory: "Bangkalan" },
        { name: "Sampang", category: "Daerah", subCategory: "Sampang" },
        { name: "Pamekasan", category: "Daerah", subCategory: "Pamekasan" },
        { name: "Sumenep", category: "Daerah", subCategory: "Sumenep" },
        { name: "Madura Raya", category: "Daerah", subCategory: "Madura Raya" },
      ]
    },
    { name: { ID: "NASIONAL", EN: "NATIONAL" }, category: "Nasional" },
    {
      name: { ID: "OLAHRAGA", EN: "SPORTS" },
      category: "Olahraga",
      subItems: [
        { name: "Sepak Bola", category: "Olahraga", subCategory: "Sepak Bola" },
        { name: "Bola Voli", category: "Olahraga", subCategory: "Bola Voli" },
        { name: "Basket", category: "Olahraga", subCategory: "Basket" },
        { name: "MotoGP", category: "Olahraga", subCategory: "MotoGP" },
      ]
    },
    {
      name: { ID: "TEKNOLOGI", EN: "TECHNOLOGY" },
      category: "Teknologi",
      subItems: [
        { name: "Gadget", category: "Teknologi", subCategory: "Gadget" },
        { name: "AI", category: "Teknologi", subCategory: "AI" },
        { name: "Internet", category: "Teknologi", subCategory: "Internet" },
        { name: "Startup", category: "Teknologi", subCategory: "Startup" },
      ]
    },
    {
      name: { ID: "OTOMOTIF", EN: "AUTOMOTIVE" },
      category: "Otomotif",
      subItems: [
        { name: "Mobil", category: "Otomotif", subCategory: "Mobil" },
        { name: "Motor", category: "Otomotif", subCategory: "Motor" },
        { name: "Tips", category: "Otomotif", subCategory: "Tips" },
      ]
    },
    {
      name: { ID: "LIFESTYLE", EN: "LIFESTYLE" },
      category: "Lifestyle",
      subItems: [
        { name: "Wisata", category: "Lifestyle", subCategory: "Wisata" },
        { name: "Kuliner", category: "Lifestyle", subCategory: "Kuliner" },
        { name: "Budaya", category: "Lifestyle", subCategory: "Budaya" },
        { name: "Hiburan", category: "Lifestyle", subCategory: "Hiburan" },
      ]
    },
    { name: { ID: "OPINI", EN: "OPINION" }, category: "Opini" }
  ];

  const mobileFlatCategories = [
    { name: { ID: "BERANDA", EN: "HOME" }, category: null, subCategory: null },
    { name: { ID: "Berita", EN: "News" }, category: "Berita", subCategory: null },
    { name: { ID: "Politik", EN: "Politics" }, category: "Berita", subCategory: "Politik" },
    { name: { ID: "Pemerintahan", EN: "Government" }, category: "Berita", subCategory: "Pemerintahan" },
    { name: { ID: "Hukum", EN: "Law" }, category: "Berita", subCategory: "Hukum" },
    { name: { ID: "Kriminal", EN: "Crime" }, category: "Berita", subCategory: "Kriminal" },
    { name: { ID: "Pendidikan", EN: "Education" }, category: "Berita", subCategory: "Pendidikan" },
    { name: { ID: "Ekonomi", EN: "Economy" }, category: "Berita", subCategory: "Ekonomi" },
    { name: { ID: "Kesehatan", EN: "Health" }, category: "Berita", subCategory: "Kesehatan" },
    { name: { ID: "Daerah", EN: "Regions" }, category: "Daerah", subCategory: null },
    { name: { ID: "Bangkalan", EN: "Bangkalan" }, category: "Daerah", subCategory: "Bangkalan" },
    { name: { ID: "Sampang", EN: "Sampang" }, category: "Daerah", subCategory: "Sampang" },
    { name: { ID: "Pamekasan", EN: "Pamekasan" }, category: "Daerah", subCategory: "Pamekasan" },
    { name: { ID: "Sumenep", EN: "Sumenep" }, category: "Daerah", subCategory: "Sumenep" },
    { name: { ID: "Madura Raya", EN: "Great Madura" }, category: "Daerah", subCategory: "Madura Raya" },
    { name: { ID: "Nasional", EN: "National" }, category: "Nasional", subCategory: null },
    { name: { ID: "Olahraga", EN: "Sports" }, category: "Olahraga", subCategory: null },
    { name: { ID: "Sepak Bola", EN: "Football" }, category: "Olahraga", subCategory: "Sepak Bola" },
    { name: { ID: "Bola Voli", EN: "Volleyball" }, category: "Olahraga", subCategory: "Bola Voli" },
    { name: { ID: "Basket", EN: "Basketball" }, category: "Olahraga", subCategory: "Basket" },
    { name: { ID: "MotoGP", EN: "MotoGP" }, category: "Olahraga", subCategory: "MotoGP" },
    { name: { ID: "Teknologi", EN: "Technology" }, category: "Teknologi", subCategory: null },
    { name: { ID: "Gadget", EN: "Gadget" }, category: "Teknologi", subCategory: "Gadget" },
    { name: { ID: "AI", EN: "AI" }, category: "Teknologi", subCategory: "AI" },
    { name: { ID: "Internet", EN: "Internet" }, category: "Teknologi", subCategory: "Internet" },
    { name: { ID: "Startup", EN: "Startup" }, category: "Teknologi", subCategory: "Startup" },
    { name: { ID: "Otomotif", EN: "Automotive" }, category: "Otomotif", subCategory: null },
    { name: { ID: "Mobil", EN: "Car" }, category: "Otomotif", subCategory: "Mobil" },
    { name: { ID: "Motor", EN: "Motorcycle" }, category: "Otomotif", subCategory: "Motor" },
    { name: { ID: "Tips", EN: "Tips" }, category: "Otomotif", subCategory: "Tips" },
    { name: { ID: "Lifestyle", EN: "Lifestyle" }, category: "Lifestyle", subCategory: null },
    { name: { ID: "Wisata", EN: "Tourism" }, category: "Lifestyle", subCategory: "Wisata" },
    { name: { ID: "Kuliner", EN: "Culinary" }, category: "Lifestyle", subCategory: "Kuliner" },
    { name: { ID: "Budaya", EN: "Culture" }, category: "Lifestyle", subCategory: "Budaya" },
    { name: { ID: "Hiburan", EN: "Entertainment" }, category: "Lifestyle", subCategory: "Hiburan" },
    { name: { ID: "Opini", EN: "Opinion" }, category: "Opini", subCategory: null }
  ];

  const isItemActive = (item: any) => {
    if (item.category && item.category === selectedCategory) return true;
    if (item.subItems) {
      return item.subItems.some((sub: any) => 
        (sub.category === selectedCategory && sub.subCategory === selectedSubCategory)
      );
    }
    return false;
  };

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };
      setCurrentTime(now.toLocaleDateString(lang === "ID" ? 'id-ID' : 'en-US', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  // Fetch breaking news for the ticker
  useEffect(() => {
    fetch("/api/articles")
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Response was not JSON");
      })
      .then((data: Article[]) => {
        setBreakingNews(data.slice(0, 5));
      })
      .catch(err => console.error("Error fetching breaking news", err));
  }, []);



  // Suggestions search logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      fetch(`/api/articles?search=${encodeURIComponent(searchQuery)}`)
        .then(res => {
          if (!res.ok) throw new Error("Network response was not ok");
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          }
          throw new Error("Response was not JSON");
        })
        .then((data: Article[]) => {
          setSuggestions(data.slice(0, 5));
        })
        .catch(err => console.error("Error searching suggestions", err));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Handle click outside of search box to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setMobileSearchOpen(false);
  };

  const handleSuggestionClick = (art: Article) => {
    onSelectArticle(art);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <>


      <header className="w-full bg-white border-b border-gray-100 z-30 shadow-xs relative">
      {/* Top Bar (Meta-bar info) */}
      <div className="hidden md:flex w-full bg-[#0D2B5C] text-white py-2 px-4 sm:px-6 lg:px-8 text-xs flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[11px] opacity-90">{currentTime}</span>
          <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[#D71920] animate-pulse"></span>
          <span className="hidden md:inline text-[11px] opacity-90 text-[#D71920] font-medium">Enterprise News Room Active</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button 
            id="lang-toggle"
            onClick={() => setLang(lang === "ID" ? "EN" : "ID")}
            className="flex items-center gap-1 hover:text-[#D71920] transition-colors bg-white/10 px-2 py-0.5 rounded cursor-pointer"
          >
            <Globe size={12} />
            <span className="font-bold tracking-wider">{lang}</span>
          </button>

          {/* CMS Button */}
          <button 
            id="btn-goto-cms"
            onClick={onGoToAdmin}
            className="flex items-center gap-1 bg-[#D71920] text-white px-3 py-1 rounded-full font-bold text-[11px] shadow-sm hover:scale-105 transition-transform cursor-pointer"
          >
            <Sparkles size={11} />
            <span>CMS ADMIN</span>
          </button>
        </div>
      </div>

      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="w-full bg-gray-50 border-b border-gray-100 py-1 px-4 overflow-hidden relative flex items-center">
          <div className="absolute left-0 top-0 bottom-0 bg-[#D71920] text-white px-3 flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider shadow-md z-10 select-none">
            <Radio size={12} className="animate-pulse" />
            <span>BREAKING</span>
          </div>
          
          <div className="w-full overflow-hidden whitespace-nowrap pl-24 md:pl-28 flex items-center">
            <div className="animate-marquee py-0.5 flex gap-12 font-medium text-xs text-gray-700">
              {[...breakingNews, ...breakingNews].map((news, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectArticle(news)}
                  className="hover:text-[#0D2B5C] transition-colors hover:underline text-left cursor-pointer flex items-center gap-1"
                >
                  <span className="text-[#1E40AF]">●</span> {news.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <AdManagerSlot slug="breaking-news-banner" page={currentPage} category={selectedCategory} />

      {/* Main Bar (Logo and Search) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        {mobileSearchOpen ? (
          <div className="flex-1 flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 text-gray-500 hover:text-[#0D2B5C] rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>
            <form onSubmit={handleMobileSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                autoFocus
                placeholder={lang === "ID" ? "Cari berita terkini..." : "Search latest news..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2B5C]/20 focus:border-[#0D2B5C] transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 text-gray-400" size={16} />
            </form>
          </div>
        ) : (
          <>
            {/* Brand/Logo */}
            <div className="flex-1 flex justify-start">
              <div className="flex flex-col cursor-pointer shrink-0" onClick={() => onCategorySelect(null)}>
                <img src={logoUrl} alt="Poros Madura" className="h-10 sm:h-12 w-auto object-contain" />
              </div>
            </div>

            {/* Dynamic Header Banner Ad Slot */}
            <div className="hidden lg:flex justify-center shrink-0">
              <AdManagerSlot slug="header-banner" page={currentPage} category={selectedCategory} />
            </div>

            {/* Search Engine */}
            <div className="flex-1 flex justify-end items-center gap-1">
              <div ref={searchRef} className="hidden md:block relative w-full max-w-[280px]">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder={lang === "ID" ? "Cari berita terkini..." : "Search latest news..."}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2B5C]/20 focus:border-[#0D2B5C] transition-all"
                  />
                  <Search className="absolute left-3.5 top-2.5 text-gray-400" size={16} />
                </form>

                {/* Search suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-50">
                    <div className="bg-gray-50 px-3 py-1.5 text-[10px] font-semibold text-gray-400 font-mono">
                      SUGGESTIONS
                    </div>
                    {suggestions.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => handleSuggestionClick(art)}
                        className="px-4 py-3 hover:bg-[#0D2B5C]/5 transition-colors cursor-pointer flex gap-3 items-start"
                      >
                        <img
                          src={art.image}
                          alt={art.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
                            {art.title}
                          </h4>
                          <span className="text-[10px] text-[#1E40AF] font-medium uppercase tracking-wider block mt-0.5">
                            {art.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Search Icon */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden p-2 text-gray-600 hover:text-[#0D2B5C] rounded-lg cursor-pointer ml-3"
                title={lang === "ID" ? "Cari" : "Search"}
              >
                <Search size={22} />
              </button>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-[#0D2B5C] rounded-lg cursor-pointer ml-1"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Menu Open state */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 shadow-lg absolute left-0 right-0 z-50 max-h-[80vh] overflow-y-auto">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder={lang === "ID" ? "Cari berita..." : "Search news..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2B5C]/20"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </form>

          {/* Quick Info */}
          <div className="text-[11px] text-gray-400 font-mono mb-4 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
            <span>LIVE: {currentTime}</span>
          </div>

          {/* Mobile Categories (Collapsible / Grouped List) */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold text-[#0D2B5C] uppercase tracking-wider mb-3 px-2">
              KATEGORI MENU
            </h3>
            <div className="flex flex-col gap-2">
              {menuItems.map((item, idx) => {
                const displayName = lang === "ID" ? item.name.ID : item.name.EN;
                const active = isItemActive(item);
                
                if (item.subItems) {
                  const menuKey = item.name.ID;
                  const isExpanded = openSubmenus[menuKey] ?? active;
                  return (
                    <div key={idx} className="flex flex-col bg-gray-50/60 p-2 rounded-xl">
                      <button
                        onClick={() => {
                          setOpenSubmenus(prev => ({
                            ...prev,
                            [menuKey]: !isExpanded
                          }));
                          if (item.category) {
                            onCategorySelect(item.category);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#0D2B5C] hover:text-[#D71920] transition-colors cursor-pointer text-left`}
                      >
                        <span className={active ? "text-[#D71920]" : ""}>{displayName}</span>
                        <ChevronDown 
                          size={16} 
                          className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180 text-[#D71920]" : ""}`} 
                        />
                      </button>
                      
                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-3.5 flex flex-col gap-1 mt-1.5 border-l-2 border-[#0D2B5C]/10 ml-2.5 overflow-hidden"
                        >
                          {item.subItems.map((sub, sIdx) => {
                            const subActive = selectedCategory === sub.category && selectedSubCategory === sub.subCategory;
                            return (
                              <button
                                key={sIdx}
                                onClick={() => {
                                  onCategorySelect(sub.category, sub.subCategory);
                                  setMobileMenuOpen(false);
                                }}
                                className={`text-left px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                                  subActive
                                    ? "bg-[#0D2B5C] text-white font-bold shadow-xs"
                                    : "text-gray-600 hover:bg-white hover:text-[#0D2B5C]"
                                }`}
                              >
                                {sub.name}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onCategorySelect(item.category);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left px-3 py-2 text-xs font-extrabold uppercase tracking-wide rounded-lg transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-[#0D2B5C] text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#0D2B5C]"
                    }`}
                  >
                    {displayName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>

    {/* Sentinel for sticky detection */}
    <div ref={sentinelRef} className="h-0 w-full pointer-events-none" />

    {/* Categories Navigation Bar */}
    <motion.nav 
      animate={{
        y: isSticky ? [-15, 0] : 0,
        boxShadow: isSticky 
          ? "0 10px 25px -5px rgba(13, 43, 92, 0.1), 0 8px 10px -6px rgba(13, 43, 92, 0.1)"
          : "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
      }}
      transition={{
        y: { duration: 0.3, ease: "easeOut" },
        boxShadow: { duration: 0.2 }
      }}
      className={`hidden md:block border-b border-gray-100 sticky top-0 z-45 transition-all duration-300 ${
        isSticky 
          ? "bg-white/90 backdrop-blur-xl py-1.5 border-[#0D2B5C]/15" 
          : "border-t bg-white/95 backdrop-blur-md py-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Dropdown-based menu */}
        <div className="hidden md:flex items-center justify-between py-2 flex-wrap gap-y-1.5">
          <div className="flex items-center gap-1 flex-wrap">
            {isSticky && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center pr-3 mr-2 border-r border-gray-100 shrink-0"
              >
                {!iconError ? (
                  <img
                    src={iconUrl}
                    alt="Logo Icon"
                    className="h-10 w-10 rounded-full object-contain cursor-pointer transition-transform hover:scale-110 duration-200 shadow-sm border border-gray-100"
                    onClick={() => onCategorySelect(null)}
                    onError={() => setIconError(true)}
                  />
                ) : (
                  <div
                    onClick={() => onCategorySelect(null)}
                    className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#0D2B5C] to-[#D71920] flex items-center justify-center text-white font-black text-xs cursor-pointer shadow-sm transition-transform hover:scale-110 duration-200"
                  >
                    PM
                  </div>
                )}
              </motion.div>
            )}
            <nav aria-label="Navigasi Utama">
              <ul className="flex items-center gap-1 flex-wrap">
                {menuItems.map((item, idx) => {
                  const active = isItemActive(item);
                  const displayName = lang === "ID" ? item.name.ID : item.name.EN;
                  const menuKey = item.name.ID;
                  const href = item.category ? `/${slugify(item.category)}` : "/";
                  
                  if (item.subItems) {
                    const isDropdownOpen = activeDropdown === menuKey;
                    return (
                      <li 
                        key={idx} 
                        className="relative shrink-0"
                        onMouseEnter={() => setActiveDropdown(menuKey)}
                        onMouseLeave={() => setActiveDropdown(null)}
                        onBlur={handleBlur}
                      >
                        <a
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            onCategorySelect(item.category);
                          }}
                          onFocus={() => setActiveDropdown(menuKey)}
                          onKeyDown={(e) => handleKeyDown(e, menuKey)}
                          aria-expanded={isDropdownOpen ? "true" : "false"}
                          aria-haspopup="true"
                          aria-controls={`dropdown-${idx}`}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                            active
                              ? "bg-[#0D2B5C] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100 hover:text-[#0D2B5C]"
                          }`}
                        >
                          <span>{displayName}</span>
                          <ChevronDown size={12} className={`transition-transform duration-200 shrink-0 ${isDropdownOpen ? "rotate-180" : ""} ${active ? "text-white" : "text-gray-400"}`} />
                        </a>
                        {/* Dropdown Menu */}
                        <div 
                          id={`dropdown-${idx}`}
                          role="menu"
                          className={`absolute left-0 top-full w-48 pt-1 z-50 transform transition-all duration-150 ease-out ${
                            isDropdownOpen 
                              ? "opacity-100 translate-y-0 visible pointer-events-auto" 
                              : "opacity-0 -translate-y-[6px] invisible pointer-events-none"
                          }`}
                        >
                          <div className="bg-white border border-gray-100 rounded-xl shadow-xl py-1 divide-y divide-gray-50/50">
                          {item.subItems.map((sub, sIdx) => {
                            const subActive = selectedCategory === sub.category && selectedSubCategory === sub.subCategory;
                            const subHref = `/${slugify(sub.category)}/${slugify(sub.subCategory)}`;
                            return (
                              <a
                                key={sIdx}
                                role="menuitem"
                                href={subHref}
                                onClick={(e) => {
                                  e.preventDefault();
                                  onCategorySelect(sub.category, sub.subCategory);
                                }}
                                onFocus={() => setActiveDropdown(menuKey)}
                                onKeyDown={(e) => handleKeyDown(e, menuKey)}
                                className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors cursor-pointer block ${
                                  subActive
                                    ? "bg-[#0D2B5C]/10 text-[#0D2B5C] font-bold"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0D2B5C]"
                                }`}
                              >
                                {sub.name}
                              </a>
                            );
                          })}
                          </div>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={idx} className="shrink-0">
                      <a
                        href={href}
                        onClick={(e) => {
                          e.preventDefault();
                          onCategorySelect(item.category);
                        }}
                        onFocus={() => setActiveDropdown(null)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer block ${
                          active
                            ? "bg-[#0D2B5C] text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-[#0D2B5C]"
                        }`}
                      >
                        {displayName}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile Horizontal scrollbar of flat categories */}
        <div className="flex md:hidden gap-1 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 w-full items-center">
          {isSticky && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="pr-2.5 mr-1.5 border-r border-gray-100 shrink-0 flex items-center"
            >
              {!iconError ? (
                <img
                  src={iconUrl}
                  alt="Logo Icon"
                  className="h-8 w-8 rounded-full object-contain cursor-pointer shadow-xs border border-gray-100"
                  onClick={() => onCategorySelect(null)}
                  onError={() => setIconError(true)}
                />
              ) : (
                <div
                  onClick={() => onCategorySelect(null)}
                  className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#0D2B5C] to-[#D71920] flex items-center justify-center text-white font-black text-[10px] cursor-pointer shadow-xs"
                >
                  PM
                </div>
              )}
            </motion.div>
          )}
          {mobileFlatCategories.map((item, idx) => {
            const active = selectedCategory === item.category && selectedSubCategory === item.subCategory;
            const displayName = lang === "ID" ? item.name.ID : item.name.EN;
            return (
              <button
                key={idx}
                id={`cat-mobile-${idx}`}
                onClick={() => onCategorySelect(item.category, item.subCategory)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                  active
                    ? "bg-[#0D2B5C] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#0D2B5C]"
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>

    {/* Dynamic Top Leaderboard Ad Slot */}
    <div className="w-full bg-[#FAFAFB] py-2 flex justify-center">
      <AdManagerSlot slug="top-leaderboard" page={currentPage} category={selectedCategory} />
    </div>

  </>
);
}
