import { useState, useEffect } from "react";
import PortalHeader from "./components/PortalHeader";
import PortalHome from "./components/PortalHome";
import ArticleView from "./components/ArticleView";
import PortalFooter from "./components/PortalFooter";
import AdminCMS from "./components/AdminCMS";
import { Article } from "./types";
import { AdProvider } from "./context/AdContext";
import { DialogProvider } from "./context/DialogContext";
import AdManagerSlot from "./components/AdManagerSlot";
import FloatingAdLayout from "./components/FloatingAdLayout";

export default function App() {
  const [lang, setLang] = useState<"ID" | "EN">("ID");
  const [isCmsMode, setIsCmsMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory, selectedArticle, searchQuery]);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedArticle(null);
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedArticle(null);
    setSelectedCategory(null);
  };

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setSelectedCategory(null);
    setSearchQuery("");
  };

  if (isCmsMode) {
    return (
      <DialogProvider>
        <AdProvider>
          <AdminCMS 
            onBackToPortal={() => {
              setIsCmsMode(false);
              window.scrollTo(0, 0);
            }}
            lang={lang}
          />
        </AdProvider>
      </DialogProvider>
    );
  }

  // Determine current page context for ad targeting
  const currentPage = selectedArticle ? "artikel" : selectedCategory ? "kategori" : "homepage";

  return (
    <DialogProvider>
      <AdProvider>
        {/* ── Full-screen wrapper ────────────────────────────────────────── */}
      <div id="portal-root" className="flex flex-col min-h-screen bg-[#FAFAFB]">

        {/* Global Top Billboard (above everything, full-width) */}
        <AdManagerSlot slug="top-billboard" page={currentPage} category={selectedCategory} />

        {/* Popup / Interstitial overlay */}
        <AdManagerSlot slug="popup-interstitial" page={currentPage} category={selectedCategory} />

        {/* Mobile sticky bottom anchor */}
        <AdManagerSlot slug="mobile-anchor-banner" page={currentPage} category={selectedCategory} />

        {/*
          ── 3-Column Floating Ad Layout ──────────────────────────────────
          FloatingAdLayout handles:
            [Floating Left Skyscraper] | [Main Content Column] | [Floating Right Skyscraper]

          By placing PortalHeader, content pages, and PortalFooter inside the center
          column of FloatingAdLayout, we ensure that:
            1. The website container shrinks dynamically based on viewport.
            2. The entire site (header, menus, articles, and footer) stays perfectly
               centered and aligned.
            3. The floating ads sit immediately next to the content boundary
               with a constant gap (exactly like Detik.com / Kompas.com).
            4. No fixed-overlay elements overlap or block the website.
        */}
        <div className="flex-grow relative z-10">
          <FloatingAdLayout page={currentPage} category={selectedCategory}>
            <div className="flex flex-col min-h-screen bg-[#FAFAFB]">
              {/* Navigation Header */}
              <PortalHeader
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
                onSearch={handleSearch}
                onSelectArticle={handleSelectArticle}
                lang={lang}
                setLang={setLang}
                onGoToAdmin={() => setIsCmsMode(true)}
                currentPage={currentPage}
              />

              {/* Main Content Area */}
              <div className="flex-grow bg-[#FAFAFB]">
                {selectedArticle ? (
                  <ArticleView
                    article={selectedArticle}
                    onBack={() => setSelectedArticle(null)}
                    lang={lang}
                    onSelectArticle={handleSelectArticle}
                  />
                ) : (
                  <PortalHome
                    onSelectArticle={handleSelectArticle}
                    lang={lang}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    searchQuery={searchQuery}
                    onSearchClear={() => handleSearch("")}
                  />
                )}
              </div>

              {/* Footer */}
              <PortalFooter lang={lang} />
            </div>
          </FloatingAdLayout>
        </div>
      </div>
      </AdProvider>
    </DialogProvider>
  );
}
