import sys

file_path = 'src/components/AdminCMS.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Sidebar state
orig1 = """  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [isArticlesExpanded, setIsArticlesExpanded] = useState(false);"""
new1 = """  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [isArticlesExpanded, setIsArticlesExpanded] = useState(false);"""
content = content.replace(orig1, new1)

# 2. Pagination state
orig2 = """  // Search queries in tables
  const [articleSearch, setArticleSearch] = useState("");"""
new2 = """  // Search queries in tables
  const [articleSearch, setArticleSearch] = useState("");
  const [articlesPage, setArticlesPage] = useState(1);
  const [articlesPageSize, setArticlesPageSize] = useState(15);
  const [articlesFilterCategory, setArticlesFilterCategory] = useState("all");"""
content = content.replace(orig2, new2)

# 3. Filter logic
orig3 = """  // Filtered Articles for list view
  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(articleSearch.toLowerCase()) || 
    a.category.toLowerCase().includes(articleSearch.toLowerCase())
  );"""
new3 = """  // Computed final articles list for the current active menu
  const currentMenuArticles = activeMenu === "artikel-recycle" ? deletedArticles : articles.filter(art => {
    if (activeMenu === "artikel-draft") return art.status === "draft";
    if (activeMenu === "artikel-review") return art.status === "pending" || art.status === "review";
    if (activeMenu === "artikel-scheduled") return art.status === "scheduled";
    if (activeMenu === "artikel-published") return art.status === "published" || !art.status;
    if (activeMenu === "artikel-breaking") return art.isBreaking;
    if (activeMenu === "artikel-rekomendasi") return art.isEditorChoice;
    if (activeMenu === "artikel-trending") return art.isTrending;
    return true; // "artikel" (All Articles)
  });

  const finalFilteredArticles = currentMenuArticles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(articleSearch.toLowerCase()) || 
                        a.category.toLowerCase().includes(articleSearch.toLowerCase());
    const matchCat = articlesFilterCategory === "all" || a.category === articlesFilterCategory;
    return matchSearch && matchCat;
  });

  const articlesTotalPages = Math.max(1, Math.ceil(finalFilteredArticles.length / articlesPageSize));
  const paginatedArticles = finalFilteredArticles.slice((articlesPage - 1) * articlesPageSize, articlesPage * articlesPageSize);"""
content = content.replace(orig3, new3)


# 4. Article Table Search Bar
orig4 = """                  <div className="flex justify-between items-center mb-6 gap-4">
                    <div className="relative w-80">
                      <input 
                        type="text" 
                        placeholder="Cari berita..."
                        value={articleSearch}
                        onChange={(e) => setArticleSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                      />
                      <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                    </div>
                  </div>"""
new4 = """                  <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4 mb-6">
                    <div className="flex gap-4 items-center w-full md:w-auto">
                      <div className="relative w-full md:w-80">
                        <input 
                          type="text" 
                          placeholder="Cari berita..."
                          value={articleSearch}
                          onChange={(e) => { setArticleSearch(e.target.value); setArticlesPage(1); }}
                          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                        />
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                      </div>
                      <select
                        value={articlesFilterCategory}
                        onChange={(e) => { setArticlesFilterCategory(e.target.value); setArticlesPage(1); }}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] cursor-pointer"
                      >
                        <option value="all">Semua Kategori</option>
                        {cmsCategoryList.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Tampil:</span>
                      <select
                        value={articlesPageSize}
                        onChange={(e) => { setArticlesPageSize(Number(e.target.value)); setArticlesPage(1); }}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] cursor-pointer"
                      >
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>"""
content = content.replace(orig4, new4)

# 5. Article Table Map
orig5 = """                        {(activeMenu === "artikel-recycle" ? deletedArticles : filteredArticles.filter(art => {
                          if (activeMenu === "artikel-draft") return art.status === "draft";
                          if (activeMenu === "artikel-review") return art.status === "pending" || art.status === "review";
                          if (activeMenu === "artikel-scheduled") return art.status === "scheduled";
                          if (activeMenu === "artikel-published") return art.status === "published" || !art.status;
                          if (activeMenu === "artikel-breaking") return art.isBreaking;
                          if (activeMenu === "artikel-rekomendasi") return art.isEditorChoice;
                          if (activeMenu === "artikel-trending") return art.isTrending;
                          return true; // "artikel" (All Articles)
                        })).map(a => ("""
new5 = """                        {paginatedArticles.map(a => ("""
content = content.replace(orig5, new5)

# 6. Pagination Footer
orig6 = """                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCREEN: Kategori */}"""
new6 = """                    </table>
                  </div>
                  {/* Pagination Controls */}
                  {articlesTotalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 border-t border-slate-800 pt-4">
                      <div className="text-xs text-slate-400">
                        Menampilkan {paginatedArticles.length} dari {finalFilteredArticles.length} artikel
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          disabled={articlesPage === 1}
                          onClick={() => setArticlesPage(p => Math.max(1, p - 1))}
                          className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                        >
                          Prev
                        </button>
                        <span className="text-xs text-slate-400 px-3">
                          {articlesPage} / {articlesTotalPages}
                        </span>
                        <button 
                          disabled={articlesPage === articlesTotalPages}
                          onClick={() => setArticlesPage(p => Math.min(articlesTotalPages, p + 1))}
                          className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SCREEN: Kategori */}"""
content = content.replace(orig6, new6)

# 7. Main layout padding responsive
orig7 = """        {/* Core Screen */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">"""
new7 = """        {/* Core Screen */}
        <main className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-8 bg-slate-950 min-w-0">"""
content = content.replace(orig7, new7)

# 8. Sidebar mobile responsive
orig8 = """      {/* Top Banner Control */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logoPutihUrl} alt="Poros Madura" className="h-8 w-auto object-contain" />
          <span className="text-xs bg-[#D71920]/15 text-[#D71920] px-2 py-0.5 rounded font-mono font-bold uppercase">
            CMS Panel
          </span>
        </div>
        <button 
          onClick={onBackToPortal}
          className="bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Portal Publik</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side Navigation Menu */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 p-4 flex flex-col gap-1 select-none overflow-y-auto">"""
new8 = """      {/* Top Banner Control */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-1.5 text-slate-400 hover:text-white cursor-pointer"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <img src={logoPutihUrl} alt="Poros Madura" className="h-6 md:h-8 w-auto object-contain" />
          <span className="hidden sm:inline-block text-xs bg-[#D71920]/15 text-[#D71920] px-2 py-0.5 rounded font-mono font-bold uppercase">
            CMS Panel
          </span>
        </div>
        <button 
          onClick={onBackToPortal}
          className="bg-slate-800 hover:bg-slate-700 text-[10px] md:text-xs font-bold text-slate-300 px-3 md:px-4 py-1.5 md:py-2 rounded-full cursor-pointer flex items-center gap-1.5 md:gap-2 transition-all"
        >
          <ArrowLeft size={14} className="hidden sm:block" />
          <span>Portal Publik</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Side Navigation Menu */}
        <aside className={`w-64 bg-slate-900 border-r border-slate-800 shrink-0 p-4 flex flex-col gap-1 select-none overflow-y-auto transition-transform duration-300 absolute md:relative z-50 h-full ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>"""
content = content.replace(orig8, new8)

# 9. Icons import fix
orig9 = """  Link, Link2Off, Undo2, Redo2, Quote, Minus, Type, RemoveFormatting, MessageCircle, Globe
} from "lucide-react";"""
new9 = """  Link, Link2Off, Undo2, Redo2, Quote, Minus, Type, RemoveFormatting, MessageCircle, Globe, Menu, X
} from "lucide-react";"""
content = content.replace(orig9, new9)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Python patch applied!")
