import React from "react";
import { Routes, Route } from "react-router-dom";
import { DialogProvider } from "./context/DialogContext";
import PortalLayout from "./layouts/PortalLayout";
import HomePage from "./pages/portal/HomePage";
import CategoryPage from "./pages/portal/CategoryPage";
import ArticlePage from "./pages/portal/ArticlePage";
import SearchPage from "./pages/portal/SearchPage";

export default function App() {
  return (
    <DialogProvider>
      <Routes>
        <Route path="/" element={<PortalLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          {/* 
            Since /:category/:slug and /:category/:subCategory conflict, 
            we will define the subcategories explicitly.
            Daerah: bangkalan, sampang, pamekasan, sumenep
            Nasional: politik, pemerintahan, hukum, kriminal, pendidikan, kesehatan, ekonomi
            Lainnya: lifestyle, budaya, wisata, kuliner, hiburan, opini
          */}
          <Route path="daerah/bangkalan" element={<CategoryPage />} />
          <Route path="daerah/sampang" element={<CategoryPage />} />
          <Route path="daerah/pamekasan" element={<CategoryPage />} />
          <Route path="daerah/sumenep" element={<CategoryPage />} />
          
          <Route path="nasional/politik" element={<CategoryPage />} />
          <Route path="nasional/pemerintahan" element={<CategoryPage />} />
          <Route path="nasional/hukum" element={<CategoryPage />} />
          <Route path="nasional/kriminal" element={<CategoryPage />} />
          <Route path="nasional/pendidikan" element={<CategoryPage />} />
          <Route path="nasional/kesehatan" element={<CategoryPage />} />
          <Route path="nasional/ekonomi" element={<CategoryPage />} />
          
          <Route path="lainnya/lifestyle" element={<CategoryPage />} />
          <Route path="lainnya/budaya" element={<CategoryPage />} />
          <Route path="lainnya/wisata" element={<CategoryPage />} />
          <Route path="lainnya/kuliner" element={<CategoryPage />} />
          <Route path="lainnya/hiburan" element={<CategoryPage />} />
          <Route path="lainnya/opini" element={<CategoryPage />} />

          {/* Article Page Route: parentCategory/articleSlug */}
          <Route path=":categorySlug/:slug" element={<ArticlePage />} />

          {/* Top level category */}
          <Route path=":categorySlug" element={<CategoryPage />} />
        </Route>
      </Routes>
    </DialogProvider>
  );
}
