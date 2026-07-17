import React from "react";
import { useParams, useOutletContext, useLocation } from "react-router-dom";
import PortalHome from "../../components/PortalHome";

interface PortalContext {
  lang: "ID" | "EN";
  onSelectArticle: (article: any) => void;
  onCategorySelect: (category: string | null, subCategory?: string | null) => void;
}

// Simple reverse slugify for dummy data matching (not perfect but works for prototype)
function unslugify(slug: string): string {
  if (!slug) return "";
  const parts = slug.split("-");
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function CategoryPage() {
  const { categorySlug, subCategorySlug } = useParams<{ categorySlug: string; subCategorySlug?: string }>();
  const location = useLocation();
  const { lang, onSelectArticle, onCategorySelect } = useOutletContext<PortalContext>();

  // Extract from path if params are missing (due to hardcoded routes in App.tsx)
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeCategorySlug = categorySlug || (pathParts.length > 0 ? pathParts[0] : "");
  const activeSubCategorySlug = subCategorySlug || (pathParts.length > 1 ? pathParts[1] : null);

  // In a real app, you'd fetch data based on the slug. 
  // Here we just pass the unslugified name back to PortalHome.
  const category = unslugify(activeCategorySlug);
  const subCategory = activeSubCategorySlug ? unslugify(activeSubCategorySlug) : null;

  return (
    <PortalHome
      lang={lang}
      onSelectArticle={onSelectArticle}
      onCategorySelect={onCategorySelect}
      selectedCategory={category}
      selectedSubCategory={subCategory}
    />
  );
}
