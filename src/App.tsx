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

const categoryHierarchy: Record<string, string[]> = {
  "Berita": ["Politik", "Pemerintahan", "Hukum", "Kriminal"],
  "Daerah": ["Bangkalan", "Sampang", "Pamekasan", "Sumenep", "Madura Raya"],
  "Nasional": [],
  "Pendidikan": [],
  "Ekonomi": [],
  "Kesehatan": [],
  "Olahraga": ["Sepak Bola", "Bola Voli", "Basket", "MotoGP"],
  "Teknologi": ["Gadget", "AI", "Internet", "Startup"],
  "Otomotif": ["Mobil", "Motor", "Tips"],
  "Lifestyle": ["Wisata", "Kuliner", "Budaya", "Hiburan"],
  "Opini": []
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function App() {
  const [lang, setLang] = useState<"ID" | "EN">("ID");
  const [isCmsMode, setIsCmsMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigateTo = (path: string, options: { dispatch?: boolean } = {}) => {
    window.history.pushState(null, "", path);
    if (options.dispatch !== false) {
      window.dispatchEvent(new Event("popstate"));
    }
  };

  useEffect(() => {
    const handleLocationChange = async () => {
      const path = window.location.pathname.substring(1);
      const searchParams = new URLSearchParams(window.location.search);
      const querySearch = searchParams.get("search") || "";
      
      if (querySearch) {
        setSearchQuery(querySearch);
        setSelectedCategory(null);
        setSelectedSubCategory(null);
        setSelectedArticle(null);
        return;
      } else {
        setSearchQuery("");
      }

      if (!path) {
        setSelectedCategory(null);
        setSelectedSubCategory(null);
        setSelectedArticle(null);
        return;
      }
      
      const segments = path.split("/").filter(Boolean);
      if (segments[0] === "admin") {
        setIsCmsMode(true);
        return;
      }
      
      if (segments[0] === "rekomendasi") {
        setSelectedCategory("rekomendasi");
        setSelectedSubCategory(null);
        setSelectedArticle(null);
        return;
      }
      
      if (segments.length === 1) {
        const parentMatch = Object.keys(categoryHierarchy).find(
          parent => slugify(parent) === segments[0]
        );
        if (parentMatch) {
          setSelectedCategory(parentMatch);
          setSelectedSubCategory(null);
          setSelectedArticle(null);
        } else {
          // Fallback check if it's an article slug at root level
          try {
            const res = await fetch(`/api/articles/slug/${segments[0]}`);
            if (res.ok) {
              const article = await res.json();
              setSelectedArticle(article);
              setSelectedCategory(article.category || null);
              setSelectedSubCategory(article.subCategory || null);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else if (segments.length === 2) {
        const parentMatch = Object.keys(categoryHierarchy).find(
          parent => slugify(parent) === segments[0]
        );
        const subSegment = segments[1];
        
        const isSub = parentMatch && categoryHierarchy[parentMatch].some(
          sub => slugify(sub) === subSegment
        );
        
        if (parentMatch && isSub) {
          const subMatch = categoryHierarchy[parentMatch].find(
            sub => slugify(sub) === subSegment
          );
          setSelectedCategory(parentMatch);
          setSelectedSubCategory(subMatch || null);
          setSelectedArticle(null);
        } else {
          // It is a detail article: /:parent/:slug
          try {
            const res = await fetch(`/api/articles/slug/${subSegment}`);
            if (res.ok) {
              const article = await res.json();
              setSelectedArticle(article);
              setSelectedCategory(parentMatch || null);
              setSelectedSubCategory(article.subCategory || null);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    handleLocationChange();
    
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory, selectedSubCategory, selectedArticle, searchQuery]);

  const handleCategorySelect = (category: string | null, subCategory: string | null = null) => {
    if (!category) {
      navigateTo("/");
    } else if (category === "rekomendasi") {
      navigateTo("/rekomendasi");
    } else if (subCategory) {
      navigateTo(`/${slugify(category)}/${slugify(subCategory)}`);
    } else {
      navigateTo(`/${slugify(category)}`);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigateTo(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigateTo("/");
    }
  };

  const handleSelectArticle = (article: Article) => {
    const parentCategory = article.category || "artikel";
    setSelectedArticle(article);
    setSelectedCategory(article.category || null);
    setSelectedSubCategory(article.subCategory || null);
    setSearchQuery("");
    navigateTo(`/${slugify(parentCategory)}/${article.slug}`, { dispatch: false });
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
                selectedSubCategory={selectedSubCategory}
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
                    onBack={() => {
                      setSelectedArticle(null);
                      // If we go back, update URL to active category/subcategory
                      if (selectedCategory) {
                        if (selectedSubCategory) {
                          navigateTo(`/${slugify(selectedCategory)}/${slugify(selectedSubCategory)}`);
                        } else {
                          navigateTo(`/${slugify(selectedCategory)}`);
                        }
                      } else {
                        navigateTo("/");
                      }
                    }}
                    lang={lang}
                    onSelectArticle={handleSelectArticle}
                  />
                ) : (
                  <PortalHome
                    onSelectArticle={handleSelectArticle}
                    lang={lang}
                    selectedCategory={selectedCategory}
                    selectedSubCategory={selectedSubCategory}
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
