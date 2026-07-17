import React, { useState, useEffect, useRef } from "react";
import { Search, Menu, X, Radio } from "lucide-react";
import { Article } from "../types";
import AdManagerSlot from "./shared/AdManagerSlot";
import logoUrl from "@/Logo_Type_trans.png";
import { dummyArticles } from "../data/dummyArticles";

import HeaderTopBar from "./portal/header/HeaderTopBar";
import HeaderMobileMenu from "./portal/header/HeaderMobileMenu";
import HeaderNavigation from "./portal/header/HeaderNavigation";

interface PortalHeaderProps {
  onCategorySelect: (category: string | null, subCategory?: string | null) => void;
  selectedCategory: string | null;
  selectedSubCategory?: string | null;
  onSearch: (query: string) => void;
  onSelectArticle: (article: Article) => void;
  lang: "ID" | "EN";
  setLang: (l: "ID" | "EN") => void;
  currentPage: string;
}

export default function PortalHeader({
  onCategorySelect,
  selectedCategory,
  selectedSubCategory,
  onSearch,
  onSelectArticle,
  lang,
  setLang,
  currentPage
}: PortalHeaderProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

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

  const menuItems = [
    { name: { ID: "BERANDA", EN: "HOME" }, category: null },
    {
      name: { ID: "DAERAH", EN: "REGIONS" },
      isWrapper: true,
      category: null,
      subItems: [
        { name: "Bangkalan", category: "Daerah", subCategory: "Bangkalan" },
        { name: "Sampang", category: "Daerah", subCategory: "Sampang" },
        { name: "Pamekasan", category: "Daerah", subCategory: "Pamekasan" },
        { name: "Sumenep", category: "Daerah", subCategory: "Sumenep" },
      ]
    },
    {
      name: { ID: "NASIONAL", EN: "NATIONAL" },
      isWrapper: true,
      category: null,
      subItems: [
        { name: "Politik", category: "Nasional", subCategory: "Politik" },
        { name: "Pemerintahan", category: "Nasional", subCategory: "Pemerintahan" },
        { name: "Hukum", category: "Nasional", subCategory: "Hukum" },
        { name: "Kriminal", category: "Nasional", subCategory: "Kriminal" },
        { name: "Pendidikan", category: "Nasional", subCategory: "Pendidikan" },
        { name: "Kesehatan", category: "Nasional", subCategory: "Kesehatan" },
        { name: "Ekonomi", category: "Nasional", subCategory: "Ekonomi" },
      ]
    },
    { name: { ID: "OLAHRAGA", EN: "SPORTS" }, category: "Olahraga" },
    { name: { ID: "TEKNOLOGI", EN: "TECHNOLOGY" }, category: "Teknologi" },
    { name: { ID: "OTOMOTIF", EN: "AUTOMOTIVE" }, category: "Otomotif" },
    {
      name: { ID: "LAINNYA", EN: "OTHERS" },
      isWrapper: true,
      category: null,
      subItems: [
        { name: "Lifestyle", category: "Lainnya", subCategory: "Lifestyle" },
        { name: "Budaya", category: "Lainnya", subCategory: "Budaya" },
        { name: "Wisata", category: "Lainnya", subCategory: "Wisata" },
        { name: "Kuliner", category: "Lainnya", subCategory: "Kuliner" },
        { name: "Hiburan", category: "Lainnya", subCategory: "Hiburan" },
        { name: "Opini", category: "Lainnya", subCategory: "Opini" },
      ]
    }
  ];

  const mobileFlatCategories = [
    { name: { ID: "BERANDA", EN: "HOME" }, category: null, subCategory: null },
    { name: { ID: "Bangkalan", EN: "Bangkalan" }, category: "Daerah", subCategory: "Bangkalan" },
    { name: { ID: "Sampang", EN: "Sampang" }, category: "Daerah", subCategory: "Sampang" },
    { name: { ID: "Pamekasan", EN: "Pamekasan" }, category: "Daerah", subCategory: "Pamekasan" },
    { name: { ID: "Sumenep", EN: "Sumenep" }, category: "Daerah", subCategory: "Sumenep" },
    { name: { ID: "Politik", EN: "Politics" }, category: "Nasional", subCategory: "Politik" },
    { name: { ID: "Pemerintahan", EN: "Government" }, category: "Nasional", subCategory: "Pemerintahan" },
    { name: { ID: "Hukum", EN: "Law" }, category: "Nasional", subCategory: "Hukum" },
    { name: { ID: "Kriminal", EN: "Crime" }, category: "Nasional", subCategory: "Kriminal" },
    { name: { ID: "Pendidikan", EN: "Education" }, category: "Nasional", subCategory: "Pendidikan" },
    { name: { ID: "Kesehatan", EN: "Health" }, category: "Nasional", subCategory: "Kesehatan" },
    { name: { ID: "Ekonomi", EN: "Economy" }, category: "Nasional", subCategory: "Ekonomi" },
    { name: { ID: "Olahraga", EN: "Sports" }, category: "Olahraga", subCategory: null },
    { name: { ID: "Teknologi", EN: "Technology" }, category: "Teknologi", subCategory: null },
    { name: { ID: "Otomotif", EN: "Automotive" }, category: "Otomotif", subCategory: null },
    { name: { ID: "Lifestyle", EN: "Lifestyle" }, category: "Lainnya", subCategory: "Lifestyle" },
    { name: { ID: "Budaya", EN: "Culture" }, category: "Lainnya", subCategory: "Budaya" },
    { name: { ID: "Wisata", EN: "Tourism" }, category: "Lainnya", subCategory: "Wisata" },
    { name: { ID: "Kuliner", EN: "Culinary" }, category: "Lainnya", subCategory: "Kuliner" },
    { name: { ID: "Hiburan", EN: "Entertainment" }, category: "Lainnya", subCategory: "Hiburan" },
    { name: { ID: "Opini", EN: "Opinion" }, category: "Lainnya", subCategory: "Opini" }
  ];

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
    const news = dummyArticles.filter(a => a.isBreaking);
    setBreakingNews(news.length > 0 ? news.slice(0, 5) : dummyArticles.slice(0, 5));
  }, []);

  // Suggestions search logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const query = searchQuery.toLowerCase();
      const results = dummyArticles.filter(a => 
        a.title.toLowerCase().includes(query) || 
        (a.category && a.category.toLowerCase().includes(query))
      );
      setSuggestions(results.slice(0, 5));
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
      <header className="w-full bg-white border-b border-gray-100 z-50 shadow-xs relative">
        <HeaderTopBar lang={lang} setLang={setLang} currentTime={currentTime} />

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
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2B5C]/20 focus:border-[#0D2B5C] transition-all"
                />
                <Search className="absolute left-3.5 top-2.5 text-gray-400" size={16} />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                    className="absolute right-3.5 top-2.5 text-gray-400 hover:text-[#0D2B5C] rounded-full p-0.5 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
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
                      className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full text-sm bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2B5C]/20 focus:border-[#0D2B5C] transition-all"
                    />
                    <Search className="absolute left-3.5 top-2.5 text-gray-400" size={16} />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setShowSuggestions(false);
                        }}
                        className="absolute right-3.5 top-2.5 text-gray-400 hover:text-[#0D2B5C] rounded-full p-0.5 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    )}
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
                              {art.subCategory ? art.subCategory : art.category}
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

        {mobileMenuOpen && (
          <HeaderMobileMenu
            lang={lang}
            currentTime={currentTime}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchSubmit={handleSearchSubmit}
            menuItems={menuItems}
            selectedCategory={selectedCategory}
            selectedSubCategory={selectedSubCategory}
            onCategorySelect={onCategorySelect}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        )}
      </header>

      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} className="h-0 w-full pointer-events-none" />

      <HeaderNavigation
        isSticky={isSticky}
        lang={lang}
        menuItems={menuItems}
        mobileFlatCategories={mobileFlatCategories}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        onCategorySelect={onCategorySelect}
      />

      {/* Dynamic Top Leaderboard Ad Slot */}
      <div className="w-full bg-[#FAFAFB] py-2 flex justify-center">
        <AdManagerSlot slug="top-leaderboard" page={currentPage} category={selectedCategory} />
      </div>
    </>
  );
}
