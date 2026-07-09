import React, { useState, useEffect, useRef, useCallback } from "react";
import { Article, Ad, Comment, WebsiteSettings, VisitorAnalytics, AuditLog } from "../types";
import logoPutihUrl from "@/Logo_Type_trans_Putih.png";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from "recharts";
import { 
  LayoutDashboard, BookOpen, Layers, Image as ImageIcon, MessageSquare, Mail, 
  Settings, Database, Eye, PlusCircle, Trash2, Edit3, ShieldAlert, Sparkles, X, 
  TrendingUp, Users, CheckSquare, Search, ArrowLeft, RefreshCw, AlertCircle, Calendar, Share2, Coins, Megaphone,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link, Link2Off, Undo2, Redo2, Quote, Minus, Type, RemoveFormatting, MessageCircle, Globe
} from "lucide-react";
import AdminAdsManager from "./AdminAdsManager";
import { useDialog } from "../context/DialogContext";

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

interface AdminCMSProps {
  onBackToPortal: () => void;
  lang: "ID" | "EN";
}

export default function AdminCMS({ onBackToPortal, lang }: AdminCMSProps) {
  const { showAlert, showConfirm } = useDialog();
  const [activeMenu, setActiveMenu] = useState<
    | "dashboard"
    | "dashboard-analytics"
    | "dashboard-realtime"
    | "dashboard-traffic"
    | "dashboard-revenue"
    | "dashboard-today"
    | "artikel"
    | "artikel-buat"
    | "artikel-draft"
    | "artikel-review"
    | "artikel-scheduled"
    | "artikel-published"
    | "artikel-breaking"
    | "artikel-trending"
    | "artikel-recycle"
    | "kategori"
    | "kategori-tag"
    | "kategori-topik"
    | "kategori-label"
    | "media-library"
    | "media-upload"
    | "media-video"
    | "media-dokumen"
    | "media-optimasi"
    | "media-ai"
    | "redaksi-penulis"
    | "redaksi-editor"
    | "redaksi-kontributor"
    | "redaksi-approval"
    | "redaksi-penugasan"
    | "redaksi-kalender"
    | "interaksi-polling"
    | "interaksi-voting"
    | "interaksi-feedback"
    | "advertisement"
    | "komentar-moderasi"
    | "komentar-spam"
    | "komentar-blacklist"
    | "komentar-laporan"
    | "user-all"
    | "user-role"
    | "user-permission"
    | "user-logs"
    | "newsletter"
    | "logs"
    | "settings"
    | "settings-info"
    | "settings-logo"
    | "settings-favicon"
    | "settings-tema"
    | "settings-warna"
    | "settings-layout-home"
    | "settings-layout-artikel"
    | "settings-layout-kategori"
    | "settings-footer"
    | "settings-header"
    | "settings-nav"
    | "settings-widget"
    | "settings-backup"
    | "settings-restore"
    | "settings-maintenance"
    | "market"
    | "seo-sitemap"
    | "seo-robots"
    | "seo-redirect"
    | "seo-schema"
    | "seo-meta"
    | "seo-keyword"
    | "seo-broken"
    | "seo-index"
  >("dashboard");

  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [isArticlesExpanded, setIsArticlesExpanded] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [isMediaExpanded, setIsMediaExpanded] = useState(false);
  const [isRedaksiExpanded, setIsRedaksiExpanded] = useState(false);
  const [isInteraksiExpanded, setIsInteraksiExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);
  const [deletedArticles, setDeletedArticles] = useState<Article[]>([]);
  const [sitemapArticles, setSitemapArticles] = useState(true);
  const [sitemapCategories, setSitemapCategories] = useState(true);
  const [sitemapTags, setSitemapTags] = useState(false);
  const [sitemapAuthors, setSitemapAuthors] = useState(false);
  const [sitemapStatus, setSitemapStatus] = useState<any>(null);
  const [sitemapLoading, setSitemapLoading] = useState(false);

  // Rich text editor ref
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCmd = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states for creating/editing articles
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Politik");
  const [subCategory, setSubCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isHeadline, setIsHeadline] = useState(false);
  const [isEditorChoice, setIsEditorChoice] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  // AI Assistance states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");
  const [aiErrorMsg, setAiErrorMsg] = useState("");

  // Ads state
  const [ads, setAds] = useState<Ad[]>([]);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [adForm, setAdForm] = useState({ title: "", imageUrl: "", linkUrl: "", priority: "medium", expiredDate: "", status: "active" });

  // Categories, comments, logs, analytics, settings state
  const [categories, setCategories] = useState<string[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isKomentarExpanded, setIsKomentarExpanded] = useState(false);
  const [blacklistWords, setBlacklistWords] = useState<string[]>(["kasar", "hoax", "fitnah", "judi", "sara", "spam", "scam"]);
  const [newBlacklistWord, setNewBlacklistWord] = useState("");
  const [spamComments, setSpamComments] = useState<Comment[]>([
    { id: "spam-1", articleSlug: "pilkada-sampang-2024", author: "Spammer 99", content: "Dapatkan uang gratis Rp 10 juta tanpa modal dengan klik link ini sekarang!", likes: 0 },
    { id: "spam-2", articleSlug: "festival-sapi-pamekasan", author: "Promo Judi", content: "Situs game online terpercaya deposit pulsa tanpa potongan gampang menang jackpot.", likes: 0 }
  ]);
  const [reportedComments, setReportedComments] = useState<any[]>([
    { id: "rep-1", articleSlug: "investigasi-tki-madura", author: "Herman", content: "Wartawannya disuap ini, beritanya tidak sesuai fakta di lapangan sama sekali!", likes: 2, reporter: "Warga Sampang", reason: "Fitnah / Ujaran Kebencian", date: "2 jam lalu", commentId: "c-1" },
    { id: "rep-2", articleSlug: "opini-mahasiswa", author: "Ali", content: "Semua pendukung calon A itu bodoh dan tidak tahu apa-apa tentang politik.", likes: 12, reporter: "Admin Grup", reason: "SARA & Provokasi", date: "Kemarin", commentId: "c-2" }
  ]);
  const [isUserMgmtExpanded, setIsUserMgmtExpanded] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([
    { id: "u-1", name: "Ahmad Fauzi", email: "fauzi@porosmadura.com", role: "Jurnalis", status: "Aktif", avatar: "AF" },
    { id: "u-2", name: "Rahmat Hidayat", email: "rahmat@porosmadura.com", role: "Administrator", status: "Aktif", avatar: "RH" },
    { id: "u-3", name: "Siti Rahmawati", email: "siti@porosmadura.com", role: "Jurnalis", status: "Aktif", avatar: "SR" },
    { id: "u-4", name: "Dewi Santoso", email: "dewi@porosmadura.com", role: "Editor", status: "Aktif", avatar: "DS" },
    { id: "u-5", name: "Zainal Arifin", email: "zainal@gmail.com", role: "Kontributor", status: "Aktif", avatar: "ZA" },
  ]);
  const [rolesList, setRolesList] = useState<any[]>([
    { name: "Administrator", desc: "Akses penuh ke semua fitur, pengaturan website, iklan, sitemap, dan manajemen pengguna.", count: 1 },
    { name: "Editor", desc: "Dapat meninjau, menyunting, mempublikasikan, menolak, atau menjadwalkan artikel yang dibuat penulis.", count: 1 },
    { name: "Jurnalis", desc: "Dapat membuat, mengedit artikel rancangan sendiri, dan mengirimkannya untuk ditinjau editor.", count: 2 },
    { name: "Kontributor", desc: "Mengirimkan artikel liputan daerah khusus secara eksternal.", count: 1 },
  ]);
  const [permissionsMatrix, setPermissionsMatrix] = useState<any>({
    "Buat Artikel": { "Administrator": true, "Editor": true, "Jurnalis": true, "Kontributor": true },
    "Edit Semua Artikel": { "Administrator": true, "Editor": true, "Jurnalis": false, "Kontributor": false },
    "Hapus Artikel": { "Administrator": true, "Editor": true, "Jurnalis": false, "Kontributor": false },
    "Approve Artikel": { "Administrator": true, "Editor": true, "Jurnalis": false, "Kontributor": false },
    "Kelola User": { "Administrator": true, "Editor": false, "Jurnalis": false, "Kontributor": false },
    "Kelola Iklan": { "Administrator": true, "Editor": false, "Jurnalis": false, "Kontributor": false },
    "Pengaturan Web": { "Administrator": true, "Editor": false, "Jurnalis": false, "Kontributor": false },
  });
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<VisitorAnalytics | null>(null);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  // Search queries in tables
  const [articleSearch, setArticleSearch] = useState("");

  // Live Market Widget CMS states
  const [marketEnabled, setMarketEnabled] = useState(true);
  const [displayIhsg, setDisplayIhsg] = useState(true);
  const [displayUsd, setDisplayUsd] = useState(true);
  const [displayGold, setDisplayGold] = useState(true);
  
  const [ihsgProvider, setIhsgProvider] = useState("yahoo");
  const [usdProvider, setUsdProvider] = useState("yahoo");
  const [goldProvider, setGoldProvider] = useState("logammulia");
  
  const [ihsgInterval, setIhsgInterval] = useState(30);
  const [usdInterval, setUsdInterval] = useState(60);
  const [goldInterval, setGoldInterval] = useState(60);
  
  const [marketLogs, setMarketLogs] = useState<any[]>([]);
  const [marketUpdates, setMarketUpdates] = useState<any>({});
  const [marketSaveSuccess, setMarketSaveSuccess] = useState("");

  // Tags State
  const [tags, setTags] = useState<string[]>([
    "Parlemen", "Madura", "Hukum", "Ekonomi", "Kesehatan", 
    "Pendidikan", "Infrastruktur", "Budaya", "Olahraga", "Teknologi"
  ]);
  const [newTagName, setNewTagName] = useState("");

  // Topics State
  const [topics, setTopics] = useState<any[]>([
    { name: "Pilkada Madura 2024", articles: 34, color: "#D71920", desc: "Peliputan komprehensif Pilkada seluruh kabupaten di Madura" },
    { name: "Jembatan Suramadu", articles: 21, color: "#f59e0b", desc: "Infrastruktur, dampak sosial-ekonomi, dan perkembangan kawasan" },
    { name: "Ekonomi Pesisir", articles: 18, color: "#3b82f6", desc: "Nelayan, tambak, dan sektor maritim kepulauan Madura" },
    { name: "Pendidikan Pesantren", articles: 27, color: "#10b981", desc: "Dinamika lembaga pendidikan Islam di Madura" },
    { name: "Tata Kelola Daerah", articles: 45, color: "#8b5cf6", desc: "Pemerintahan daerah, DPRD, dan kebijakan publik" },
    { name: "Budaya Madura", articles: 15, color: "#ec4899", desc: "Tradisi, seni, bahasa, dan kearifan lokal Madura" },
  ]);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");
  const [newTopicColor, setNewTopicColor] = useState("#D71920");

  // Labels State
  const [labels, setLabels] = useState<any[]>([
    { name: "Eksklusif", color: "#D71920", bg: "#D71920", articles: 12, desc: "Laporan investigatif & konten eksklusif" },
    { name: "Opini", color: "#3b82f6", bg: "#3b82f6", articles: 28, desc: "Artikel opini dan kolom editorial" },
    { name: "Video", color: "#10b981", bg: "#10b981", articles: 9, desc: "Konten dengan embed video utama" },
    { name: "Infografis", color: "#f59e0b", bg: "#f59e0b", articles: 17, desc: "Artikel dengan infografis visual" },
    { name: "Analisis", color: "#8b5cf6", bg: "#8b5cf6", articles: 22, desc: "Konten analisis mendalam" },
    { name: "Polling", color: "#ec4899", bg: "#ec4899", articles: 5, desc: "Artikel dengan widget polling publik" },
    { name: "Sponsored", color: "#64748b", bg: "#64748b", articles: 8, desc: "Konten berbayar/kerjasama" },
  ]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelDesc, setNewLabelDesc] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#D71920");

  // Media Library State
  const [mediaFiles, setMediaFiles] = useState<any[]>([
    { id: "m-1", name: "cover-pilkada.jpg", type: "img", size: "284 KB", bg: "#1e3a5f", url: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400&q=80" },
    { id: "m-2", name: "hero-madura.jpg",   type: "img", size: "512 KB", bg: "#3a1e1e", url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80" },
    { id: "m-3", name: "infografis-apbd.png", type: "img", size: "1.2 MB", bg: "#1e3a2a", url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80" },
    { id: "m-4", name: "foto-sidang.jpg",   type: "img", size: "390 KB", bg: "#3a2e1e", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80" },
    { id: "m-5", name: "thumbnail-tv.jpg",  type: "img", size: "198 KB", bg: "#2a1e3a", url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80" },
    { id: "m-6", name: "laporan-2024.pdf",  type: "pdf", size: "3.4 MB", bg: "#1e2a3a" },
    { id: "m-7", name: "video-rapat.mp4",   type: "vid", size: "48 MB",  bg: "#1e3a1e" },
    { id: "m-8", name: "banner-iklan.jpg",  type: "img", size: "220 KB", bg: "#3a1e2a", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" },
    { id: "m-9", name: "logo-mitra.png",    type: "img", size: "45 KB",  bg: "#2a3a1e", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80" },
    { id: "m-10", name: "panduan.docx",      type: "doc", size: "890 KB", bg: "#1e2a2a" },
  ]);
  const [mediaFilter, setMediaFilter] = useState("Semua");
  const [mediaAlt, setMediaAlt] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [mediaDestFolder, setMediaDestFolder] = useState("/");
  const [compressQuality, setCompressQuality] = useState(80);
  const [targetFormat, setTargetFormat] = useState("WebP");
  const [selectedMediaPreview, setSelectedMediaPreview] = useState<any | null>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<any | null>(null);

  // Video State
  const [videos, setVideos] = useState<any[]>([
    { id: "v-1", title: "Rapat Paripurna DPRD Bangkalan", src: "YouTube", dur: "45:21", views: 1240 },
    { id: "v-2", title: "Peluncuran Program Nelayan Maju", src: "YouTube", dur: "12:07", views: 876 },
    { id: "v-3", title: "Wawancara Eksklusif Bupati", src: "Vimeo",   dur: "28:33", views: 2103 },
    { id: "v-4", title: "Liputan Khusus Festival Sapi Sono", src: "YouTube", dur: "08:14", views: 4521 },
  ]);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  // AI Generator state
  const [aiGenPrompt, setAiGenPrompt] = useState("");
  const [aiGenRatio, setAiGenRatio] = useState("16:9 (Landscape)");
  const [aiGenStyle, setAiGenStyle] = useState("Foto Realistis");
  const [aiGenCredits, setAiGenCredits] = useState(48);
  const [aiGenLoading, setAiGenLoading] = useState(false);
  const [aiGenVariations, setAiGenVariations] = useState(1);

  // Redaksi States (Penulis, Editor, Kontributor)
  const [authors, setAuthors] = useState<any[]>([
    { id: "p-1", name: "Ahmad Fauzi",       avatar: "AF", beat: "Politik",     articles: 124, status: "Aktif",    color: "#3b82f6" },
    { id: "p-2", name: "Siti Rahmawati",    avatar: "SR", beat: "Ekonomi",     articles: 98,  status: "Aktif",    color: "#10b981" },
    { id: "p-3", name: "Moh. Hasan Basri",  avatar: "MH", beat: "Hukum",       articles: 67,  status: "Aktif",    color: "#8b5cf6" },
    { id: "p-4", name: "Nurul Hidayah",     avatar: "NH", beat: "Sosial",      articles: 145, status: "Aktif",    color: "#f59e0b" },
    { id: "p-5", name: "Edy Supriyanto",    avatar: "ES", beat: "Olahraga",    articles: 53,  status: "Aktif",    color: "#ec4899" },
    { id: "p-6", name: "Khoiriyah",         avatar: "KH", beat: "Budaya",      articles: 38,  status: "Cuti",     color: "#64748b" },
    { id: "p-7", name: "Fajar Ramadhan",    avatar: "FR", beat: "Teknologi",   articles: 29,  status: "Magang",   color: "#f97316" },
  ]);
  const [editors, setEditors] = useState<any[]>([
    { id: "e-1", name: "Rahmat Hidayat",  avatar: "RH", role: "Pemimpin Redaksi", desk: "Semua",    approved: 412, pending: 3,  color: "#D71920" },
    { id: "e-2", name: "Dewi Santoso",    avatar: "DS", role: "Redaktur Pelaksana", desk: "Politik",  approved: 287, pending: 7,  color: "#3b82f6" },
    { id: "e-3", name: "Bambang Eko",     avatar: "BE", role: "Redaktur Senior",   desk: "Ekonomi",  approved: 198, pending: 2,  color: "#10b981" },
    { id: "e-4", name: "Lailatul Fitri",  avatar: "LF", role: "Redaktur",          desk: "Hukum",    approved: 156, pending: 5,  color: "#f59e0b" },
  ]);
  const [contributors, setContributors] = useState<any[]>([
    { id: "k-1", name: "Zainal Arifin",    region: "Bangkalan",  articles: 14, rate: "Rp 75.000/artikel" },
    { id: "k-2", name: "Halimatus Sa'diyah",region: "Sampang",    articles: 9,  rate: "Rp 75.000/artikel" },
    { id: "k-3", name: "Miftahul Huda",     region: "Pamekasan",  articles: 22, rate: "Rp 100.000/artikel" },
    { id: "k-4", name: "Samsul Arifin",     region: "Sumenep",    articles: 18, rate: "Rp 75.000/artikel" },
    { id: "k-5", name: "Rina Fitriani",     region: "Surabaya",   articles: 7,  rate: "Rp 50.000/artikel" },
  ]);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorBeat, setNewAuthorBeat] = useState("Politik");
  const [newContributorName, setNewContributorName] = useState("");
  const [newContributorEmail, setNewContributorEmail] = useState("");
  const [newContributorRegion, setNewContributorRegion] = useState("Bangkalan");
  const [newContributorRate, setNewContributorRate] = useState("Rp 75.000/artikel");

  // Penugasan State
  const [assignments, setAssignments] = useState<any[]>([
    { id: "a-1", title: "Sidang Paripurna DPRD Bangkalan",       journalist: "Ahmad Fauzi", deadline: "Hari ini 17.00", priority: "high", location: "Bangkalan" },
    { id: "a-2", title: "Liputan Festival Sapi Sono Pamekasan",   journalist: "Nurul Hidayah", deadline: "Besok 09.00", priority: "medium", location: "Pamekasan" },
    { id: "a-3", title: "Wawancara Kepala Dinas Kelautan Sumenep", journalist: "Siti Rahmawati", deadline: "3 hari lagi", priority: "normal", location: "Sumenep" },
    { id: "a-4", title: "Investigasi Pungli TKI Madura",          journalist: "Moh. Hasan Basri", deadline: "Minggu depan", priority: "high", location: "Sampang" },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskJournalist, setNewTaskJournalist] = useState("Ahmad Fauzi");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("normal");
  const [newTaskBrief, setNewTaskBrief] = useState("");
  const [newTaskLocation, setNewTaskLocation] = useState("Bangkalan");

  // Polling State
  const [polls, setPolls] = useState<any[]>([
    { option: "Perbaikan Jalan & Jembatan Kabupaten", votes: 1240, pct: 45 },
    { option: "Pengembangan Pelabuhan & Transportasi Laut", votes: 689, pct: 25 },
    { option: "Penyediaan Air Bersih & Saluran Irigasi", votes: 551, pct: 20 },
    { option: "Pembangunan Fasilitas Olahraga & Ruang Publik", votes: 275, pct: 10 },
  ]);
  const [newPollQuestion, setNewPollQuestion] = useState("");
  const [newPollOptionA, setNewPollOptionA] = useState("");
  const [newPollOptionB, setNewPollOptionB] = useState("");

  // Voting State
  const [nominees, setNominees] = useState<any[]>([
    { rank: 1, name: "Dr. Achmad Zaini, M.Si", role: "Akademisi/Pegiat Sosial", votes: 6237, pct: 42, color: "#D71920" },
    { rank: 2, name: "Lailatul Fitria", role: "Founder Madura Berdaya", votes: 4455, pct: 30, color: "#3b82f6" },
    { rank: 3, name: "Samsul Arifin", role: "Pemberdaya Nelayan Sumenep", votes: 2970, pct: 20, color: "#10b981" },
    { rank: 4, name: "R. Bagus Hendra", role: "Seniman Ukir Pamekasan", votes: 1188, pct: 8, color: "#f59e0b" },
  ]);

  // Feedbacks State
  const [feedbacks, setFeedbacks] = useState<any[]>([
    { id: "f-1", name: "Hendra Wijaya", email: "hendra@gmail.com", cat: "Laporan Bug", text: "Widget live market logam mulia kadang tidak update di pagi hari.", date: "1 jam lalu", status: "unread" },
    { id: "f-2", name: "Siti Aisyah",   email: "siti@yahoo.com",   cat: "Saran",       text: "Mohon diperbanyak rubrik opini untuk mahasiswa Madura.",  date: "3 jam lalu", status: "unread" },
    { id: "f-3", name: "Fathur Rosi",   email: "fathur@outlook.com", cat: "Kritik",      text: "Iklan pop-up melayang di mobile agak menutupi tombol cari.", date: "Kemarin",    status: "read" },
    { id: "f-4", name: "Ahmad Jalal",   email: "jalal@gmail.com",   cat: "Lainnya",     text: "Ingin mengajukan kerjasama media partner untuk pameran seni.", date: "2 hari lalu", status: "read" },
  ]);
  const [feedbackFilter, setFeedbackFilter] = useState("Semua");

  const loadMarketSettings = async () => {
    try {
      const [resSettings, resLogs, resUpdates] = await Promise.all([
        fetch("/api/market/settings"),
        fetch("/api/market/logs"),
        fetch("/api/market/live")
      ]);

      if (resSettings.ok) {
        const settingsData = await resSettings.json();
        setMarketEnabled(settingsData.enabled ?? true);
        setDisplayIhsg(settingsData.displayMarkets?.includes("ihsg") ?? true);
        setDisplayUsd(settingsData.displayMarkets?.includes("usd") ?? true);
        setDisplayGold(settingsData.displayMarkets?.includes("gold") ?? true);
        setIhsgProvider(settingsData.providers?.ihsg || "yahoo");
        setUsdProvider(settingsData.providers?.usd || "yahoo");
        setGoldProvider(settingsData.providers?.gold || "logammulia");
        setIhsgInterval(settingsData.ihsgInterval || 30);
        setUsdInterval(settingsData.usdInterval || 60);
        setGoldInterval(settingsData.goldInterval || 60);
      }

      if (resLogs.ok) {
        setMarketLogs(await resLogs.json());
      }

      if (resUpdates.ok) {
        setMarketUpdates(await resUpdates.json());
      }
    } catch (err) {
      console.error("Failed to load CMS market settings:", err);
    }
  };

  const handleSaveMarketSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const displayMarkets = [];
    if (displayIhsg) displayMarkets.push("ihsg");
    if (displayUsd) displayMarkets.push("usd");
    if (displayGold) displayMarkets.push("gold");

    const payload = {
      enabled: marketEnabled,
      displayMarkets,
      providers: {
        ihsg: ihsgProvider,
        usd: usdProvider,
        gold: goldProvider
      },
      ihsgInterval: Number(ihsgInterval),
      usdInterval: Number(usdInterval),
      goldInterval: Number(goldInterval)
    };

    try {
      const res = await fetch("/api/market/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMarketSaveSuccess("Konfigurasi Market Widget berhasil disimpan dan diaktifkan!");
        setTimeout(() => setMarketSaveSuccess(""), 4000);
        loadMarketSettings();
      }
    } catch (err) {
      console.error("Failed to save market settings:", err);
    }
  };

  const handleRegenerateSitemap = async () => {
    setSitemapLoading(true);
    try {
      const res = await fetch("/api/sitemap/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          includeArticles: sitemapArticles,
          includeCategories: sitemapCategories,
          includeTags: sitemapTags,
          includeAuthors: sitemapAuthors
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSitemapStatus(data.status);
          showAlert("Sitemap XML berhasil diperbarui secara instan!", "Sukses", "success");
          const resLogs = await fetch("/api/logs");
          if (resLogs.ok) setLogs(await resLogs.json());
        } else {
          showAlert("Gagal memperbarui sitemap: " + (data.error || "Unknown error"), "Error", "error");
        }
      } else {
        showAlert("Gagal menghubungi server untuk memperbarui sitemap", "Error", "error");
      }
    } catch (err: any) {
      showAlert("Terjadi kesalahan: " + err.message, "Error", "error");
    } finally {
      setSitemapLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      loadMarketSettings();
      const [resArticles, resAds, resCategories, resLogs, resAnalytics, resSettings, resSubscribers, resSitemap] = await Promise.all([
        fetch("/api/articles?status=all"),
        fetch("/api/ads"),
        fetch("/api/categories"),
        fetch("/api/logs"),
        fetch("/api/analytics/summary"),
        fetch("/api/settings"),
        fetch("/api/newsletter/subscribers"),
        fetch("/api/sitemap/status")
      ]);

      if (resArticles.ok) setArticles(await resArticles.json());
      if (resAds.ok) setAds(await resAds.json());
      if (resCategories.ok) setCategories(await resCategories.json());
      if (resLogs.ok) setLogs(await resLogs.json());
      if (resAnalytics.ok) setAnalytics(await resAnalytics.json());
      if (resSettings.ok) setSettings(await resSettings.json());
      if (resSubscribers.ok) setSubscribers(await resSubscribers.json());
      if (resSitemap.ok) {
        const sStatus = await resSitemap.json();
        setSitemapStatus(sStatus);
        if (sStatus.options) {
          setSitemapArticles(sStatus.options.includeArticles !== false);
          setSitemapCategories(sStatus.options.includeCategories !== false);
          setSitemapTags(sStatus.options.includeTags === true);
          setSitemapAuthors(sStatus.options.includeAuthors === true);
        }
      }

      // Fetch all comments for list
      const allComments: Comment[] = [];
      const tempArticles: Article[] = resArticles.ok ? await resArticles.clone().json() : [];
      for (const a of tempArticles) {
        const resComments = await fetch(`/api/comments/${a.slug}`);
        if (resComments.ok) {
          const coms: Comment[] = await resComments.json();
          allComments.push(...coms);
        }
      }
      setComments(allComments);

    } catch (e) {
      console.error("Failed to load CMS data", e);
    }
  };

  // AI Gemini Integration for SEO, Summary & Tag recommendations
  const handleAiAssist = async () => {
    if (!title || !content) {
      setAiErrorMsg("Silakan tulis Judul dan Konten Artikel terlebih dahulu untuk dianalisis oleh AI.");
      setTimeout(() => setAiErrorMsg(""), 5000);
      return;
    }

    setAiLoading(true);
    setAiSuccessMsg("");
    setAiErrorMsg("");

    try {
      const res = await fetch("/api/ai/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const aiData = data.data;
        // Populate inputs with Gemini suggestions!
        setTagsInput(aiData.tags.join(", "));
        setContent(prev => `[AI Summary: ${aiData.summary}]\n\n` + prev);
        setTitle(aiData.headlineSuggestion || title);
        
        setAiSuccessMsg("Gemini Sukses! Judul dioptimalkan, Ringkasan disisipkan di atas artikel, dan Kata Kunci SEO otomatis terisi.");
        setTimeout(() => setAiSuccessMsg(""), 7000);
      } else {
        setAiErrorMsg(data.error || "Gagal menghubungi AI Gemini.");
      }
    } catch (err: any) {
      setAiErrorMsg("Koneksi gagal: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Create article save
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const bodyPayload = {
      title, content, category, subCategory, image: imageUrl, tags,
      isBreaking, isHeadline, isEditorChoice, isTrending, videoUrl, audioUrl,
      status: "published"
    };

    try {
      let res;
      if (editingArticle) {
        res = await fetch(`/api/articles/${editingArticle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload)
        });
      } else {
        res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload)
        });
      }

      if (res.ok) {
        resetArticleForm();
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetArticleForm = () => {
    setEditingArticle(null);
    setIsCreating(false);
    setTitle("");
    setContent("");
    setCategory("Politik");
    setSubCategory("");
    setImageUrl("");
    setTagsInput("");
    setIsBreaking(false);
    setIsHeadline(false);
    setIsEditorChoice(false);
    setIsTrending(false);
    setVideoUrl("");
    setAudioUrl("");
    // Clear rich text editor
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticle(art);
    setIsCreating(true);
    setActiveMenu("artikel-buat");
    setTitle(art.title);
    setContent(art.content);
    setCategory(art.category);
    setSubCategory(art.subCategory || "");
    setImageUrl(art.image);
    setTagsInput(art.tags.join(", "));
    setIsBreaking(art.isBreaking);
    setIsHeadline(art.isHeadline);
    setIsEditorChoice(art.isEditorChoice);
    setIsTrending(art.isTrending);
    setVideoUrl(art.videoUrl || "");
    setAudioUrl(art.audioUrl || "");
    // Populate rich text editor after render
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = art.content || "";
      }
    }, 50);
  };

  const handleDeleteArticleSimulated = (art: Article) => {
    showConfirm("Apakah Anda yakin ingin memindahkan artikel ini ke Recycle Bin?", () => {
      setDeletedArticles(prev => [art, ...prev]);
      setArticles(prev => prev.filter(a => a.id !== art.id));
    });
  };

  const handleRestoreArticleSimulated = (art: Article) => {
    setArticles(prev => [art, ...prev]);
    setDeletedArticles(prev => prev.filter(a => a.id !== art.id));
  };

  const handleDeleteArticlePermanently = async (id: string) => {
    showConfirm("Apakah Anda yakin ingin menghapus artikel ini secara permanen dari database server? Tindakan ini tidak dapat dibatalkan.", async () => {
      try {
        const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
        if (res.ok) {
          setDeletedArticles(prev => prev.filter(a => a.id !== id));
        }
      } catch (e) {
        console.error(e);
      }
    });
  };

  // Ads Save
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    try {
      const res = await fetch(`/api/ads/${editingAd.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adForm)
      });
      if (res.ok) {
        setEditingAd(null);
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      if (res.ok) {
        setNewCatName("");
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    showConfirm(`Apakah Anda yakin ingin menghapus kategori "${name}"? Semua artikel di kategori ini akan kehilangan asosiasi kategorinya.`, async () => {
      try {
        const res = await fetch(`/api/categories/${encodeURIComponent(name)}`, {
          method: "DELETE"
        });
        if (res.ok) {
          loadAllData();
          showAlert(`Kategori "${name}" berhasil dihapus.`, "Sukses", "success");
        }
      } catch (e) {
        console.error(e);
        showAlert("Gagal menghapus kategori.", "Error", "error");
      }
    });
  };

  // Tag CRUD Handlers
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    if (!tags.includes(newTagName.trim())) {
      setTags(prev => [...prev, newTagName.trim()]);
    }
    setNewTagName("");
  };

  const handleDeleteTag = (tagName: string) => {
    showConfirm(`Apakah Anda yakin ingin menghapus tag "#${tagName}"?`, () => {
      setTags(prev => prev.filter(t => t !== tagName));
      showAlert(`Tag "#${tagName}" berhasil dihapus.`, "Sukses", "success");
    });
  };

  // Topic CRUD Handlers
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    const newTopic = {
      name: newTopicName.trim(),
      articles: 0,
      color: newTopicColor,
      desc: newTopicDesc || "Deskripsi topik baru"
    };
    setTopics(prev => [...prev, newTopic]);
    setNewTopicName("");
    setNewTopicDesc("");
    setNewTopicColor("#D71920");
  };

  const handleDeleteTopic = (topicName: string) => {
    showConfirm(`Apakah Anda yakin ingin menghapus topik "${topicName}"?`, () => {
      setTopics(prev => prev.filter(t => t.name !== topicName));
      showAlert(`Topik "${topicName}" berhasil dihapus.`, "Sukses", "success");
    });
  };

  // Label CRUD Handlers
  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    const newLabel = {
      name: newLabelName.trim(),
      color: newLabelColor,
      bg: newLabelColor,
      articles: 0,
      desc: newLabelDesc || "Deskripsi label baru"
    };
    setLabels(prev => [...prev, newLabel]);
    setNewLabelName("");
    setNewLabelDesc("");
    setNewLabelColor("#D71920");
  };

  const handleDeleteLabel = (labelName: string) => {
    showConfirm(`Apakah Anda yakin ingin menghapus label "${labelName}"?`, () => {
      setLabels(prev => prev.filter(l => l.name !== labelName));
      showAlert(`Label "${labelName}" berhasil dihapus.`, "Sukses", "success");
    });
  };

  // Media CRUD Handlers
  const handleAddMediaMock = (name: string, type: "img" | "pdf" | "vid" | "doc", size: string, url?: string) => {
    const newMedia = {
      id: "m-" + Date.now(),
      name,
      type,
      size,
      bg: type === "img" ? "#1e3a5f" : type === "vid" ? "#1e3a1e" : "#1e2a2a",
      url
    };
    setMediaFiles(prev => [newMedia, ...prev]);
  };

  const handleSelectFileForUpload = (file: File) => {
    const name = file.name;
    const sizeBytes = file.size;
    const sizeStr = sizeBytes > 1024 * 1024 
      ? (sizeBytes / (1024 * 1024)).toFixed(1) + " MB" 
      : (sizeBytes / 1024).toFixed(0) + " KB";
    
    const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name);
    const isVid = /\.(mp4|webm|mov)$/i.test(name);
    const isPdf = /\.pdf$/i.test(name);
    const type = isImg ? "img" : isVid ? "vid" : isPdf ? "pdf" : "doc";
    
    const url = isImg ? URL.createObjectURL(file) : undefined;
    setPendingUploadFile({
      name,
      type,
      size: sizeStr,
      url
    });
  };

  const handleConfirmUpload = () => {
    if (!pendingUploadFile) return;
    const { name, type, size, url } = pendingUploadFile;
    handleAddMediaMock(name, type, size, url);
    showAlert(`File "${name}" berhasil diupload ke Media Library!`, "Sukses", "success");
    setPendingUploadFile(null);
    setActiveMenu("media-library");
  };

  const handleCancelUpload = () => {
    setPendingUploadFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleSelectFileForUpload(files[0]);
      e.target.value = "";
    }
  };

  const handleDeleteMedia = (id: string) => {
    const file = mediaFiles.find(m => m.id === id);
    const filename = file ? file.name : "file";
    showConfirm(`Apakah Anda yakin ingin menghapus media "${filename}" secara permanen?`, () => {
      setMediaFiles(prev => prev.filter(m => m.id !== id));
      showAlert(`Media "${filename}" berhasil dihapus.`, "Sukses", "success");
    });
  };

  // Video CRUD Handlers
  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;
    const newVid = {
      id: "v-" + Date.now(),
      title: newVideoTitle.trim(),
      src: newVideoUrl.includes("vimeo") ? "Vimeo" : "YouTube",
      dur: "05:00",
      views: 0
    };
    setVideos(prev => [newVid, ...prev]);
    setNewVideoTitle("");
    setNewVideoUrl("");
  };

  const handleDeleteVideo = (id: string) => {
    const video = videos.find(v => v.id === id);
    const title = video ? video.title : "video";
    showConfirm(`Apakah Anda yakin ingin menghapus video "${title}"?`, () => {
      setVideos(prev => prev.filter(v => v.id !== id));
      showAlert(`Video "${title}" berhasil dihapus.`, "Sukses", "success");
    });
  };

  // AI Image Generation Handler
  const handleGenerateAiImage = async () => {
    if (!aiGenPrompt.trim()) return;
    setAiGenLoading(true);
    // Simulate generation loading for 1.8s
    await new Promise(resolve => setTimeout(resolve, 1800));
    const randomKeywords = aiGenPrompt.trim().split(" ").slice(0, 2).join(",");
    const mockFileName = `ai-${randomKeywords.toLowerCase().replace(/[^a-z0-9]/g, "-") || "image"}-${Date.now().toString().slice(-4)}.jpg`;
    const unsplashUrl = `https://images.unsplash.com/featured/400x400/?${encodeURIComponent(randomKeywords)}`;
    handleAddMediaMock(mockFileName, "img", "420 KB", unsplashUrl);
    setAiGenCredits(prev => Math.max(0, prev - 1));
    setAiGenLoading(false);
    setAiGenPrompt("");
    showAlert(`Sukses meng-generate gambar AI! File "${mockFileName}" telah berhasil disimpan ke Media Library.`, "Sukses", "success");
  };

  // Redaksi CRUD Handlers
  const handleAddAuthor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim()) return;
    const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#f97316"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const initials = newAuthorName.trim().split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const newAuth = {
      id: "p-" + Date.now(),
      name: newAuthorName.trim(),
      avatar: initials,
      beat: newAuthorBeat,
      articles: 0,
      status: "Aktif",
      color: randomColor
    };
    setAuthors(prev => [...prev, newAuth]);
    setNewAuthorName("");
  };

  const handleDeleteAuthor = (id: string) => {
    const author = authors.find(a => a.id === id);
    const name = author ? author.name : "penulis";
    showConfirm(`Apakah Anda yakin ingin menghapus penulis "${name}"?`, () => {
      setAuthors(prev => prev.filter(a => a.id !== id));
      showAlert(`Penulis "${name}" berhasil dihapus.`, "Sukses", "success");
    });
  };

  const handleAddContributor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContributorName.trim()) return;
    const newCont = {
      id: "k-" + Date.now(),
      name: newContributorName.trim(),
      region: newContributorRegion,
      articles: 0,
      rate: newContributorRate
    };
    setContributors(prev => [...prev, newCont]);
    setNewContributorName("");
    setNewContributorEmail("");
    setNewContributorRate("Rp 75.000/artikel");
  };

  const handleDeleteContributor = (id: string) => {
    const contributor = contributors.find(k => k.id === id);
    const name = contributor ? contributor.name : "kontributor";
    showConfirm(`Apakah Anda yakin ingin menghapus kontributor "${name}"?`, () => {
      setContributors(prev => prev.filter(k => k.id !== id));
      showAlert(`Kontributor "${name}" berhasil dihapus.`, "Sukses", "success");
    });
  };

  // Penugasan CRUD Handlers
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newAssign = {
      id: "a-" + Date.now(),
      title: newTaskTitle.trim(),
      journalist: newTaskJournalist,
      deadline: newTaskDeadline || "Segera",
      priority: newTaskPriority,
      location: newTaskLocation,
      brief: newTaskBrief
    };
    setAssignments(prev => [newAssign, ...prev]);
    setNewTaskTitle("");
    setNewTaskDeadline("");
    setNewTaskBrief("");
  };

  const handleDeleteAssignment = (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    const title = assignment ? assignment.title : "tugas";
    showConfirm(`Apakah Anda yakin ingin menghapus penugasan liputan "${title}"?`, () => {
      setAssignments(prev => prev.filter(a => a.id !== id));
      showAlert(`Penugasan "${title}" berhasil dihapus.`, "Sukses", "success");
    });
  };

  // Polling CRUD Handlers
  const handleAddPollOption = () => {
    const question = prompt("Masukkan opsi polling baru:");
    if (question && question.trim()) {
      setPolls(prev => [...prev, { option: question.trim(), votes: 0, pct: 0 }]);
    }
  };

  const handleAddPoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollQuestion.trim()) return;
    // Set first options
    const newOptions = [];
    if (newPollOptionA.trim()) newOptions.push({ option: newPollOptionA.trim(), votes: 0, pct: 0 });
    if (newPollOptionB.trim()) newOptions.push({ option: newPollOptionB.trim(), votes: 0, pct: 0 });
    if (newOptions.length > 0) {
      setPolls(newOptions);
      showAlert(`Polling baru "${newPollQuestion}" berhasil diterbitkan!`, "Sukses", "success");
    }
    setNewPollQuestion("");
    setNewPollOptionA("");
    setNewPollOptionB("");
  };

  // Feedback Actions
  const handleMarkFeedbackRead = (id: string) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: "read" } : f));
  };

  const handleDeleteFeedback = (id: string) => {
    showConfirm("Apakah Anda yakin ingin menghapus umpan balik ini?", () => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      showAlert("Umpan balik berhasil dihapus.", "Sukses", "success");
    });
  };

  const handleDeleteComment = async (commentId: string, articleSlug: string) => {
    showConfirm("Apakah Anda yakin ingin menghapus komentar ini secara permanen?", async () => {
      try {
        const res = await fetch(`/api/comments/${articleSlug}/${commentId}`, { method: "DELETE" });
        if (res.ok) {
          setComments(prev => prev.filter(c => c.id !== commentId));
          showAlert("Komentar berhasil dihapus.", "Sukses", "success");
        } else {
          setComments(prev => prev.filter(c => c.id !== commentId));
          showAlert("Komentar berhasil dihapus (Simulasi Cache).", "Sukses", "success");
        }
      } catch (e) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        showAlert("Komentar berhasil dihapus (Simulasi Cache).", "Sukses", "success");
      }
    });
  };

  // Spam Handlers
  const handleRestoreSpam = (spamId: string) => {
    const item = spamComments.find(s => s.id === spamId);
    if (!item) return;
    setSpamComments(prev => prev.filter(s => s.id !== spamId));
    setComments(prev => [...prev, item]);
    showAlert("Komentar spam berhasil dipulihkan ke daftar aktif.", "Sukses", "success");
  };

  const handleDeleteSpamPermanently = (spamId: string) => {
    showConfirm("Apakah Anda yakin ingin menghapus komentar spam ini selamanya?", () => {
      setSpamComments(prev => prev.filter(s => s.id !== spamId));
      showAlert("Komentar spam berhasil dihapus selamanya.", "Sukses", "success");
    });
  };

  // Blacklist Handlers
  const handleAddBlacklistWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newBlacklistWord.trim().toLowerCase();
    if (!word) return;
    if (blacklistWords.includes(word)) {
      showAlert("Kata tersebut sudah terdaftar di blacklist.", "Perhatian", "error");
      return;
    }
    setBlacklistWords(prev => [...prev, word]);
    setNewBlacklistWord("");
    showAlert(`Kata "${word}" berhasil ditambahkan ke blacklist.`, "Sukses", "success");
  };

  const handleRemoveBlacklistWord = (word: string) => {
    setBlacklistWords(prev => prev.filter(w => w !== word));
  };

  // Report Handlers
  const handleDismissReport = (reportId: string) => {
    setReportedComments(prev => prev.filter(r => r.id !== reportId));
    showAlert("Aduan laporan pengguna diabaikan.", "Sukses", "success");
  };

  const handleDeleteReportedComment = (reportId: string, commentId: string) => {
    showConfirm("Apakah Anda yakin ingin menghapus komentar terlapor ini?", () => {
      setReportedComments(prev => prev.filter(r => r.id !== reportId));
      setComments(prev => prev.filter(c => c.id !== commentId));
      showAlert("Komentar yang dilaporkan berhasil dihapus dari portal.", "Sukses", "success");
    });
  };

  // User Management Handlers
  const handleAddUser = () => {
    const name = prompt("Masukkan nama lengkap user:");
    if (!name) return;
    const email = prompt("Masukkan alamat email:");
    if (!email) return;
    const role = prompt("Masukkan peran (Administrator / Editor / Jurnalis / Kontributor):", "Jurnalis");
    if (!role) return;
    
    if (!["Administrator", "Editor", "Jurnalis", "Kontributor"].includes(role)) {
      showAlert("Peran tidak valid. Gunakan Administrator, Editor, Jurnalis, atau Kontributor.", "Error", "error");
      return;
    }
    
    const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      role,
      status: "Aktif",
      avatar: initials
    };
    
    setUsersList(prev => [...prev, newUser]);
    setRolesList(prev => prev.map(r => r.name === role ? { ...r, count: r.count + 1 } : r));
    showAlert(`User "${name}" berhasil didaftarkan.`, "Sukses", "success");
  };

  const handleDeleteUser = (userId: string) => {
    const user = usersList.find(u => u.id === userId);
    if (!user) return;
    showConfirm(`Apakah Anda yakin ingin menghapus user "${user.name}"?`, () => {
      setUsersList(prev => prev.filter(u => u.id !== userId));
      setRolesList(prev => prev.map(r => r.name === user.role ? { ...r, count: Math.max(0, r.count - 1) } : r));
      showAlert(`User "${user.name}" berhasil dihapus.`, "Sukses", "success");
    });
  };

  const handleTogglePermission = (permissionKey: string, roleName: string) => {
    setPermissionsMatrix(prev => {
      const currentRolePermissions = prev[permissionKey] || {};
      const updatedRolePermissions = {
        ...currentRolePermissions,
        [roleName]: !currentRolePermissions[roleName]
      };
      return {
        ...prev,
        [permissionKey]: updatedRolePermissions
      };
    });
  };

  // Article Editor review decisions
  const handleArticleDecision = async (articleId: string, decision: "published" | "review" | "draft") => {
    const art = articles.find(a => a.id === articleId);
    if (!art) return;
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...art, status: decision })
      });
      if (res.ok) {
        showAlert(`Artikel berhasil diupdate statusnya menjadi: ${decision.toUpperCase()}`, "Sukses", "success");
        loadAllData();
      }
    } catch (e) {
      console.error("Failed to update article status:", e);
    }
  };

  // JSON colors for charts cells
  const COLORS = ["#0D2B5C", "#1E40AF", "#D71920", "#34D399", "#F87171"];

  // Filtered Articles for list view
  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(articleSearch.toLowerCase()) || 
    a.category.toLowerCase().includes(articleSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
      />
      
      {/* Top Banner Control */}
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
        <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 p-4 flex flex-col gap-1 select-none overflow-y-auto">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-3 block mb-2 font-mono">MANAGEMENT MENUS</span>
          
          {/* Accordion Dashboard Header */}
          <div className="mb-2">
            <button
              onClick={() => setIsDashboardExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard size={16} />
                <span>DASHBOARD</span>
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDashboardExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isDashboardExpanded && (
              <div className="pl-1 mt-1 flex flex-col gap-0.5 border-l border-slate-800 ml-3">
                <button
                  onClick={() => setActiveMenu("dashboard")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "dashboard"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Dashboard
                </button>
                <button
                  onClick={() => setActiveMenu("dashboard-analytics")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "dashboard-analytics"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Analytics
                </button>
                <button
                  onClick={() => setActiveMenu("dashboard-realtime")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "dashboard-realtime"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Real Time Visitor
                </button>
                <button
                  onClick={() => setActiveMenu("dashboard-traffic")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "dashboard-traffic"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Traffic Sources
                </button>
                <button
                  onClick={() => setActiveMenu("dashboard-revenue")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "dashboard-revenue"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Pendapatan Iklan
                </button>
                <button
                  onClick={() => setActiveMenu("dashboard-today")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "dashboard-today"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  └── Ringkasan Hari Ini
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 my-2" />

          {/* Accordion Manajemen Berita Header */}
          <div className="mb-2">
            <button
              onClick={() => setIsArticlesExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <BookOpen size={16} />
                <span>MANAJEMEN BERITA</span>
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isArticlesExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isArticlesExpanded && (
              <div className="pl-1 mt-1 flex flex-col gap-0.5 border-l border-slate-800 ml-3">
                <button
                  onClick={() => {
                    resetArticleForm();
                    setActiveMenu("artikel");
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "artikel"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Semua Artikel
                </button>
                <button
                  onClick={() => {
                    resetArticleForm();
                    setIsCreating(true);
                    setActiveMenu("artikel-buat");
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "artikel-buat"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Buat Artikel
                </button>
                <button
                  onClick={() => setActiveMenu("artikel-draft")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "artikel-draft"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Draft
                </button>
                <button
                  onClick={() => setActiveMenu("artikel-review")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "artikel-review"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Menunggu Review
                </button>
                <button
                  onClick={() => setActiveMenu("artikel-scheduled")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "artikel-scheduled"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Dijadwalkan
                </button>
                <button
                  onClick={() => setActiveMenu("artikel-published")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "artikel-published"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Dipublikasikan
                </button>
                <button
                  onClick={() => setActiveMenu("artikel-breaking")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "artikel-breaking"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Breaking News
                </button>
                <button
                  onClick={() => setActiveMenu("artikel-rekomendasi")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "artikel-rekomendasi"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Rekomendasi
                </button>
                <button
                  onClick={() => setActiveMenu("artikel-trending")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "artikel-trending"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Berita Trending
                </button>
                <button
                  onClick={() => setActiveMenu("artikel-recycle")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "artikel-recycle"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  └── Recycle Bin
                </button>
              </div>
            )}
          </div>

          {/* Accordion Kategori */}
          <div className="mb-2">
            <button
              onClick={() => setIsCategoryExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <Layers size={16} />
                <span>KATEGORI</span>
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isCategoryExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isCategoryExpanded && (
              <div className="mt-1 ml-3 pl-3 border-l border-slate-800 flex flex-col gap-0.5">
                <button
                  onClick={() => setActiveMenu("kategori")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "kategori"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Kategori
                </button>
                <button
                  onClick={() => setActiveMenu("kategori-tag")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "kategori-tag"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Tag
                </button>
                <button
                  onClick={() => setActiveMenu("kategori-topik")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "kategori-topik"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  ├── Topik
                </button>
                <button
                  onClick={() => setActiveMenu("kategori-label")}
                  className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                    activeMenu === "kategori-label"
                      ? "bg-[#D71920] text-white font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  └── Label Khusus
                </button>
              </div>
            )}
          </div>

          {/* Accordion Media */}
          <div className="mb-2">
            <button
              onClick={() => setIsMediaExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <ImageIcon size={16} />
                <span>MEDIA</span>
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isMediaExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isMediaExpanded && (
              <div className="mt-1 ml-3 pl-3 border-l border-slate-800 flex flex-col gap-0.5">
                {([
                  ["media-library",   "├── Media Library"],
                  ["media-upload",    "├── Upload Gambar"],
                  ["media-video",     "├── Video"],
                  ["media-dokumen",   "├── Dokumen"],
                  ["media-optimasi",  "├── Optimasi Gambar"],
                  ["media-ai",        "└── AI Image Generator"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMenu(key)}
                    className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                      activeMenu === key
                        ? "bg-[#D71920] text-white font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accordion Redaksi */}
          <div className="mb-2">
            <button
              onClick={() => setIsRedaksiExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <Users size={16} />
                <span>REDAKSI</span>
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isRedaksiExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isRedaksiExpanded && (
              <div className="mt-1 ml-3 pl-3 border-l border-slate-800 flex flex-col gap-0.5">
                {([
                  ["redaksi-penulis",    "├── Penulis"],
                  ["redaksi-editor",     "├── Editor"],
                  ["redaksi-kontributor","├── Kontributor"],
                  ["redaksi-approval",   "├── Approval Artikel"],
                  ["redaksi-penugasan",  "├── Penugasan Liputan"],
                  ["redaksi-kalender",   "└── Kalender Editorial"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMenu(key)}
                    className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                      activeMenu === key
                        ? "bg-[#D71920] text-white font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accordion Interaksi */}
          <div className="mb-2">
            <button
              onClick={() => setIsInteraksiExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <MessageCircle size={16} />
                <span>INTERAKSI</span>
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isInteraksiExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isInteraksiExpanded && (
              <div className="mt-1 ml-3 pl-3 border-l border-slate-800 flex flex-col gap-0.5">
                {([
                  ["interaksi-polling",   "├── Polling"],
                  ["interaksi-voting",    "├── Voting"],
                  ["interaksi-feedback",  "└── Feedback Pembaca"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMenu(key)}
                    className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                      activeMenu === key
                        ? "bg-[#D71920] text-white font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accordion Komentar */}
          <div className="mb-2">
            <button
              onClick={() => setIsKomentarExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <MessageSquare size={16} />
                <span>KOMENTAR</span>
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isKomentarExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isKomentarExpanded && (
              <div className="mt-1 ml-3 pl-3 border-l border-slate-800 flex flex-col gap-0.5">
                {([
                  ["komentar-moderasi",  "├── Moderasi Komentar"],
                  ["komentar-spam",      "├── Spam"],
                  ["komentar-blacklist", "├── Blacklist Kata"],
                  ["komentar-laporan",   "└── Laporan Pengguna"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMenu(key)}
                    className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                      activeMenu === key
                        ? "bg-[#D71920] text-white font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setActiveMenu("newsletter")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "newsletter" ? "bg-[#D71920] text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
          >
            <Mail size={16} />
            <span>NEWSLETTER</span>
          </button>


          <button 
            onClick={() => setActiveMenu("market")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "market" ? "bg-[#D71920] text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
          >
            <Coins size={16} />
            <span>MARKET LIVE WIDGET</span>
          </button>

          <button 
            onClick={() => setActiveMenu("advertisement")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${activeMenu === "advertisement" ? "bg-[#D71920] text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
          >
            <Megaphone size={16} />
            <span>ADVERTISEMENT</span>
          </button>

          {/* Accordion User Management */}
          <div className="mb-2">
            <button
              onClick={() => setIsUserMgmtExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <Users size={16} />
                <span>USER MANAGEMENT</span>
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isUserMgmtExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isUserMgmtExpanded && (
              <div className="mt-1 ml-3 pl-3 border-l border-slate-800 flex flex-col gap-0.5">
                {([
                  ["user-all",        "├── Semua User"],
                  ["user-role",       "├── Role"],
                  ["user-permission", "├── Permission"],
                  ["user-logs",       "└── Activity Log"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMenu(key)}
                    className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                      activeMenu === key
                        ? "bg-[#D71920] text-white font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accordion SEO */}
          <div className="mb-2">
            <button
              onClick={() => setIsSeoExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <Globe size={16} />
                <span>SEO</span>
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isSeoExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isSeoExpanded && (
              <div className="mt-1 ml-3 pl-3 border-l border-slate-800 flex flex-col gap-0.5 animate-scale-up">
                {([
                  ["seo-sitemap",     "├── Sitemap"],
                  ["seo-robots",      "├── Robots.txt"],
                  ["seo-redirect",    "├── Redirect"],
                  ["seo-schema",      "├── Schema"],
                  ["seo-meta",        "├── Meta Manager"],
                  ["seo-keyword",     "├── Keyword Ranking"],
                  ["seo-broken",      "├── Broken Link"],
                  ["seo-index",       "└── Index Status"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMenu(key)}
                    className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                      activeMenu === key
                        ? "bg-[#D71920] text-white font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Accordion Pengaturan Website */}
          <div className="mb-2">
            <button
              onClick={() => setIsSettingsExpanded(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <Settings size={16} />
                <span>PENGATURAN WEBSITE</span>
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isSettingsExpanded ? "rotate-90" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isSettingsExpanded && (
              <div className="mt-1 ml-3 pl-3 border-l border-slate-800 flex flex-col gap-0.5 animate-scale-up">
                {([
                  ["settings-info",            "├── Informasi Website"],
                  ["settings-logo",            "├── Logo"],
                  ["settings-favicon",         "├── Favicon"],
                  ["settings-warna",           "├── Warna Website"],
                  ["settings-backup",          "├── Backup"],
                  ["settings-restore",         "├── Restore"],
                  ["settings-maintenance",     "└── Maintenance Mode"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMenu(key)}
                    className={`w-full text-left px-3 py-2 rounded text-[11px] transition-all cursor-pointer font-mono ${
                      activeMenu === key
                        ? "bg-[#D71920] text-white font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Core Screen */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
          
          {/* SCREEN: Dashboard - Main */}
          {activeMenu === "dashboard" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">DASHBOARD UTAMA</h3>
                <span className="text-xs text-slate-400">Pembaruan Real-Time Aktif</span>
              </div>

              {/* Welcoming Card */}
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="z-10">
                  <h4 className="text-md font-bold text-white mb-1 flex items-center gap-2">
                    <span>Selamat Datang Kembali, Admin</span>
                    <Sparkles size={16} className="text-amber-400" />
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Portal berita Poros Madura berjalan optimal. Anda memiliki kendali penuh atas semua tulisan, sitemap SEO, kategori berita, audit log, serta pengelolaan live market widget dan integrasi periklanan premium.
                  </p>
                </div>
                <div className="bg-[#D71920]/10 text-[#D71920] px-4 py-3 rounded-lg border border-[#D71920]/20 flex items-center gap-3">
                  <ShieldAlert size={20} />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">Sistem Proteksi</span>
                    <span className="text-xs font-mono font-bold">Firewall & SSL Aktif</span>
                  </div>
                </div>
              </div>

              {/* Grid 4 Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Artikel</span>
                    <span className="text-2xl font-black block mt-1 text-white">{articles.length}</span>
                  </div>
                  <div className="bg-[#0D2B5C]/40 p-3 rounded-lg text-[#D71920]">
                    <BookOpen size={20} />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pageviews</span>
                    <span className="text-2xl font-black block mt-1 text-white">
                      {analytics?.totalViews || 21320}
                    </span>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
                    <Eye size={20} />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subscribers</span>
                    <span className="text-2xl font-black block mt-1 text-white">{subscribers.length}</span>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg text-purple-400">
                    <Users size={20} />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Real-time Visitors</span>
                    <span className="text-2xl font-black block mt-1 text-amber-400 animate-pulse">
                      ● {analytics?.activeRealtimeVisitors || 38}
                    </span>
                  </div>
                  <div className="bg-amber-400/10 p-3 rounded-lg text-amber-400">
                    <TrendingUp size={20} />
                  </div>
                </div>

              </div>

              {/* Quick Config Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 col-span-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span>STATUS SISTEM OPERASIONAL</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/60">
                      <span className="text-slate-400">Server Node & Database</span>
                      <span className="text-emerald-400 font-mono font-bold">ONLINE (PORT 3000)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/60">
                      <span className="text-slate-400">Pemberitaan Breaking News</span>
                      <span className="text-slate-350">
                        {articles.filter(a => a.isBreaking).length} Berita Aktif
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/60">
                      <span className="text-slate-400">Asisten SEO AI Gemini</span>
                      <span className="text-amber-400 font-mono font-bold">CONNECTED</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">File Database Penyimpanan</span>
                      <span className="text-slate-300 font-mono font-bold">/data/db.json</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">QUICK ACTIONS</h4>
                    <p className="text-[11px] text-slate-400">Akses cepat menu pengelolaan utama portal berita:</p>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <button 
                      onClick={() => setActiveMenu("artikel")}
                      className="bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 font-bold py-2 rounded text-center text-xs transition-colors cursor-pointer"
                    >
                      Tulis Artikel Baru
                    </button>
                    <button 
                      onClick={() => setActiveMenu("advertisement")}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded text-center text-xs transition-colors cursor-pointer"
                    >
                      Konfigurasi Iklan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Dashboard - Analytics */}
          {activeMenu === "dashboard-analytics" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">ANALISIS TRAFIK & KUNJUNGAN</h3>
                <span className="text-xs text-slate-400 font-mono">Recharts Engine Live</span>
              </div>

              {/* Area Chart 7 Days */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Trafik Kunjungan 7 Hari Terakhir</h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.visitors || []}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }} />
                      <Area type="monotone" dataKey="visits" stroke="#1E40AF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisits)" />
                      <Area type="monotone" dataKey="pageviews" stroke="#D71920" strokeWidth={1.5} fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grid breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Device breakdown PieChart */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Metrik Perangkat Pengunjung</h4>
                  <div className="h-60 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.deviceBreakdown || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(analytics?.deviceBreakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Browser breakdown BarChart */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Distribusi Peramban (Browser)</h4>
                  <div className="h-60 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.browserBreakdown || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#D71920" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Table Top 5 Viewed Articles */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">5 ARTIKEL DENGAN KUNJUNGAN TERTINGGI</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5 px-3">JUDUL ARTIKEL</th>
                        <th className="py-2.5 px-3 text-center">KATEGORI</th>
                        <th className="py-2.5 px-3 text-center">TAMPILAN</th>
                        <th className="py-2.5 px-3 text-center">DIBACA</th>
                        <th className="py-2.5 px-3 text-center">SHARE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {[...articles]
                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                        .slice(0, 5)
                        .map((art, idx) => (
                          <tr key={art.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-3 font-medium text-slate-200 max-w-sm truncate">{art.title}</td>
                            <td className="py-3 px-3 text-center text-slate-400">{art.category}</td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">{art.views}</td>
                            <td className="py-3 px-3 text-center font-mono text-slate-350">{art.reads}</td>
                            <td className="py-3 px-3 text-center font-mono text-[#D71920]">{art.shares || 0}</td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Dashboard - Realtime */}
          {activeMenu === "dashboard-realtime" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>REAL TIME VISITOR TRACKER</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono uppercase font-bold tracking-wider">Aktif</span>
              </div>

              {/* Large Counter Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between md:col-span-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">PENGUNJUNG ONLINE SAAT INI</span>
                    <span className="text-5xl font-black block mt-2 text-emerald-400 font-mono tracking-tight">
                      {analytics?.activeRealtimeVisitors || 38}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 mt-4 leading-relaxed">
                    Jumlah pembaca unik yang terdeteksi sedang membuka salah satu halaman berita Poros Madura dalam 5 menit terakhir.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:col-span-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">SEBARAN GEOGRAFIS MOCKUP (INDONESIA)</h4>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Jawa Timur (Sumenep, Pamekasan, Bangkalan, Sampang, Surabaya)</span>
                      <span className="font-bold text-emerald-400">45%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full" style={{ width: "45%" }} />
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span>DKI Jakarta & Banten</span>
                      <span className="font-bold text-emerald-400">25%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full" style={{ width: "25%" }} />
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span>Jawa Tengah & DIY</span>
                      <span className="font-bold text-emerald-400">18%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full" style={{ width: "18%" }} />
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span>Luar Jawa</span>
                      <span className="font-bold text-emerald-400">12%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full" style={{ width: "12%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Stream */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AKTIVITAS MEMBACA REAL-TIME (SIMULASI)</h4>
                  <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 font-mono">Interval 3s</span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto font-mono text-xs">
                  {articles.length > 0 ? (
                    [...articles].slice(0, 7).map((art, idx) => {
                      const cities = ["Sumenep", "Pamekasan", "Bangkalan", "Sampang", "Surabaya", "Jakarta Selatan", "Bandung", "Malang"];
                      const city = cities[idx % cities.length];
                      const minutesAgo = idx + 1;
                      return (
                        <div key={art.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded flex justify-between items-center hover:border-slate-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400">●</span>
                            <span className="text-slate-400 font-bold">[{city}]</span>
                            <span className="text-slate-250 truncate max-w-lg">sedang membaca "{art.title}"</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">{minutesAgo} menit yang lalu</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-500">Tidak ada data artikel.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Dashboard - Traffic Sources */}
          {activeMenu === "dashboard-traffic" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">SUMBER TRAFIK PENGUNJUNG</h3>
                <span className="text-xs text-slate-400 font-mono">Tinjauan Referal</span>
              </div>

              {/* Progress stack cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 space-y-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">SALURAN AKUISISI PENGUNJUNG</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-350 mb-1">
                        <span>Direct (Kunjungan Langsung)</span>
                        <span className="font-bold text-white">42.50%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full" style={{ width: "42.5%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-350 mb-1">
                        <span>Organic Search (Google/Bing)</span>
                        <span className="font-bold text-white">35.20%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: "35.2%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-350 mb-1">
                        <span>Social Media (Facebook/Instagram/Twitter)</span>
                        <span className="font-bold text-white">14.80%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#D71920] h-full" style={{ width: "14.8%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-350 mb-1">
                        <span>Referral Links (Portal berita mitra/Aggregator)</span>
                        <span className="font-bold text-white">7.50%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: "7.5%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">RINGKASAN AKUISISI</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Sebagian besar pembaca mengakses portal berita Poros Madura secara langsung (Direct) atau melalui rujukan mesin pencari (Google). Hal ini menunjukkan branding merek Poros Madura cukup kuat di kalangan masyarakat.
                    </p>
                  </div>
                  <div className="border-t border-slate-800 pt-4 mt-4 font-mono text-[10px] text-slate-500 space-y-1.5">
                    <div>Bounce Rate: <span className="text-slate-350">34.20%</span></div>
                    <div>Avg Session Duration: <span className="text-slate-350">2m 45s</span></div>
                    <div>Page / Session: <span className="text-slate-350">2.8</span></div>
                  </div>
                </div>

              </div>

              {/* Table referrals */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">DAFTAR SITUS PERUJUK (REFERRAL SITES)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5 px-3">DOMAIN PERUJUK</th>
                        <th className="py-2.5 px-3 text-center">HITS / VISITS</th>
                        <th className="py-2.5 px-3 text-center">KONTRIBUSI</th>
                        <th className="py-2.5 px-3 text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-mono">
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-sans text-slate-300">google.co.id</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">12,450</td>
                        <td className="py-2.5 px-3 text-center text-slate-400">55.8%</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400">AMAN</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-sans text-slate-300">facebook.com</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">4,230</td>
                        <td className="py-2.5 px-3 text-center text-slate-400">18.9%</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400">AMAN</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-sans text-slate-300">t.co (Twitter)</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">2,120</td>
                        <td className="py-2.5 px-3 text-center text-slate-400">9.5%</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400">AMAN</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-sans text-slate-300">instagram.com</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">1,840</td>
                        <td className="py-2.5 px-3 text-center text-slate-400">8.2%</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400">AMAN</td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-sans text-slate-300">detik.com</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">950</td>
                        <td className="py-2.5 px-3 text-center text-slate-400">4.2%</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400">AMAN</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Dashboard - Revenue */}
          {activeMenu === "dashboard-revenue" && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">KONTRAK & PENDAPATAN IKLAN</h3>
                <span className="text-xs text-slate-400 font-mono">Ad System Billing</span>
              </div>

              {/* Grid Earnings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">ESTIMASI PENDAPATAN BULAN INI</span>
                    <span className="text-2xl font-black block mt-2 text-emerald-400 font-mono">Rp 38,700,000,-</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-4 pt-2 border-t border-slate-800">
                    Berdasarkan CPM/CPC & Biaya Harian Slot
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">KONTRAK AKTIF PENGIKLAN</span>
                    <span className="text-2xl font-black block mt-2 text-white font-mono">4 Perusahaan</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-4 pt-2 border-t border-slate-800">
                    Samsung, Mandiri, Telkomsel, Traveloka
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">TOTAL IMPRESI KAMPANYE</span>
                    <span className="text-2xl font-black block mt-2 text-blue-400 font-mono">196,620 Hits</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-4 pt-2 border-t border-slate-800">
                    Dari seluruh slot terpasang
                  </div>
                </div>

              </div>

              {/* Advertisers Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">DAFTAR KONTRAK & ALOKASI ANGGARAN</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5 px-3">NAMA PENGIKLAN</th>
                        <th className="py-2.5 px-3">PERUSAHAAN</th>
                        <th className="py-2.5 px-3 text-right">TOTAL ANGGARAN</th>
                        <th className="py-2.5 px-3 text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 text-slate-200 font-bold">Samsung Indonesia</td>
                        <td className="py-3 px-3 text-slate-400">PT Samsung Electronics Indonesia</td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-mono font-bold">Rp 150,000,000</td>
                        <td className="py-3 px-3 text-center"><span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">AKTIF</span></td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 text-slate-200 font-bold">Bank Mandiri</td>
                        <td className="py-3 px-3 text-slate-400">PT Bank Mandiri (Persero) Tbk</td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-mono font-bold">Rp 240,000,000</td>
                        <td className="py-3 px-3 text-center"><span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">AKTIF</span></td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 text-slate-200 font-bold">Telkomsel</td>
                        <td className="py-3 px-3 text-slate-400">PT Telekomunikasi Selular</td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-mono font-bold">Rp 90,000,000</td>
                        <td className="py-3 px-3 text-center"><span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">AKTIF</span></td>
                      </tr>
                      <tr className="hover:bg-slate-800/30">
                        <td className="py-3 px-3 text-slate-200 font-bold">Traveloka Indonesia</td>
                        <td className="py-3 px-3 text-slate-400">PT Trinusa Travelindo</td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-mono font-bold">Rp 180,000,000</td>
                        <td className="py-3 px-3 text-center"><span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">AKTIF</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Rules */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ATURAN TARIF METRIK PERIKLANAN (CPM & CPC)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded">
                    <span className="text-slate-400 font-bold block mb-1">Top Billboard (970x250)</span>
                    <div>Biaya Harian: <span className="text-white">Rp 2.500.000</span></div>
                    <div>CPM (1000 Impr): <span className="text-white">Rp 15.000</span></div>
                    <div>CPC (Per Klik): <span className="text-white">Rp 1.200</span></div>
                  </div>
                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded">
                    <span className="text-slate-400 font-bold block mb-1">Top Leaderboard (728x90)</span>
                    <div>Biaya Harian: <span className="text-white">Rp 1.800.000</span></div>
                    <div>CPM (1000 Impr): <span className="text-white">Rp 10.000</span></div>
                    <div>CPC (Per Klik): <span className="text-white">Rp 1.000</span></div>
                  </div>
                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded">
                    <span className="text-slate-400 font-bold block mb-1">Floating Skyscrapers (160x600)</span>
                    <div>Biaya Harian: <span className="text-white">Rp 3.000.000</span></div>
                    <div>CPM (1000 Impr): <span className="text-white">Rp 20.000</span></div>
                    <div>CPC (Per Klik): <span className="text-white">Rp 1.500</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Dashboard - Today */}
          {activeMenu === "dashboard-today" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">RINGKASAN AKTIVITAS HARI INI</h3>
                <span className="text-xs text-slate-400 font-mono">Today Activity Log</span>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DITERBITKAN HARI INI</span>
                    <span className="text-2xl font-black block mt-1 text-white">3 Artikel</span>
                  </div>
                  <div className="bg-[#D71920]/10 p-3 rounded-lg text-[#D71920]">
                    <PlusCircle size={20} />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">KOMENTAR MASUK HARI INI</span>
                    <span className="text-2xl font-black block mt-1 text-white">8 Komentar</span>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg text-purple-400">
                    <MessageSquare size={20} />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">KLIK KAMPANYE HARI INI</span>
                    <span className="text-2xl font-black block mt-1 text-white">128 Klik</span>
                  </div>
                  <div className="bg-amber-400/10 p-3 rounded-lg text-amber-400">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>

              {/* Logs Feed */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">LOG SISTEM & AUDIT TERBARU</h4>
                <div className="space-y-3 font-mono text-xs">
                  {logs.slice(0, 6).map((log, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/60 border border-slate-850 rounded hover:border-slate-800 transition-colors">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-slate-350 font-bold">{log.user} ({log.role})</span>
                        <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-400">{log.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Artikel Manager & Sub-menus */}
          {(activeMenu === "artikel" ||
            activeMenu === "artikel-buat" ||
            activeMenu === "artikel-draft" ||
            activeMenu === "artikel-review" ||
            activeMenu === "artikel-scheduled" ||
            activeMenu === "artikel-published" ||
            activeMenu === "artikel-breaking" ||
            activeMenu === "artikel-rekomendasi" ||
            activeMenu === "artikel-trending" ||
            activeMenu === "artikel-recycle") && (
            <div className="flex flex-col gap-8 animate-fade-in">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight uppercase">
                  {activeMenu === "artikel" && "SEMUA ARTIKEL"}
                  {activeMenu === "artikel-buat" && (editingArticle ? "EDIT ARTIKEL" : "BUAT ARTIKEL BARU")}
                  {activeMenu === "artikel-draft" && "DRAFT ARTIKEL"}
                  {activeMenu === "artikel-review" && "ARTIKEL MENUNGGU REVIEW"}
                  {activeMenu === "artikel-scheduled" && "ARTIKEL DIJADWALKAN"}
                  {activeMenu === "artikel-published" && "ARTIKEL DIPUBLIKASIKAN"}
                  {activeMenu === "artikel-breaking" && "ARTIKEL BREAKING NEWS"}
                  {activeMenu === "artikel-rekomendasi" && "ARTIKEL REKOMENDASI"}
                  {activeMenu === "artikel-trending" && "ARTIKEL TRENDING"}
                  {activeMenu === "artikel-recycle" && "RECYCLE BIN (KOTAK SAMPAH)"}
                </h3>
                {activeMenu !== "artikel-buat" && (
                  <button 
                    onClick={() => {
                      resetArticleForm();
                      setIsCreating(true);
                      setActiveMenu("artikel-buat");
                    }}
                    className="bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 text-xs font-bold px-4 py-2 rounded-full cursor-pointer flex items-center gap-2"
                  >
                    <PlusCircle size={15} />
                    <span>Tulis Berita Baru</span>
                  </button>
                )}
              </div>

              {activeMenu === "artikel-buat" ? (
                /* Edit/Create Form screen */
                <form onSubmit={handleSaveArticle} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white uppercase flex items-center gap-1.5 font-sans">
                      <Sparkles size={15} className="text-[#D71920]" />
                      <span>{editingArticle ? "Edit Artikel" : "Tulis Artikel Baru"}</span>
                    </h4>
                    <button type="button" onClick={() => { resetArticleForm(); setActiveMenu("artikel"); }} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                  </div>

                  {/* AI Copilot Button (Special Gemini Trigger!) */}
                  <div className="p-4 rounded-xl bg-[#D71920]/10 border border-[#D71920]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-xs font-black text-[#D71920] tracking-wider uppercase block mb-0.5 font-mono">Asisten Penulisan AI Gemini</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed max-w-xl">
                        Tuliskan Judul dan Konten, lalu klik tombol ini untuk otomatis menghasilkan kata kunci SEO, ringkasan eksekutif, serta saran headline clickbait secara instan.
                      </p>
                    </div>
                    <button 
                      type="button"
                      disabled={aiLoading}
                      onClick={handleAiAssist}
                      className="bg-[#D71920] text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#D71920]/90 transition-colors disabled:opacity-50 shrink-0 font-sans cursor-pointer"
                    >
                      {aiLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Menganalisis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Optimalkan dengan AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiSuccessMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg flex items-center gap-2">
                      <Sparkles size={16} />
                      <span>{aiSuccessMsg}</span>
                    </div>
                  )}

                  {aiErrorMsg && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{aiErrorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Judul Artikel *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Masukkan judul berita utama..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Kategori Berita *</label>
                      <select
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          setSubCategory("");
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                      >
                        {categories.filter(c => !Object.values(categoryHierarchy).flat().includes(c)).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Sub-Kategori (Opsional)</label>
                      {categoryHierarchy[category] && categoryHierarchy[category].length > 0 ? (
                        <select
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                        >
                          <option value="">Tidak ada sub-kategori</option>
                          {categoryHierarchy[category].map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="Contoh: Infrastruktur, Legislatif, dll"
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                        />
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Cover Image URL *</label>
                      <input 
                        type="url" 
                        required
                        placeholder="https://images.unsplash.com/..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                      />
                    </div>
                  </div>


                  {/* Rich Text Editor */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Isi Konten Artikel *</label>
                    <div className="border border-slate-700/60 rounded-xl overflow-hidden bg-slate-950 focus-within:border-[#D71920]/60 focus-within:ring-1 focus-within:ring-[#D71920]/30 transition-all">

                      {/* ── Toolbar ── */}
                      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-slate-900/80 border-b border-slate-800">

                        {/* Format teks */}
                        <div className="flex items-center gap-0.5">
                          <button type="button" title="Bold" onClick={() => execCmd('bold')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <Bold size={14} strokeWidth={2.5} />
                          </button>
                          <button type="button" title="Italic" onClick={() => execCmd('italic')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <Italic size={14} strokeWidth={2.5} />
                          </button>
                          <button type="button" title="Underline" onClick={() => execCmd('underline')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <Underline size={14} strokeWidth={2.5} />
                          </button>
                          <button type="button" title="Strikethrough" onClick={() => execCmd('strikeThrough')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <Strikethrough size={14} strokeWidth={2.5} />
                          </button>
                        </div>

                        <div className="w-px h-5 bg-slate-700/80 mx-0.5" />

                        {/* Heading & Paragraph */}
                        <div className="flex items-center gap-0.5">
                          <button type="button" title="Heading 2" onClick={() => execCmd('formatBlock', 'h2')}
                            className="h-8 px-2 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer text-[11px] font-black font-mono tracking-tight">
                            H2
                          </button>
                          <button type="button" title="Heading 3" onClick={() => execCmd('formatBlock', 'h3')}
                            className="h-8 px-2 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer text-[11px] font-bold font-mono tracking-tight">
                            H3
                          </button>
                          <button type="button" title="Paragraf" onClick={() => execCmd('formatBlock', 'p')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <Type size={13} strokeWidth={2} />
                          </button>
                        </div>

                        <div className="w-px h-5 bg-slate-700/80 mx-0.5" />

                        {/* Lists */}
                        <div className="flex items-center gap-0.5">
                          <button type="button" title="Bullet List" onClick={() => execCmd('insertUnorderedList')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <List size={14} strokeWidth={2} />
                          </button>
                          <button type="button" title="Numbered List" onClick={() => execCmd('insertOrderedList')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <ListOrdered size={14} strokeWidth={2} />
                          </button>
                        </div>

                        <div className="w-px h-5 bg-slate-700/80 mx-0.5" />

                        {/* Alignment */}
                        <div className="flex items-center gap-0.5">
                          <button type="button" title="Rata Kiri" onClick={() => execCmd('justifyLeft')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <AlignLeft size={14} strokeWidth={2} />
                          </button>
                          <button type="button" title="Rata Tengah" onClick={() => execCmd('justifyCenter')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <AlignCenter size={14} strokeWidth={2} />
                          </button>
                          <button type="button" title="Rata Kanan" onClick={() => execCmd('justifyRight')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <AlignRight size={14} strokeWidth={2} />
                          </button>
                        </div>

                        <div className="w-px h-5 bg-slate-700/80 mx-0.5" />

                        {/* Blockquote & HR */}
                        <div className="flex items-center gap-0.5">
                          <button type="button" title="Blockquote" onClick={() => execCmd('formatBlock', 'blockquote')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <Quote size={14} strokeWidth={2} />
                          </button>
                          <button type="button" title="Garis Pemisah" onClick={() => execCmd('insertHorizontalRule')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <Minus size={14} strokeWidth={2} />
                          </button>
                        </div>

                        <div className="w-px h-5 bg-slate-700/80 mx-0.5" />

                        {/* Link */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            title="Insert Link"
                            onClick={() => {
                              const url = prompt("Masukkan URL:");
                              if (url) execCmd('createLink', url);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer"
                          >
                            <Link size={14} strokeWidth={2} />
                          </button>
                          <button type="button" title="Hapus Link" onClick={() => execCmd('unlink')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <Link2Off size={14} strokeWidth={2} />
                          </button>
                        </div>

                        <div className="w-px h-5 bg-slate-700/80 mx-0.5" />

                        {/* Undo / Redo */}
                        <div className="flex items-center gap-0.5">
                          <button type="button" title="Undo" onClick={() => execCmd('undo')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <Undo2 size={14} strokeWidth={2} />
                          </button>
                          <button type="button" title="Redo" onClick={() => execCmd('redo')}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer">
                            <Redo2 size={14} strokeWidth={2} />
                          </button>
                        </div>

                        {/* Spacer push to right */}
                        <div className="flex-1" />

                        {/* Clear formatting — far right, subtle danger color */}
                        <button type="button" title="Hapus Semua Format" onClick={() => execCmd('removeFormat')}
                          className="h-8 px-2.5 flex items-center gap-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-950/30 transition-all cursor-pointer text-[10px] font-mono uppercase tracking-wider border border-transparent hover:border-red-900/40">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6L9 18M9 6l6 12"/><path d="M4 18h8"/></svg>
                          <span>Clear</span>
                        </button>
                      </div>

                      {/* ── Editable area ── */}
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleEditorInput}
                        data-placeholder="Tulis artikel berita lengkap di sini..."
                        className="min-h-[280px] px-5 py-4 text-sm text-slate-200 focus:outline-none leading-relaxed font-sans prose-editor"
                        style={{ minHeight: 280, maxHeight: 640, overflowY: 'auto' }}
                      />

                      {/* Status bar */}
                      <div className="px-4 py-1.5 border-t border-slate-800/60 bg-slate-900/50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-600 font-mono">
                          {content.replace(/<[^>]*>/g, '').length} karakter
                        </span>
                        <span className="text-[10px] text-slate-700 font-mono">HTML editor</span>
                      </div>

                      {/* hidden input for form validation */}
                      <input type="hidden" required value={content} onChange={() => {}} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Keywords / Tags (Pisahkan dengan koma)</label>
                      <input 
                        type="text" 
                        placeholder="Politik, DPR, Reformasi"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                      />
                    </div>
                    <div className="flex flex-col gap-2 pt-6">
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Penempatan Khusus</label>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} className="rounded" />
                          <span>Breaking News</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={isHeadline} onChange={(e) => setIsHeadline(e.target.checked)} className="rounded" />
                          <span>Headline Utama</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={isEditorChoice} onChange={(e) => setIsEditorChoice(e.target.checked)} className="rounded" />
                          <span>Rekomendasi</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="rounded" />
                          <span>Trending</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button 
                      type="button" 
                      onClick={() => { resetArticleForm(); setActiveMenu("artikel"); }}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-700 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 text-xs font-bold rounded-lg shadow-md cursor-pointer"
                    >
                      Simpan & Terbitkan
                    </button>
                  </div>

                </form>
              ) : (
                /* Article list view screen */
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6">
                  {/* Search filter bar */}
                  <div className="flex justify-between items-center mb-6 gap-4">
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
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-400">
                      <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase font-mono border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Berita</th>
                          <th className="px-4 py-3">Kategori</th>
                          <th className="px-4 py-3 text-center">Views</th>
                          <th className="px-4 py-3 text-center">Shares</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {(activeMenu === "artikel-recycle" ? deletedArticles : filteredArticles.filter(art => {
                          if (activeMenu === "artikel-draft") return art.status === "draft";
                          if (activeMenu === "artikel-review") return art.status === "pending" || art.status === "review";
                          if (activeMenu === "artikel-scheduled") return art.status === "scheduled";
                          if (activeMenu === "artikel-published") return art.status === "published" || !art.status;
                          if (activeMenu === "artikel-breaking") return art.isBreaking;
                          if (activeMenu === "artikel-rekomendasi") return art.isEditorChoice;
                          if (activeMenu === "artikel-trending") return art.isTrending;
                          return true; // "artikel" (All Articles)
                        })).map(a => (
                          <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-white max-w-sm">
                              <span className="line-clamp-2">{a.title}</span>
                              <span className="text-[10px] text-slate-500 block font-mono mt-1">Slug: {a.slug}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="bg-[#D71920]/15 text-[#D71920] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{a.category}</span>
                            </td>
                            <td className="px-4 py-3.5 text-center font-mono font-bold text-white">{a.views || 0}</td>
                            <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-350">{a.shares || 0}</td>
                            <td className="px-4 py-3.5 text-center">
                              {a.status === "draft" && (
                                <span className="bg-slate-800 text-slate-450 border border-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono">DRAFT</span>
                              )}
                              {(a.status === "pending" || a.status === "review") && (
                                <span className="bg-amber-950/20 text-amber-400 border border-amber-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono">REVIEW</span>
                              )}
                              {a.status === "scheduled" && (
                                <span className="bg-blue-950/20 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono">SCHEDULED</span>
                              )}
                              {(a.status === "published" || !a.status) && (
                                <span className="bg-green-950/20 text-green-400 border border-green-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono">PUBLISHED</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {activeMenu === "artikel-recycle" ? (
                                <div className="flex justify-end gap-2.5">
                                  <button 
                                    onClick={() => handleRestoreArticleSimulated(a)} 
                                    title="Restore" 
                                    className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-800 hover:bg-emerald-500/20 transition-all font-mono font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                                  >
                                    Restore
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteArticlePermanently(a.id)} 
                                    title="Delete Permanently" 
                                    className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2.5">
                                  <button onClick={() => handleEditArticle(a)} className="p-1 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"><Edit3 size={15} /></button>
                                  <button onClick={() => handleDeleteArticleSimulated(a)} className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"><Trash2 size={15} /></button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCREEN: Kategori */}
          {activeMenu === "kategori" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">MANAJEMEN KATEGORI</h3>
                  <p className="text-xs text-slate-500 mt-1">Kelola kategori utama artikel di portal Poros Madura</p>
                </div>
                <span className="text-[10px] text-slate-600 font-mono bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">{categories.length} kategori aktif</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Card: Add Category Form */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <PlusCircle size={13} className="text-[#D71920]" />
                      Tambah Kategori Baru
                    </h4>
                    <form onSubmit={handleAddCategory} className="flex flex-col gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Nama kategori..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                      />
                      <button type="submit" className="w-full bg-[#D71920] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer">
                        Tambah Kategori
                      </button>
                    </form>
                  </div>
                  
                  {/* Category Info helper card */}
                  <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-6">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Panduan Kategori</h5>
                    <p className="text-xs text-slate-500 leading-relaxed font-light">
                      Kategori digunakan untuk mengelompokkan artikel berita pada menu utama portal. Menghapus kategori tidak akan menghapus artikel, namun artikel tersebut akan menjadi tidak memiliki kategori (Uncategorized) hingga Anda mengeditnya kembali.
                    </p>
                  </div>
                </div>

                {/* Right Card: Category List Table */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Daftar Kategori & Statistik Konten</h4>
                  
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                          <th className="py-3 px-3">Nama Kategori</th>
                          <th className="py-3 px-3 text-center">Jumlah Artikel</th>
                          <th className="py-3 px-3 text-center">Kontribusi (%)</th>
                          <th className="py-3 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {categories.map((c) => {
                          const count = articles.filter(a => a.category === c).length;
                          const totalArticles = articles.length || 1;
                          const contributionPct = Math.round((count / totalArticles) * 100);
                          return (
                            <tr key={c} className="hover:bg-slate-800/30 transition-colors group">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
                                  <span className="text-xs font-bold text-white">{c}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="text-[10px] font-mono font-bold text-[#D71920] bg-[#D71920]/10 px-2.5 py-0.5 rounded-full">
                                  {count} Artikel
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center text-xs font-mono text-slate-450 font-medium">
                                {contributionPct}%
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => handleDeleteCategory(c)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-red-500 hover:text-red-400 cursor-pointer rounded-lg hover:bg-slate-800"
                                  title={`Hapus kategori ${c}`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Tag */}
          {activeMenu === "kategori-tag" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">MANAJEMEN TAG</h3>
                  <p className="text-xs text-slate-500 mt-1">Kelola tag/hashtag untuk sistem pengelompokan konten</p>
                </div>
                <span className="text-[10px] text-slate-600 font-mono bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">{tags.length} Tag aktif</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Add Tag */}
                <form onSubmit={handleAddTag} className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <PlusCircle size={13} className="text-[#D71920]" />
                    Tambah Tag
                  </h4>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Nama tag baru..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                    />
                    <input
                      type="text"
                      placeholder="Deskripsi singkat (opsional)"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                    />
                    <button type="submit" className="w-full bg-[#D71920] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer">
                      Simpan Tag
                    </button>
                  </div>
                </form>

                {/* Tag cloud */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Tag Terpopuler</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => {
                      const count = articles.filter(a => a.tags && a.tags.some(tg => tg.toLowerCase() === t.toLowerCase())).length;
                      return (
                        <div key={t} className="group flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-full transition-all cursor-pointer">
                          <span className="text-xs text-slate-300 font-mono">#{t}</span>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded-full">{count}</span>
                          <button 
                            type="button"
                            onClick={() => handleDeleteTag(t)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400 ml-0.5 cursor-pointer"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Topik */}
          {activeMenu === "kategori-topik" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">MANAJEMEN TOPIK</h3>
                  <p className="text-xs text-slate-500 mt-1">Topik adalah pengelompokan tematik lintas kategori untuk pengalaman baca yang lebih dalam</p>
                </div>
                <button 
                  onClick={() => {
                    const name = prompt("Masukkan nama topik baru:");
                    const desc = prompt("Masukkan deskripsi singkat topik:");
                    if (name) {
                      setTopics(prev => [...prev, { name, articles: 0, color: "#D71920", desc: desc || "Topik baru" }]);
                    }
                  }}
                  className="flex items-center gap-1.5 bg-[#D71920] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer"
                >
                  <PlusCircle size={13} />
                  Topik Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {topics.map(topic => (
                  <div key={topic.name} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: topic.color }} />
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => {
                            const newName = prompt("Edit nama topik:", topic.name);
                            if (newName) {
                              setTopics(prev => prev.map(t => t.name === topic.name ? { ...t, name: newName } : t));
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <Edit3 size={12} className="text-slate-400" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTopic(topic.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                    <h5 className="text-sm font-bold text-white mb-1.5">{topic.name}</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{topic.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-600">{topic.articles} artikel</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: topic.color, borderColor: topic.color + "40", backgroundColor: topic.color + "12" }}>Aktif</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN: Label Khusus */}
          {activeMenu === "kategori-label" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">LABEL KHUSUS</h3>
                  <p className="text-xs text-slate-500 mt-1">Label editorial untuk menandai konten dengan status atau tipe khusus</p>
                </div>
                <button 
                  onClick={() => {
                    const name = prompt("Masukkan nama label baru:");
                    if (name) {
                      setLabels(prev => [...prev, { name, color: "#3b82f6", bg: "#3b82f6", articles: 0, desc: "Label khusus baru" }]);
                    }
                  }}
                  className="flex items-center gap-1.5 bg-[#D71920] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer"
                >
                  <PlusCircle size={13} />
                  Buat Label
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Label List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Label Aktif</h4>
                    <span className="text-[10px] font-mono text-slate-600">{labels.length} label</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {labels.map(label => (
                      <div key={label.name} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/30 transition-colors group">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{label.name}</span>
                            <span className="text-[10px] font-mono text-slate-600 border border-slate-800 px-1.5 py-0.5 rounded">{label.articles} artikel</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-0.5 truncate">{label.desc}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              const newName = prompt("Edit nama label:", label.name);
                              if (newName) {
                                setLabels(prev => prev.map(l => l.name === label.name ? { ...l, name: newName } : l));
                              }
                            }}
                            className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors"
                          >
                            <Edit3 size={11} className="text-slate-400" />
                          </button>
                          <button 
                            onClick={() => handleDeleteLabel(label.name)}
                            className="p-1.5 hover:bg-slate-700 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 size={11} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Label Form */}
                <form onSubmit={handleAddLabel} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <PlusCircle size={13} className="text-[#D71920]" />
                    Buat Label Baru
                  </h4>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nama Label</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Eksklusif, Viral, Podcast..." 
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Deskripsi</label>
                      <textarea 
                        rows={3} 
                        placeholder="Deskripsi penggunaan label ini..." 
                        value={newLabelDesc}
                        onChange={(e) => setNewLabelDesc(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] resize-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Warna Label</label>
                      <div className="flex gap-2 flex-wrap">
                        {["#D71920", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#f97316", "#64748b"].map(color => (
                          <button 
                            key={color} 
                            type="button"
                            onClick={() => setNewLabelColor(color)}
                            className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                              newLabelColor === color ? "border-white scale-110 shadow" : "border-transparent"
                            }`} 
                            style={{ backgroundColor: color }} 
                          />
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-[#D71920] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer mt-1">
                      Simpan Label
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── SCREEN: Media Library ─── */}
          {activeMenu === "media-library" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">MEDIA LIBRARY</h3>
                  <p className="text-xs text-slate-500 mt-1">Semua aset media yang telah diunggah ke portal</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Cari file..." className="pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] w-48" />
                  </div>
                  <button onClick={() => setActiveMenu("media-upload")} className="flex items-center gap-1.5 bg-[#D71920] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer">
                    <PlusCircle size={13} /> Upload
                  </button>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1">
                {["Semua", "Gambar", "Video", "Dokumen"].map((f) => (
                  <button 
                    key={f} 
                    onClick={() => setMediaFilter(f)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mediaFilter === f ? "bg-[#D71920] text-white" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Media grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {mediaFiles.filter(m => {
                  if (mediaFilter === "Gambar") return m.type === "img";
                  if (mediaFilter === "Video") return m.type === "vid";
                  if (mediaFilter === "Dokumen") return m.type === "pdf" || m.type === "doc";
                  return true;
                }).map((file) => (
                  <div key={file.id} className="group relative bg-slate-900 border border-slate-800 hover:border-slate-650 rounded-xl overflow-hidden transition-all cursor-pointer">
                    <div className="aspect-square relative overflow-hidden bg-slate-950 flex items-center justify-center border-b border-slate-800">
                      {file.type === "img" && file.url ? (
                        <img 
                          src={file.url} 
                          alt={file.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                        />
                      ) : file.type === "img" ? (
                        <span className="text-3xl">🖼️</span>
                      ) : file.type === "vid" ? (
                        <span className="text-3xl">🎬</span>
                      ) : file.type === "pdf" ? (
                        <span className="text-3xl">📄</span>
                      ) : (
                        <span className="text-3xl">📝</span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] text-slate-350 font-mono truncate">{file.name}</p>
                      <p className="text-[9px] text-slate-600 font-mono mt-0.5">{file.size}</p>
                    </div>
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedMediaPreview(file)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors"
                      >
                        <Eye size={13} className="text-white" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMedia(file.id)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total File", value: mediaFiles.length, sub: "media aktif" },
                  { label: "Storage Digunakan", value: "1.8 GB", sub: "dari 10 GB" },
                  { label: "Upload Bulan Ini", value: "38", sub: "file baru" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-xl font-black text-white">{s.value}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{s.label}</p>
                    <p className="text-[10px] text-slate-600 font-mono">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SCREEN: Upload Gambar ─── */}
          {activeMenu === "media-upload" && (
            <div className="flex flex-col gap-8">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">UPLOAD MEDIA</h3>
                <p className="text-xs text-slate-500 mt-1">Unggah gambar, video, atau dokumen ke media library</p>
              </div>

              {pendingUploadFile ? (
                /* PRATINJAU FILE SEBELUM UPLOAD */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-scale-up">
                  {/* Preview Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider self-start">Pratinjau File Pilihan</h4>
                    
                    <div className="w-full aspect-video rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center overflow-hidden relative">
                      {pendingUploadFile.type === "img" && pendingUploadFile.url ? (
                        <img 
                          src={pendingUploadFile.url} 
                          alt="Preview" 
                          className="w-full h-full object-contain" 
                        />
                      ) : pendingUploadFile.type === "img" ? (
                        <span className="text-7xl">🖼️</span>
                      ) : pendingUploadFile.type === "vid" ? (
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-7xl">🎬</span>
                          <span className="text-xs font-mono text-slate-500">Video format</span>
                        </div>
                      ) : pendingUploadFile.type === "pdf" ? (
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-7xl">📄</span>
                          <span className="text-xs font-mono text-slate-500">Dokumen PDF</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-7xl">📝</span>
                          <span className="text-xs font-mono text-slate-500">Dokumen Teks / Word</span>
                        </div>
                      )}
                    </div>

                    <div className="w-full flex flex-col gap-2">
                      <p className="text-sm font-bold text-white truncate text-center">{pendingUploadFile.name}</p>
                      <p className="text-xs text-slate-500 text-center font-mono">{pendingUploadFile.size} · {pendingUploadFile.type.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Settings & Confirm Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-6">
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-bold">Opsi & Tujuan</h4>
                      
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">Folder Tujuan</label>
                        <select 
                          value={mediaDestFolder}
                          onChange={(e) => setMediaDestFolder(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920]"
                        >
                          <option value="/">Root (/)</option>
                          <option value="/berita">/berita</option>
                          <option value="/iklan">/iklan</option>
                          <option value="/thumbnail">/thumbnail</option>
                          <option value="/logo">/logo</option>
                        </select>
                      </div>

                      {pendingUploadFile.type === "img" && (
                        <>
                          <div className="border-t border-slate-800/60 pt-4">
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-bold">Kualitas Kompresi</label>
                              <span className="text-xs font-bold text-emerald-400 font-mono">{compressQuality}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="10" 
                              max="100" 
                              value={compressQuality}
                              onChange={(e) => setCompressQuality(Number(e.target.value))}
                              className="w-full accent-[#D71920]" 
                            />
                          </div>

                          <div className="border-t border-slate-800/60 pt-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2 font-bold">Format Target</label>
                            <div className="grid grid-cols-4 gap-2">
                              {["WebP", "AVIF", "JPEG", "PNG"].map(fmt => (
                                <button 
                                  key={fmt}
                                  onClick={() => setTargetFormat(fmt)}
                                  className={`py-1.5 rounded-lg text-xs font-bold border font-mono transition-all cursor-pointer ${
                                    targetFormat === fmt 
                                      ? "bg-[#D71920]/10 border-[#D71920] text-white animate-pulse" 
                                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {fmt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button 
                        onClick={handleCancelUpload}
                        className="flex-1 bg-transparent hover:bg-slate-800 border border-slate-800 text-slate-300 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                      >
                        Batal / Pilih File Lain
                      </button>
                      <button 
                        onClick={handleConfirmUpload}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                      >
                        <span>Mulai Upload</span>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono font-normal">🚀</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* STANDAR DROPZONE */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Drop zone */}
                  <div className="flex flex-col gap-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer.files;
                        if (files && files.length > 0) {
                          handleSelectFileForUpload(files[0]);
                        }
                      }}
                      className="border-2 border-dashed border-slate-750 hover:border-[#D71920]/60 rounded-2xl p-12 text-center transition-all cursor-pointer group"
                    >
                      <div className="text-5xl mb-4">📁</div>
                      <p className="text-sm font-bold text-slate-350 group-hover:text-white transition-colors">Drag & Drop file di sini</p>
                      <p className="text-xs text-slate-650 mt-1.5 font-mono">atau klik untuk memilih file</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                        {["JPG", "PNG", "WEBP", "GIF", "MP4", "PDF", "DOCX"].map(t => (
                          <span key={t} className="text-[10px] font-mono text-slate-700 border border-slate-850 px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-[#D71920] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer"
                    >
                      Pilih File dari Komputer
                    </button>
                  </div>

                  {/* Upload settings */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pengaturan Upload</h4>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Folder Tujuan</label>
                      <select 
                        value={mediaDestFolder}
                        onChange={(e) => setMediaDestFolder(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                      >
                        <option value="/">Root (/)</option>
                        <option value="/berita">/berita</option>
                        <option value="/iklan">/iklan</option>
                        <option value="/thumbnail">/thumbnail</option>
                        <option value="/logo">/logo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Alt Text (SEO)</label>
                      <input 
                        type="text" 
                        placeholder="Deskripsi gambar untuk aksesibilitas..." 
                        value={mediaAlt}
                        onChange={(e) => setMediaAlt(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Caption</label>
                      <input 
                        type="text" 
                        placeholder="Keterangan gambar (opsional)" 
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="auto-webp" className="rounded" defaultChecked />
                      <label htmlFor="auto-webp" className="text-xs text-slate-400 cursor-pointer">Konversi otomatis ke WebP</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="auto-compress" className="rounded" defaultChecked />
                      <label htmlFor="auto-compress" className="text-xs text-slate-400 cursor-pointer">Kompresi otomatis (&lt;500 KB)</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── SCREEN: Video ─── */}
          {activeMenu === "media-video" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">MANAJEMEN VIDEO</h3>
                  <p className="text-xs text-slate-500 mt-1">Kelola embed video YouTube, Vimeo, atau upload langsung</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add video form */}
                <form onSubmit={handleAddVideo} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Embed Video Baru</h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Judul Video</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Judul video..." 
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">URL Video (YouTube/Vimeo)</label>
                    <input 
                      type="url" 
                      required
                      placeholder="https://youtube.com/watch?v=..." 
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Thumbnail (Opsional)</label>
                    <input 
                      type="url" 
                      placeholder="URL thumbnail (auto-generate jika dikosongkan)" 
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#D71920] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer">
                    Simpan Video
                  </button>
                </form>

                {/* Video list */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Video Tersimpan</h4>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {videos.map(v => (
                      <div key={v.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/30 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-slate-850 flex items-center justify-center flex-shrink-0 text-lg">🎬</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{v.title}</p>
                          <p className="text-[10px] text-slate-600 font-mono mt-0.5">{v.src} · {v.dur} · {v.views.toLocaleString()} views</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button"
                            onClick={() => showAlert(`Play video: ${v.title}`, "Video Player", "alert")}
                            className="p-1.5 hover:bg-slate-700 rounded cursor-pointer"
                          >
                            <Eye size={11} className="text-slate-400" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteVideo(v.id)}
                            className="p-1.5 hover:bg-slate-700 rounded cursor-pointer"
                          >
                            <Trash2 size={11} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SCREEN: Dokumen ─── */}
          {activeMenu === "media-dokumen" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">MANAJEMEN DOKUMEN</h3>
                  <p className="text-xs text-slate-500 mt-1">Rilis pers, laporan, peraturan, dan dokumen publikasi</p>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 bg-[#D71920] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer"
                >
                  <PlusCircle size={13} /> Upload Dokumen
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-5 px-5 py-3 bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase">
                  <div className="col-span-2">Nama File</div>
                  <div>Tipe</div>
                  <div>Ukuran</div>
                  <div className="text-right">Aksi</div>
                </div>
                <div className="divide-y divide-slate-800">
                  {mediaFiles.filter(m => m.type === "pdf" || m.type === "doc").map(doc => (
                    <div key={doc.id} className="grid grid-cols-5 items-center px-5 py-3.5 hover:bg-slate-800/30 transition-colors group">
                      <div className="col-span-2 flex items-center gap-3">
                        <span className="text-lg">{doc.type === "pdf" ? "📄" : "📝"}</span>
                        <span className="text-xs text-white font-medium truncate">{doc.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-550 border border-slate-850 px-1.5 py-0.5 rounded uppercase">
                          {doc.name.split(".").pop()}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{doc.size}</div>
                      <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedMediaPreview(doc)}
                          className="p-1.5 hover:bg-slate-700 rounded cursor-pointer"
                        >
                          <Eye size={11} className="text-slate-400" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMedia(doc.id)}
                          className="p-1.5 hover:bg-slate-700 rounded cursor-pointer text-red-400"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── SCREEN: Optimasi Gambar ─── */}
          {activeMenu === "media-optimasi" && (
            <div className="flex flex-col gap-8">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">OPTIMASI GAMBAR</h3>
                <p className="text-xs text-slate-500 mt-1">Kompres, resize, dan konversi format gambar secara otomatis</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pengaturan Kompresi</h4>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Kualitas Output</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min={30} 
                        max={100} 
                        value={compressQuality} 
                        onChange={(e) => setCompressQuality(Number(e.target.value))} 
                        className="flex-1 accent-[#D71920]" 
                      />
                      <span className="text-xs font-mono font-bold text-white w-10 text-right">{compressQuality}%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Format Target</label>
                    <div className="flex gap-2 flex-wrap">
                      {["WebP", "AVIF", "JPEG", "PNG"].map((fmt) => (
                        <button 
                          key={fmt} 
                          onClick={() => setTargetFormat(fmt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            targetFormat === fmt ? "bg-[#D71920] border-[#D71920] text-white" : "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Ukuran Maks (px)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" defaultValue={1920} placeholder="Lebar" className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" />
                      <input type="number" defaultValue={1080} placeholder="Tinggi" className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {[
                      { id: "strip-meta", label: "Hapus metadata EXIF", checked: true },
                      { id: "progressive", label: "Progressive loading", checked: true },
                      { id: "auto-alt", label: "Generate alt text dengan AI", checked: false },
                    ].map(opt => (
                      <div key={opt.id} className="flex items-center gap-3">
                        <input type="checkbox" id={opt.id} defaultChecked={opt.checked} className="rounded" />
                        <label htmlFor={opt.id} className="text-xs text-slate-400 cursor-pointer">{opt.label}</label>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => showAlert(`Kompresi Selesai! Seluruh gambar di Media Library berhasil dioptimalkan dengan format ${targetFormat} dan kualitas ${compressQuality}%.`, "Sukses", "success")}
                    className="w-full bg-[#D71920] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer"
                  >
                    Jalankan Optimasi Sekarang
                  </button>
                </div>

                {/* Stats & history */}
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "File Dioptimasi", value: "1,247", color: "#D71920" },
                      { label: "Penghematan Total", value: "3.2 GB", color: "#10b981" },
                      { label: "Rata-rata Kompresi", value: "68%", color: "#f59e0b" },
                      { label: "Format WebP", value: "94%", color: "#3b82f6" },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                        <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Riwayat Optimasi Terakhir</h4>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { file: "hero-madura.jpg",  before: "512 KB", after: "148 KB", pct: 71 },
                        { file: "cover-pilkada.jpg", before: "284 KB", after: "89 KB",  pct: 69 },
                        { file: "infografis.png",   before: "1.2 MB", after: "380 KB", pct: 68 },
                      ].map(r => (
                        <div key={r.file} className="flex items-center gap-3 text-xs">
                          <span className="text-slate-400 flex-1 truncate font-mono text-[10px]">{r.file}</span>
                          <span className="text-slate-600 font-mono text-[10px]">{r.before}</span>
                          <span className="text-slate-600">→</span>
                          <span className="text-green-400 font-mono text-[10px] font-bold">{r.after}</span>
                          <span className="text-[10px] font-mono text-green-500 bg-green-950/50 px-1.5 py-0.5 rounded">-{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SCREEN: AI Image Generator ─── */}
          {activeMenu === "media-ai" && (
            <div className="flex flex-col gap-8">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-[#D71920]" />
                  <div>
                    <h3 className="text-xl font-bold font-sans tracking-tight">AI IMAGE GENERATOR</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Generate gambar ilustrasi artikel menggunakan AI — Powered by Imagen / DALL·E</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Prompt area */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={12} className="text-[#D71920]" /> Generator Gambar
                  </h4>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Deskripsi Gambar (Prompt)</label>
                    <textarea
                      rows={5}
                      placeholder="Contoh: Pemandangan pantai Madura saat matahari terbenam dengan perahu nelayan tradisional, gaya foto jurnalistik..."
                      value={aiGenPrompt}
                      onChange={(e) => setAiGenPrompt(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Rasio Aspek</label>
                      <select 
                        value={aiGenRatio}
                        onChange={(e) => setAiGenRatio(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                      >
                        <option>16:9 (Landscape)</option>
                        <option>1:1 (Square)</option>
                        <option>4:3</option>
                        <option>9:16 (Portrait)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Gaya Visual</label>
                      <select 
                        value={aiGenStyle}
                        onChange={(e) => setAiGenStyle(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                      >
                        <option>Foto Realistis</option>
                        <option>Ilustrasi Vektor</option>
                        <option>Infografis</option>
                        <option>Sketsa Digital</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Variasi</label>
                    <div className="flex gap-2">
                      {[1, 2, 4].map(n => (
                        <button 
                          key={n} 
                          type="button" 
                          onClick={() => setAiGenVariations(n)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            aiGenVariations === n ? "bg-[#D71920] border-[#D71920] text-white" : "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          {n}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateAiImage}
                    disabled={aiGenLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D71920] to-[#a01218] text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer mt-1 disabled:opacity-50"
                  >
                    {aiGenLoading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Membangun Gambar dengan AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Generate Gambar</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-700 font-mono text-center">Kredit tersisa: <span className="text-slate-400 font-bold">{aiGenCredits} / 100</span> gambar bulan ini</p>
                </div>

                {/* Generated image preview */}
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl aspect-video flex items-center justify-center overflow-hidden relative">
                    {aiGenLoading ? (
                      <div className="text-center">
                        <RefreshCw size={24} className="animate-spin text-[#D71920] mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-mono">Menggenerasi citra unik...</p>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <div className="text-4xl mb-3">🎨</div>
                        <p className="text-xs text-slate-450 font-mono mb-2">Gambar yang di-generate akan muncul di sini</p>
                        <p className="text-[10px] text-slate-600 max-w-xs leading-relaxed mx-auto">Setiap gambar yang di-generate akan otomatis disimpan ke Media Library untuk dapat disisipkan ke artikel.</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Pantai Lombang Sumenep", emoji: "🌅" },
                      { label: "Sidang DPRD Bangkalan", emoji: "🏛️" },
                      { label: "Festival Sapi Sono Pamekasan", emoji: "🐂" },
                      { label: "Nelayan Madura Tradisional", emoji: "⛵" },
                    ].map(ex => (
                      <button 
                        key={ex.label} 
                        type="button"
                        onClick={() => setAiGenPrompt(ex.label)}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-650 rounded-xl p-3 text-left transition-all cursor-pointer group"
                      >
                        <span className="text-lg block mb-1.5">{ex.emoji}</span>
                        <p className="text-[10px] text-slate-550 group-hover:text-slate-300 transition-colors font-mono leading-relaxed">{ex.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SCREEN: Penulis ─── */}
          {activeMenu === "redaksi-penulis" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">MANAJEMEN PENULIS</h3>
                  <p className="text-xs text-slate-500 mt-1">Daftar jurnalis dan penulis tetap portal Poros Madura</p>
                </div>
                <button 
                  onClick={() => {
                    const name = prompt("Masukkan nama jurnalis/penulis baru:");
                    const beat = prompt("Masukkan deskripsi desk liputan (misal: Politik, Ekonomi):", "Politik");
                    if (name) {
                      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                      setAuthors(prev => [...prev, {
                        id: "p-" + Date.now(),
                        name,
                        avatar: initials,
                        beat: beat || "Nasional",
                        articles: 0,
                        status: "Aktif",
                        color: "#3b82f6"
                      }]);
                    }
                  }}
                  className="flex items-center gap-1.5 bg-[#D71920] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer"
                >
                  <PlusCircle size={13} /> Tambah Penulis
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-6 px-5 py-3 bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase">
                  <div className="col-span-2">Nama</div>
                  <div>Bidang</div>
                  <div>Artikel</div>
                  <div>Status</div>
                  <div className="text-right">Aksi</div>
                </div>
                <div className="divide-y divide-slate-800">
                  {authors.map(p => (
                    <div key={p.id} className="grid grid-cols-6 items-center px-5 py-3.5 hover:bg-slate-800/30 transition-colors group">
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ backgroundColor: p.color }}>{p.avatar}</div>
                        <span className="text-xs font-bold text-white">{p.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">{p.beat}</div>
                      <div className="text-xs font-bold text-slate-300 font-mono">{p.articles}</div>
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === "Aktif" ? "bg-green-950 text-green-400 border border-green-900" :
                          p.status === "Cuti"  ? "bg-yellow-950 text-yellow-400 border border-yellow-900" :
                          "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>{p.status}</span>
                      </div>
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            const newName = prompt("Edit nama penulis:", p.name);
                            if (newName) {
                              setAuthors(prev => prev.map(x => x.id === p.id ? { ...x, name: newName } : x));
                            }
                          }}
                          className="p-1.5 hover:bg-slate-700 rounded cursor-pointer"
                        >
                          <Edit3 size={11} className="text-slate-400" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAuthor(p.id)}
                          className="p-1.5 hover:bg-slate-700 rounded cursor-pointer"
                        >
                          <Trash2 size={11} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── SCREEN: Editor ─── */}
          {activeMenu === "redaksi-editor" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">MANAJEMEN EDITOR</h3>
                  <p className="text-xs text-slate-500 mt-1">Editor yang bertugas mereview dan menyunting artikel sebelum dipublikasikan</p>
                </div>
                <button 
                  onClick={() => {
                    const name = prompt("Masukkan nama editor:");
                    const role = prompt("Masukkan peran (Redaktur, Editor Senior, Pemimpin Redaksi):", "Redaktur");
                    if (name) {
                      const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                      setEditors(prev => [...prev, {
                        name,
                        avatar: initials,
                        role: role || "Redaktur",
                        desk: "Semua",
                        approved: 0,
                        pending: 0,
                        color: "#8b5cf6"
                      }]);
                    }
                  }}
                  className="flex items-center gap-1.5 bg-[#D71920] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer"
                >
                  <PlusCircle size={13} /> Tambah Editor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {editors.map(e => (
                  <div key={e.name} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0" style={{ backgroundColor: e.color }}>{e.avatar}</div>
                      <div>
                        <p className="text-sm font-bold text-white">{e.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{e.role}</p>
                        <p className="text-[10px] text-slate-600 font-mono">Desk: {e.desk}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950 rounded-lg p-3 text-center">
                        <p className="text-lg font-black text-green-400">{e.approved}</p>
                        <p className="text-[10px] text-slate-600 font-mono">Disetujui</p>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-3 text-center">
                        <p className="text-lg font-black text-yellow-400">{e.pending}</p>
                        <p className="text-[10px] text-slate-600 font-mono">Menunggu</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SCREEN: Kontributor ─── */}
          {activeMenu === "redaksi-kontributor" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">KONTRIBUTOR</h3>
                  <p className="text-xs text-slate-500 mt-1">Penulis lepas dan koresponden daerah yang berkontribusi ke portal</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kontributor list */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kontributor Aktif</h4>
                    <span className="text-[10px] font-mono text-slate-600">{contributors.length} kontributor</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {contributors.map(k => (
                      <div key={k.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/30 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                          {k.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white">{k.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{k.region} · {k.articles} artikel · {k.rate}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              const newRate = prompt("Ubah rate honorarium kontributor:", k.rate);
                              if (newRate) {
                                setContributors(prev => prev.map(c => c.id === k.id ? { ...c, rate: newRate } : c));
                              }
                            }}
                            className="p-1.5 hover:bg-slate-700 rounded cursor-pointer"
                          >
                            <Edit3 size={11} className="text-slate-400" />
                          </button>
                          <button 
                            onClick={() => handleDeleteContributor(k.id)}
                            className="p-1.5 hover:bg-slate-700 rounded cursor-pointer"
                          >
                            <Trash2 size={11} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Undang form */}
                <form onSubmit={handleAddContributor} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <PlusCircle size={13} className="text-[#D71920]" /> Undang Kontributor Baru
                  </h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nama kontributor..." 
                      value={newContributorName}
                      onChange={(e) => setNewContributorName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email</label>
                    <input 
                      type="email" 
                      placeholder="email@kontributor.com" 
                      value={newContributorEmail}
                      onChange={(e) => setNewContributorEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Wilayah Liputan</label>
                    <select 
                      value={newContributorRegion}
                      onChange={(e) => setNewContributorRegion(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]"
                    >
                      <option>Bangkalan</option>
                      <option>Sampang</option>
                      <option>Pamekasan</option>
                      <option>Sumenep</option>
                      <option>Surabaya</option>
                      <option>Jakarta</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Rate Honorarium</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Rp 75.000/artikel" 
                      value={newContributorRate}
                      onChange={(e) => setNewContributorRate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#D71920] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer">
                    Kirim Undangan
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── SCREEN: Approval Artikel ─── */}
          {activeMenu === "redaksi-approval" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">APPROVAL ARTIKEL</h3>
                  <p className="text-xs text-slate-500 mt-1">Artikel yang menunggu persetujuan editor sebelum dipublikasikan</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-yellow-950 text-yellow-400 border border-yellow-900 px-2.5 py-1 rounded-full font-bold">
                    {articles.filter(a => a.status === "pending" || a.status === "review" || a.status === "draft").length} artikel antrean
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {articles.filter(a => a.status === "pending" || a.status === "review" || a.status === "draft").map(a => (
                  <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] font-black text-yellow-400 bg-yellow-950 border border-yellow-900 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {a.status?.toUpperCase() || "PENDING"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">{a.category}</span>
                        </div>
                        <h5 className="text-sm font-bold text-white leading-snug mb-1">{a.title}</h5>
                        <p className="text-[10px] text-slate-500 font-mono">{a.author} · Dikirim {new Date(a.publishDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={() => handleArticleDecision(a.id, "published")}
                          className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-green-950 text-green-400 border border-green-900 hover:bg-green-900 transition-colors cursor-pointer"
                        >
                          ✓ Setujui
                        </button>
                        <button 
                          onClick={() => handleArticleDecision(a.id, "review")}
                          className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition-colors cursor-pointer"
                        >
                          Revisi
                        </button>
                        <button 
                          onClick={() => handleArticleDecision(a.id, "draft")}
                          className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-red-950/50 text-red-400 border border-red-900/50 hover:bg-red-950 transition-colors cursor-pointer"
                        >
                          ✕ Tolak
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {articles.filter(a => a.status === "pending" || a.status === "review" || a.status === "draft").length === 0 && (
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-8 text-center text-slate-500">
                    Tidak ada artikel yang sedang menunggu peninjauan saat ini.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── SCREEN: Penugasan Liputan ─── */}
          {activeMenu === "redaksi-penugasan" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">PENUGASAN LIPUTAN</h3>
                  <p className="text-xs text-slate-500 mt-1">Kelola dan distribusikan penugasan liputan kepada jurnalis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active assignments */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Penugasan Aktif</h4>
                  {assignments.map(t => (
                    <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all group animate-fade-in">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              t.priority === "high"   ? "bg-red-950 text-red-400 border border-red-900" :
                              t.priority === "medium" ? "bg-yellow-950 text-yellow-400 border border-yellow-900" :
                              "bg-slate-800 text-slate-500 border border-slate-700"
                            }`}>{t.priority}</span>
                            <span className="text-[10px] text-slate-600 font-mono">{t.location}</span>
                          </div>
                          <p className="text-xs font-bold text-white leading-snug">{t.title}</p>
                          {t.brief && <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{t.brief}</p>}
                          <p className="text-[10px] text-slate-500 font-mono mt-1">{t.journalist} · Deadline: {t.deadline}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              const newTitle = prompt("Edit judul liputan:", t.title);
                              if (newTitle) setAssignments(prev => prev.map(a => a.id === t.id ? { ...a, title: newTitle } : a));
                            }}
                            className="p-1.5 hover:bg-slate-700 rounded cursor-pointer"
                          >
                            <Edit3 size={11} className="text-slate-400" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAssignment(t.id)}
                            className="p-1.5 hover:bg-slate-700 rounded cursor-pointer text-red-400"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* New assignment form */}
                <form onSubmit={handleAddAssignment} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Buat Penugasan Baru</h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Judul Liputan</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Topik atau judul sementara..." 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tugaskan ke</label>
                      <select 
                        value={newTaskJournalist}
                        onChange={(e) => setNewTaskJournalist(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                      >
                        {authors.map(a => (
                          <option key={a.id} value={a.name}>{a.name} ({a.beat})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Wilayah Liputan</label>
                      <select 
                        value={newTaskLocation}
                        onChange={(e) => setNewTaskLocation(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                      >
                        <option>Bangkalan</option>
                        <option>Sampang</option>
                        <option>Pamekasan</option>
                        <option>Sumenep</option>
                        <option>Kepulauan</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Deadline</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Besok 09.00" 
                        value={newTaskDeadline}
                        onChange={(e) => setNewTaskDeadline(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Prioritas</label>
                      <select 
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Brief Liputan (Instruksi)</label>
                    <textarea 
                      rows={3} 
                      placeholder="Instruksi khusus untuk wartawan..." 
                      value={newTaskBrief}
                      onChange={(e) => setNewTaskBrief(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none resize-none" 
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#D71920] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer">
                    Kirim Penugasan
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── SCREEN: Kalender Editorial ─── */}
          {activeMenu === "redaksi-kalender" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">KALENDER EDITORIAL</h3>
                  <p className="text-xs text-slate-500 mt-1">Rencana publikasi dan agenda liputan tim redaksi</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer">← Juli</button>
                  <span className="text-xs font-bold text-white px-2">Juli 2026</span>
                  <button className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer">Agus →</button>
                </div>
              </div>

              {/* Calendar grid */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-800">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(d => (
                    <div key={d} className="py-2.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {[
                    { day: null }, { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5, event: "Pilkada", color: "#D71920" }, { day: 6 },
                    { day: 7, event: "Liputan Sapi", color: "#f59e0b" }, { day: 8 }, { day: 9 }, { day: 10, event: "Rapat Redaksi", color: "#3b82f6" }, { day: 11 }, { day: 12 }, { day: 13 },
                    { day: 14 }, { day: 15, event: "HUT Pamekasan", color: "#10b981" }, { day: 16 }, { day: 17, event: "Paripurna DPRD", color: "#D71920" }, { day: 18 }, { day: 19 }, { day: 20 },
                    { day: 21 }, { day: 22 }, { day: 23, event: "Deadline Lap.", color: "#8b5cf6" }, { day: 24 }, { day: 25 }, { day: 26 }, { day: 27, isToday: true } ,
                    { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 }, { day: null }, { day: null }, { day: null },
                  ].map((cell, i) => (
                    <div key={i} className={`min-h-[72px] border-b border-r border-slate-800 p-2 ${
                      cell.isToday ? "bg-[#D71920]/10" : cell.day ? "hover:bg-slate-800/40" : "bg-slate-950/50"
                    } transition-colors cursor-pointer`}>
                      {cell.day && (
                        <>
                          <span className={`text-xs font-bold block mb-1 ${
                            cell.isToday ? "text-[#D71920]" : "text-slate-400"
                          }`}>{cell.day}</span>
                          {cell.event && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded block truncate" style={{ backgroundColor: (cell.color || "#3b82f6") + "22", color: cell.color || "#3b82f6", border: `1px solid ${(cell.color || "#3b82f6")}40` }}>
                              {cell.event}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming events */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Agenda Mendatang</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { date: "7 Jul",  title: "Rapat Redaksi Mingguan",          type: "Rapat",   color: "#3b82f6" },
                    { date: "10 Jul", title: "Paripurna DPRD Bangkalan",        type: "Liputan", color: "#D71920" },
                    { date: "15 Jul", title: "HUT Kabupaten Pamekasan ke-496",   type: "Event",   color: "#10b981" },
                    { date: "17 Jul", title: "Sidang Paripurna DPRD Sumenep",   type: "Liputan", color: "#D71920" },
                    { date: "23 Jul", title: "Deadline Laporan Semester I 2026", type: "Deadline",color: "#8b5cf6" },
                  ].map(ev => (
                    <div key={ev.title} className="flex items-center gap-4">
                      <div className="w-14 text-center flex-shrink-0">
                        <span className="text-[10px] font-black text-white font-mono">{ev.date}</span>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{ev.title}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border flex-shrink-0" style={{ color: ev.color, borderColor: ev.color + "40", backgroundColor: ev.color + "12" }}>{ev.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── SCREEN: Polling ─── */}
          {activeMenu === "interaksi-polling" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">POLLING INTERAKTIF</h3>
                  <p className="text-xs text-slate-500 mt-1">Jajak pendapat pengunjung seputar isu sosial-politik di Madura</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active Polls Progress */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Polling Aktif</h4>
                    <span className="bg-green-950 text-green-400 border border-green-900 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">LIVE</span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-200 leading-relaxed mb-4">"Menurut Anda, apa prioritas utama pembangunan infrastruktur di Madura untuk 5 tahun ke depan?"</h5>
                    
                    <div className="flex flex-col gap-4">
                      {polls.map(o => (
                        <div key={o.option} className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-350 font-medium">{o.option}</span>
                            <span className="text-slate-500 font-bold font-mono">{o.pct}% ({o.votes} vote)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                            <div className="bg-[#D71920] h-full rounded-full transition-all duration-500" style={{ width: `${o.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 border-t border-slate-800 pt-3">
                    <span>Total Responden: <strong className="text-white">{polls.reduce((sum, o) => sum + o.votes, 0).toLocaleString()}</strong></span>
                    <span>Sifat: Terbuka untuk umum</span>
                  </div>
                </div>

                {/* Create Poll Form */}
                <form onSubmit={handleAddPoll} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <PlusCircle size={13} className="text-[#D71920]" /> Buat Polling Baru
                  </h4>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Pertanyaan Polling</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masukkan pertanyaan..." 
                      value={newPollQuestion}
                      onChange={(e) => setNewPollQuestion(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920]" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Pilihan Jawaban</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        required
                        placeholder="Opsi A..."
                        value={newPollOptionA}
                        onChange={(e) => setNewPollOptionA(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none" 
                      />
                      <input 
                        type="text" 
                        required
                        placeholder="Opsi B..."
                        value={newPollOptionB}
                        onChange={(e) => setNewPollOptionB(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none" 
                      />
                      <button 
                        type="button"
                        onClick={handleAddPollOption}
                        className="text-[10px] text-slate-500 hover:text-white font-mono self-start mt-0.5 cursor-pointer"
                      >
                        + Tambah Opsi Lainnya
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-[#D71920] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer mt-1">
                    Terbitkan Polling
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── SCREEN: Voting ─── */}
          {activeMenu === "interaksi-voting" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">VOTING EDITORIAL</h3>
                  <p className="text-xs text-slate-500 mt-1">Ajang pemilihan/voting terstruktur oleh redaksi (e.g. Tokoh Inspiratif Madura 2026)</p>
                </div>
                <button 
                  onClick={() => {
                    const name = prompt("Nama Nominee baru:");
                    const role = prompt("Kategori/Peran:");
                    if (name) {
                      setNominees(prev => {
                        const next = [...prev, { rank: prev.length + 1, name, role: role || "Tokoh", votes: 1, pct: 0, color: "#8b5cf6" }];
                        const total = next.reduce((sum, x) => sum + x.votes, 0);
                        return next.map(x => ({ ...x, pct: Math.round((x.votes / total) * 100) }));
                      });
                    }
                  }}
                  className="flex items-center gap-1.5 bg-[#D71920] text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#D71920]/90 transition-colors cursor-pointer"
                >
                  <PlusCircle size={13} /> Voting Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Voting Info & Category list */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ajang Voting Aktif</h4>
                  <div className="border-l-2 border-[#D71920] pl-3 py-1">
                    <p className="text-xs font-bold text-white">Tokoh Tokoh Inspiratif Madura 2026</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Kategori: Tokoh Muda Berbakat</p>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800/80 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-550">Total Suara:</span>
                      <span className="text-white font-bold font-mono">
                        {nominees.reduce((sum, n) => sum + n.votes, 0).toLocaleString()} vote
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550">Sistem Vote:</span>
                      <span className="text-white font-bold font-mono">IP + Akun Verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550">Mulai:</span>
                      <span className="text-white font-bold font-mono">01 Jul 2026</span>
                    </div>
                  </div>
                </div>

                {/* Nominee Standings */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Klasemen Sementara Nominee (Klik untuk tambah suara simulasi)</h4>
                  
                  <div className="flex flex-col gap-5">
                    {nominees.map(n => (
                      <div key={n.name} className="flex items-center gap-4 group">
                        <div className="w-7 h-7 bg-slate-950 rounded-full flex items-center justify-center font-mono font-bold text-xs text-slate-500 border border-slate-800">#{n.rank}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <div>
                              <p className="text-xs font-bold text-white truncate">{n.name}</p>
                              <p className="text-[10px] text-slate-550 font-mono mt-0.5">{n.role}</p>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 font-bold">{n.pct}% ({n.votes.toLocaleString()})</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${n.pct}%`, backgroundColor: n.color }} />
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setNominees(prev => {
                              const next = prev.map(x => x.name === n.name ? { ...x, votes: x.votes + 100 } : x);
                              const total = next.reduce((sum, x) => sum + x.votes, 0);
                              return next.map(x => ({ ...x, pct: Math.round((x.votes / total) * 100) }));
                            });
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-mono font-bold cursor-pointer transition-colors"
                        >
                          +100 Suara
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SCREEN: Feedback Pembaca ─── */}
          {activeMenu === "interaksi-feedback" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">FEEDBACK PEMBACA</h3>
                  <p className="text-xs text-slate-500 mt-1">Aspirasi, kritik, saran, dan laporan dari formulir kontak portal</p>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={feedbackFilter}
                    onChange={(e) => setFeedbackFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-350 focus:outline-none"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Laporan Bug">Laporan Bug</option>
                    <option value="Saran">Saran</option>
                    <option value="Kritik">Kritik</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 font-bold">
                    {feedbacks.filter(f => f.status === "unread").length} Belum Dibaca
                  </span>
                </div>
              </div>

              {/* Feedbacks table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-6 px-5 py-3 bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase">
                  <div className="col-span-2">Pengirim</div>
                  <div>Kategori</div>
                  <div className="col-span-2">Pesan</div>
                  <div className="text-right">Aksi</div>
                </div>

                <div className="divide-y divide-slate-800">
                  {feedbacks.filter(f => feedbackFilter === "Semua" ? true : f.cat === feedbackFilter).map(f => (
                    <div key={f.id} className={`grid grid-cols-6 items-center px-5 py-4 hover:bg-slate-800/30 transition-colors group ${
                      f.status === "unread" ? "bg-[#D71920]/5 border-l-2 border-[#D71920]" : ""
                    }`}>
                      <div className="col-span-2">
                        <span className="text-xs font-bold text-white block">{f.name}</span>
                        <span className="text-[10px] text-slate-550 font-mono">{f.email}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          f.cat === "Laporan Bug" ? "bg-red-950/30 text-red-400 border-red-900/50" :
                          f.cat === "Saran"       ? "bg-green-950/30 text-green-400 border-green-900/50" :
                          "bg-slate-800 text-slate-450 border-slate-700"
                        }`}>{f.cat}</span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-350 truncate">{f.text}</p>
                        <span className="text-[9px] text-slate-650 font-mono block mt-0.5">{f.date}</span>
                      </div>
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {f.status === "unread" && (
                          <button 
                            onClick={() => handleMarkFeedbackRead(f.id)}
                            className="px-2 py-1 text-[10px] font-bold rounded bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Tandai Dibaca
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteFeedback(f.id)}
                          className="p-1 hover:bg-slate-700 rounded text-red-400 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {feedbacks.filter(f => feedbackFilter === "Semua" ? true : f.cat === feedbackFilter).length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      Tidak ada pesan feedback untuk kategori ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Ad Manager - Removed */}

          {/* SCREEN: Moderasi Komentar */}
          {activeMenu === "komentar-moderasi" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">MODERASI KOMENTAR PUBLIK</h3>
                  <p className="text-xs text-slate-500 mt-1">Tinjau dan kelola komentar aktif pembaca portal</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-400">
                    <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase font-mono border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Penulis</th>
                        <th className="px-4 py-3">Konten Komentar</th>
                        <th className="px-4 py-3 text-center">Disukai (Likes)</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {comments.map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">{c.author}</td>
                          <td className="px-4 py-3.5 max-w-md">
                            <p className="line-clamp-2">{c.content}</p>
                            <span className="text-[10px] text-slate-550 font-mono block mt-1">Slug: {c.articleSlug || "Komentar Global"}</span>
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-300">{c.likes}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="bg-green-950 text-green-400 border border-green-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase">APPROVED</span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button 
                              onClick={() => handleDeleteComment(c.id, c.articleSlug || "")}
                              className="text-red-400 hover:text-red-300 font-bold transition-colors text-[11px] cursor-pointer"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                      {comments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                            Tidak ada komentar aktif.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Spam */}
          {activeMenu === "komentar-spam" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">KOMENTAR SPAM</h3>
                  <p className="text-xs text-slate-500 mt-1">Komentar yang dideteksi otomatis sebagai spam iklan atau rujukan mencurigakan</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-400">
                    <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase font-mono border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Spammer</th>
                        <th className="px-4 py-3">Isi Pesan</th>
                        <th className="px-4 py-3">Lokasi Artikel</th>
                        <th className="px-4 py-3 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {spamComments.map(s => (
                        <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">{s.author}</td>
                          <td className="px-4 py-3.5 max-w-md">
                            <p className="text-red-400 font-mono text-[11px]">{s.content}</p>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[10px] text-slate-500">{s.articleSlug}</td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex gap-3 justify-end items-center">
                              <button 
                                onClick={() => handleRestoreSpam(s.id)}
                                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors text-[11px] cursor-pointer"
                              >
                                Pulihkan
                              </button>
                              <button 
                                onClick={() => handleDeleteSpamPermanently(s.id)}
                                className="text-red-400 hover:text-red-300 font-bold transition-colors text-[11px] cursor-pointer"
                              >
                                Hapus Selamanya
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {spamComments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-500 text-xs">
                            Kliping spam bersih! Tidak ada komentar terindikasi spam.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Blacklist Kata */}
          {activeMenu === "komentar-blacklist" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">BLACKLIST KATA SENSOR</h3>
                  <p className="text-xs text-slate-500 mt-1">Blokir atau moderasi otomatis komentar yang mengandung kata-kata di bawah ini</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form to add blacklist word */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Tambah Kata Baru</h4>
                  <form onSubmit={handleAddBlacklistWord} className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 font-mono">Kata/Frasa Terlarang</label>
                      <input 
                        type="text"
                        value={newBlacklistWord}
                        onChange={(e) => setNewBlacklistWord(e.target.value)}
                        placeholder="Contoh: judol, penipu"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] focus:border-[#D71920]"
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer font-mono uppercase tracking-wider">
                      Tambahkan ke Blacklist
                    </button>
                  </form>
                </div>

                {/* List of blacklist words */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Kata Aktif Ter-Blacklist</h4>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {blacklistWords.map(w => (
                      <span key={w} className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-full text-xs font-bold text-slate-300 font-mono">
                        <span>{w}</span>
                        <button 
                          onClick={() => handleRemoveBlacklistWord(w)}
                          className="text-red-500 hover:text-red-400 font-black cursor-pointer ml-1 text-[11px]"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {blacklistWords.length === 0 && (
                      <span className="text-xs text-slate-500 italic p-4">Tidak ada kata blacklist aktif. Komentar disaring standar.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Laporan Pengguna */}
          {activeMenu === "komentar-laporan" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">LAPORAN ADUAN KOMENTAR</h3>
                  <p className="text-xs text-slate-500 mt-1">Laporan aduan pembaca terhadap komentar yang dinilai melanggar etika</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-400">
                    <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase font-mono border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Aduan Pelapor</th>
                        <th className="px-4 py-3">Kategori Pelanggaran</th>
                        <th className="px-4 py-3">Komentar Yang Dilaporkan</th>
                        <th className="px-4 py-3 text-right">Tindakan Mod</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {reportedComments.map(r => (
                        <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-bold text-white block">{r.reporter}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{r.date}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-950/40 text-yellow-400 border border-yellow-900/50">
                              {r.reason}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 max-w-sm">
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Penulis: {r.author}</span>
                            <p className="line-clamp-2 text-[11px] text-slate-350">{r.content}</p>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex gap-3 justify-end items-center">
                              <button 
                                onClick={() => handleDismissReport(r.id)}
                                className="text-slate-400 hover:text-white font-bold transition-colors text-[11px] cursor-pointer"
                              >
                                Abaikan Laporan
                              </button>
                              <button 
                                onClick={() => handleDeleteReportedComment(r.id, r.commentId || r.id)}
                                className="text-red-400 hover:text-red-300 font-bold transition-colors text-[11px] cursor-pointer"
                              >
                                Hapus Komentar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {reportedComments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-500 text-xs">
                            Bersih! Tidak ada laporan aduan komentar masuk.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Newsletter Subscribers */}
          {activeMenu === "newsletter" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">MANAJEMEN SUBSCRIBERS & NEWSLETTER</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Send broadcast form */}
                <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Kirim Siaran Newsletter</h4>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Subjek Email *</label>
                      <input 
                        type="text" 
                        placeholder="Berita Terpenting Pagi Ini - Poros Madura"
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Template Pesan Konten *</label>
                      <textarea 
                        rows={6}
                        placeholder="Tuliskan berita pilihan utama dan kurasi link..."
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                    <button className="bg-[#D71920] text-white font-bold py-2.5 rounded-lg text-xs hover:bg-[#D71920]/95 shadow-md cursor-pointer">
                      Broadcast ke {subscribers.length} Subscribers
                    </button>
                  </div>
                </div>

                {/* Subscribers list column */}
                <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Daftar Langganan</h4>
                  <div className="flex flex-col gap-3.5 divide-y divide-slate-800">
                    {subscribers.map((sub, idx) => (
                      <div key={idx} className="pt-2 text-xs font-mono font-semibold text-slate-300 flex justify-between">
                        <span>{sub}</span>
                        <span className="text-[10px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}



          {/* SCREEN: Market Widget */}
          {activeMenu === "market" && (
            <div className="flex flex-col gap-8 max-w-5xl">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">KONTROL ENTERPRISE MARKET LIVE WIDGET</h3>
                <span className="text-xs text-slate-400">Arsitektur Multi-Provider & Caching Terpadu</span>
              </div>

              {marketSaveSuccess && (
                <div className="p-4 bg-green-900/40 border border-green-700 text-green-400 rounded-lg text-xs font-bold animate-pulse flex items-center gap-2">
                  <CheckSquare size={16} />
                  <span>{marketSaveSuccess}</span>
                </div>
              )}

              {/* Grid: 1. Status Real-Time & 2. Global Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:col-span-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Nilai Terakhir di Cache (Sistem)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">IHSG</span>
                      <span className="text-base font-black text-white block mt-1">
                        {marketUpdates.ihsg && typeof marketUpdates.ihsg === "object" && typeof marketUpdates.ihsg.price === "number"
                          ? marketUpdates.ihsg.price.toLocaleString("id-ID")
                          : "Loading..."}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-1 block">
                        Provider: <span className="font-mono text-emerald-400 uppercase">{(marketUpdates.ihsg && typeof marketUpdates.ihsg === "object" && marketUpdates.ihsg.provider) || "yahoo"}</span>
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">USD / IDR</span>
                      <span className="text-base font-black text-white block mt-1">
                        {marketUpdates.usd && typeof marketUpdates.usd === "object" && typeof marketUpdates.usd.price === "number"
                          ? "Rp " + marketUpdates.usd.price.toLocaleString("id-ID")
                          : "Loading..."}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-1 block">
                        Provider: <span className="font-mono text-emerald-400 uppercase">{(marketUpdates.usd && typeof marketUpdates.usd === "object" && marketUpdates.usd.provider) || "yahoo"}</span>
                      </span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Emas LM Antam</span>
                      {marketUpdates.gold && typeof marketUpdates.gold === "object" ? (
                        <>
                          <span className="text-xs font-semibold text-slate-300 block mt-1">
                            Beli: <span className="text-sm font-black text-white">Rp {typeof marketUpdates.gold.price === "number" ? marketUpdates.gold.price.toLocaleString("id-ID") : "-"}</span>
                          </span>
                          <span className="text-xs font-semibold text-slate-300 block">
                            Jual: <span className="text-sm font-black text-white">Rp {typeof marketUpdates.gold.buybackPrice === "number" ? marketUpdates.gold.buybackPrice.toLocaleString("id-ID") : "-"}</span>
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-black text-white block mt-1">Loading...</span>
                      )}
                      <span className="text-[9px] text-slate-400 mt-1 block">
                        Provider: <span className="font-mono text-emerald-400 uppercase">{(marketUpdates.gold && typeof marketUpdates.gold === "object" && marketUpdates.gold.provider) || "logammulia"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visibilitas Publik</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                      Tentukan apakah widget informasi finansial ditampilkan kepada pengunjung beranda publik.
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-xs font-bold text-white">Status Widget</span>
                    <button
                      type="button"
                      onClick={() => setMarketEnabled(!marketEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${marketEnabled ? "bg-[#D71920]" : "bg-slate-700"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${marketEnabled ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Config Form */}
              <form onSubmit={handleSaveMarketSettings} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3">
                  PENGATURAN ADAPTER PROVIDER & INTEGRASI CRON JOB
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* IHSG */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1E40AF]"></span>
                        Indeks IHSG
                      </span>
                      <input 
                        type="checkbox" 
                        checked={displayIhsg}
                        onChange={(e) => setDisplayIhsg(e.target.checked)}
                        className="rounded border-slate-800 text-[#D71920] focus:ring-0 w-4 h-4 cursor-pointer text-[#D71920] focus:ring-offset-slate-950"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Indeks harga saham gabungan Bursa Efek Indonesia (IDX).
                    </p>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Provider Aktif (Adapter)</label>
                      <select 
                        disabled={!displayIhsg}
                        value={ihsgProvider}
                        onChange={(e) => setIhsgProvider(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] disabled:opacity-40"
                      >
                        <option value="yahoo">Yahoo Finance API (Utama)</option>
                        <option value="reserve">ReserveAdapter (Cadangan Lokal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Interval Update (Cron)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min={10} 
                          disabled={!displayIhsg}
                          value={ihsgInterval}
                          onChange={(e) => setIhsgInterval(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] disabled:opacity-40"
                        />
                        <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-500 font-mono">detik</span>
                      </div>
                    </div>
                  </div>

                  {/* USD */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        USD / IDR Rupiah
                      </span>
                      <input 
                        type="checkbox" 
                        checked={displayUsd}
                        onChange={(e) => setDisplayUsd(e.target.checked)}
                        className="rounded border-slate-800 text-[#D71920] focus:ring-0 w-4 h-4 cursor-pointer text-[#D71920] focus:ring-offset-slate-950"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Nilai tukar mata uang dollar amerika serikat terhadap rupiah Indonesia.
                    </p>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Provider Aktif (Adapter)</label>
                      <select 
                        disabled={!displayUsd}
                        value={usdProvider}
                        onChange={(e) => setUsdProvider(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] disabled:opacity-40"
                      >
                        <option value="yahoo">Yahoo Finance (Utama)</option>
                        <option value="exchangerate">exchangerate.host</option>
                        <option value="twelvedata">TwelveData (API Key)</option>
                        <option value="fixer">Fixer.io (API Key)</option>
                        <option value="openexchange">Open Exchange Rates (API Key)</option>
                        <option value="reserve">ReserveAdapter (Cadangan Lokal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Interval Update (Cron)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min={10} 
                          disabled={!displayUsd}
                          value={usdInterval}
                          onChange={(e) => setUsdInterval(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] disabled:opacity-40"
                        />
                        <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-500 font-mono">detik</span>
                      </div>
                    </div>
                  </div>

                  {/* Gold */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Emas Antam LM
                      </span>
                      <input 
                        type="checkbox" 
                        checked={displayGold}
                        onChange={(e) => setDisplayGold(e.target.checked)}
                        className="rounded border-slate-800 text-[#D71920] focus:ring-0 w-4 h-4 cursor-pointer text-[#D71920] focus:ring-offset-slate-950"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Harga emas batangan Logam Mulia sertifikasi Antam Indonesia (per gram).
                    </p>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Provider Aktif (Adapter)</label>
                      <select 
                        disabled={!displayGold}
                        value={goldProvider}
                        onChange={(e) => setGoldProvider(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] disabled:opacity-40"
                      >
                        <option value="logammulia">Logam Mulia Scraping (Utama)</option>
                        <option value="pegadaian">Pegadaian Scraping (Cadangan)</option>
                        <option value="reserve">ReserveAdapter (Cadangan Lokal)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Interval Update (Cron)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          min={10} 
                          disabled={!displayGold}
                          value={goldInterval}
                          onChange={(e) => setGoldInterval(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] disabled:opacity-40"
                        />
                        <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-500 font-mono">detik</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-800 pt-5">
                  <button 
                    type="submit"
                    className="bg-[#D71920] hover:bg-[#D71920]/95 text-slate-950 font-black text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <CheckSquare size={15} />
                    <span>Simpan Pengaturan Market</span>
                  </button>
                </div>
              </form>

              {/* Logs section */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    LOG AUDIT & EXCEPTION TRACKING (MARKET DATA SERVICE)
                  </h4>
                  <button 
                    type="button" 
                    onClick={loadMarketSettings}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Refresh Logs</span>
                  </button>
                </div>
                
                <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                  Log cron scheduler di bawah ini melacak setiap aktivitas penarikan API, penggunaan cache, dan proses recovery kegagalan provider secara transparan.
                </p>

                <div className="bg-slate-950 border border-slate-800 rounded-lg max-h-80 overflow-y-auto font-mono text-[11px] p-4 divide-y divide-slate-900 flex flex-col">
                  {marketLogs.length === 0 ? (
                    <span className="text-slate-500 text-center py-6">Tidak ada log aktivitas market saat ini.</span>
                  ) : (
                    marketLogs.map((log: any, idx: number) => {
                      const logMsg = log.message || "";
                      const isError = log.level === "error" || logMsg.toLowerCase().includes("error") || logMsg.toLowerCase().includes("fail");
                      const isWarn = log.level === "warn" || logMsg.toLowerCase().includes("warn") || logMsg.toLowerCase().includes("fallback");
                      const logTime = log.timestamp ? new Date(log.timestamp).toLocaleTimeString("id-ID") : "";
                      
                      return (
                        <div key={idx} className="py-2 flex gap-4 items-start first:pt-0 last:pb-0">
                          <span className="text-slate-500 shrink-0 select-none">
                            {logTime}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 select-none ${
                            isError ? "bg-red-900/40 text-red-400 border border-red-800" :
                            isWarn ? "bg-amber-900/40 text-amber-400 border border-amber-800" :
                            "bg-slate-800 text-slate-300"
                          }`}>
                            {log.level || "info"}
                          </span>
                          <p className={`flex-1 leading-relaxed ${
                            isError ? "text-red-400" :
                            isWarn ? "text-amber-400" :
                            "text-slate-300"
                          }`}>
                            {logMsg}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: SEO - Sitemap */}
          {activeMenu === "seo-sitemap" && (() => {
            const renderDynamicSitemapText = () => {
              if (sitemapLoading) return "Menghasilkan XML...";
              if (!sitemapStatus || !sitemapStatus.files) {
                return "Belum ada sitemap yang dibuat di server. Klik 'Buat Ulang Sitemap' untuk membuatnya.";
              }
              let lines = [
                `<?xml version="1.0" encoding="UTF-8"?>`,
                `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
              ];
              sitemapStatus.files.filter((f: any) => f.name !== "sitemap.xml").forEach((file: any) => {
                lines.push(
                  `  <sitemap>`,
                  `    <loc>${file.url}</loc>`,
                  `    <lastmod>${file.updatedAt.split("T")[0]}</lastmod>`,
                  `  </sitemap>`
                );
              });
              lines.push(`</sitemapindex>`);
              return lines.join("\n");
            };

            return (
              <div className="flex flex-col gap-8 animate-scale-up">
                <div className="border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-bold font-sans tracking-tight">MANAJEMEN SITEMAP XML</h3>
                  <p className="text-xs text-slate-500 mt-1">Kelola indeks sitemap mesin telusur secara otomatis</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 flex flex-col gap-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2 font-sans">Sitemap XML Generasi Otomatis (sitemap.xml)</span>
                    
                    <div className="bg-slate-950 p-4 rounded-lg font-mono text-[11px] text-[#D71920] overflow-x-auto border border-slate-800 max-h-64 overflow-y-auto whitespace-pre">
                      {renderDynamicSitemapText()}
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button 
                        onClick={handleRegenerateSitemap} 
                        disabled={sitemapLoading}
                        className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {sitemapLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          "Buat Ulang Sitemap"
                        )}
                      </button>
                      <a href="/sitemap.xml" target="_blank" className="bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer text-center flex items-center justify-center">
                        Lihat XML Utama
                      </a>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">Status & Kriteria Sitemap</span>
                    
                    <div className="flex flex-col gap-2 font-semibold text-xs border-b border-slate-800 pb-4 mb-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">File URL Utama</span>
                        <a href="/sitemap.xml" target="_blank" className="text-sky-400 hover:underline font-mono">/sitemap.xml</a>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">Total Tautan</span>
                        <span className="text-white font-mono">{sitemapStatus?.totalUrls || 0} URL</span>
                      </div>
                      {sitemapStatus?.generatedAt && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-400">Dibuat Pada</span>
                          <span className="text-slate-300 font-mono text-[10px]">{new Date(sitemapStatus.generatedAt).toLocaleString("id-ID")}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 mb-2">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="sm-articles" 
                          checked={sitemapArticles} 
                          onChange={(e) => setSitemapArticles(e.target.checked)} 
                          className="rounded accent-[#D71920]" 
                        />
                        <label htmlFor="sm-articles" className="text-xs text-slate-300 font-bold cursor-pointer">Sertakan Halaman Artikel</label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="sm-cats" 
                          checked={sitemapCategories} 
                          onChange={(e) => setSitemapCategories(e.target.checked)} 
                          className="rounded accent-[#D71920]" 
                        />
                        <label htmlFor="sm-cats" className="text-xs text-slate-300 font-bold cursor-pointer">Sertakan Halaman Kategori</label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="sm-tags" 
                          checked={sitemapTags} 
                          onChange={(e) => setSitemapTags(e.target.checked)} 
                          className="rounded accent-[#D71920]" 
                        />
                        <label htmlFor="sm-tags" className="text-xs text-slate-300 font-bold cursor-pointer">Sertakan Halaman Tag</label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="sm-authors" 
                          checked={sitemapAuthors} 
                          onChange={(e) => setSitemapAuthors(e.target.checked)} 
                          className="rounded accent-[#D71920]" 
                        />
                        <label htmlFor="sm-authors" className="text-xs text-slate-300 font-bold cursor-pointer">Sertakan Halaman Penulis</label>
                      </div>
                    </div>

                    {sitemapStatus?.files && sitemapStatus.files.length > 0 && (
                      <div className="flex flex-col gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1 mb-1 font-sans">Berkas Sitemap Individu</span>
                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                          {sitemapStatus.files.map((file: any) => (
                            <div key={file.name} className="flex justify-between items-center text-xs py-1 hover:bg-slate-800 px-2 rounded transition-colors border border-transparent hover:border-slate-700">
                              <a href={`/${file.name}`} target="_blank" className="text-sky-400 hover:underline font-mono text-[10px]">{file.name}</a>
                              <span className="text-slate-300 font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded">{file.count} URL</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SCREEN: SEO - Robots.txt */}
          {activeMenu === "seo-robots" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">ROBOTS.TXT EDITOR</h3>
                <p className="text-xs text-slate-500 mt-1">Sesuaikan instruksi crawling untuk bot mesin telusur</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl flex flex-col gap-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Konten Berkas Robots.txt</span>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      const el = document.getElementById("robots-area") as HTMLTextAreaElement;
                      if (el) el.value = "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: http://localhost:3000/sitemap.xml";
                    }} className="text-[10px] bg-slate-850 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded font-bold cursor-pointer">Default</button>
                    <button onClick={() => {
                      const el = document.getElementById("robots-area") as HTMLTextAreaElement;
                      if (el) el.value = "User-agent: *\nDisallow: /";
                    }} className="text-[10px] bg-red-950/40 text-red-400 border border-red-900/60 px-2.5 py-1 rounded font-bold cursor-pointer">Block All</button>
                  </div>
                </div>
                <textarea id="robots-area" rows={8} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-[#D71920] resize-none" defaultValue={`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: http://localhost:3000/sitemap.xml`} />
                <button onClick={() => showAlert("robots.txt berhasil disimpan!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2.5 px-5 rounded-lg cursor-pointer max-w-[150px]">
                  Simpan File
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: SEO - Redirect */}
          {activeMenu === "seo-redirect" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">PENGALIHAN URL (REDIRECT 301 / 302)</h3>
                <p className="text-xs text-slate-500 mt-1">Kelola pengalihan permanen atau sementara tautan lama ke baru</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">Daftar Aturan Pengalihan Aktif</span>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { from: "/berita/aspirasi-jembatan", to: "/kategori/aspirasi", type: "301" },
                      { from: "/opini-lama-2023", to: "/artikel/opini-masyarakat-madura", type: "301" },
                    ].map(r => (
                      <div key={r.from} className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl flex items-center justify-between font-mono text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-red-400 text-[10px] font-bold">FROM: {r.from}</span>
                          <span className="text-emerald-400 text-[10px] font-bold">TO: {r.to}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[9px] rounded font-bold">{r.type}</span>
                          <button onClick={() => showAlert(`Pengalihan dari ${r.from} berhasil dihapus!`, "Sukses", "success")} className="text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer text-[11px]">Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 text-xs font-semibold">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">Tambah Aturan Baru</span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">URL Sumber (Lama)</label>
                    <input type="text" placeholder="/url-lama" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">URL Tujuan (Baru)</label>
                    <input type="text" placeholder="/url-baru" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Jenis Pengalihan</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none">
                      <option value="301">301 - Pengalihan Permanen (Sangat disarankan untuk SEO)</option>
                      <option value="302">302 - Pengalihan Sementara</option>
                    </select>
                  </div>
                  <button onClick={() => showAlert("Aturan redirect baru berhasil ditambahkan!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer mt-2 w-full">
                    Tambah Pengalihan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: SEO - Schema */}
          {activeMenu === "seo-schema" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">SCHEMA STRUCTURAL DATA (JSON-LD)</h3>
                <p className="text-xs text-slate-500 mt-1">Konfigurasi format metadata Rich Snippets Google untuk portal berita</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">Jenis Schema Teraktif</span>
                {[
                  { id: "sc-news", label: "NewsArticle Schema (Untuk kelayakan berita di Google News)", active: true },
                  { id: "sc-org", label: "Organization Schema (Identitas utama penerbit berita)", active: true },
                  { id: "sc-bread", label: "BreadcrumbList Schema (Navigasi hierarkis tautan)", active: true },
                  { id: "sc-search", label: "WebSite Searchbox Schema (Bar pencarian langsung di Google)", active: false },
                ].map(opt => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <input type="checkbox" id={opt.id} defaultChecked={opt.active} className="rounded accent-[#D71920]" />
                    <label htmlFor={opt.id} className="text-xs text-slate-300 font-bold cursor-pointer">{opt.label}</label>
                  </div>
                ))}
                <div className="border-t border-slate-800 pt-4 mt-2 flex flex-col gap-4 text-xs font-semibold">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Nama Organisasi Penerbit</label>
                    <input type="text" defaultValue="Redaksi Poros Madura Media" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none" />
                  </div>
                </div>
                <button onClick={() => showAlert("Schema JSON-LD berhasil diperbarui!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer max-w-[150px]">
                  Simpan Schema
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: SEO - Meta Manager */}
          {activeMenu === "seo-meta" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">GLOBAL META MANAGER</h3>
                <p className="text-xs text-slate-500 mt-1">Konfigurasi tag deskripsi SEO, OpenGraph (OG), dan Twitter Card</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Meta Deskripsi Global Homepage</label>
                  <textarea rows={3} defaultValue="Poros Madura - Mengawal Informasi, Membangun Madura. Menyediakan portal berita terkini seputar Madura, politik, budaya, wisata, dan TV aspirasi rakyat." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920] resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Meta Kata Kunci (Keywords)</label>
                  <input type="text" defaultValue="poros madura, berita madura, suramadu, bangkalan, sumenep, sampang, pamekasan" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">OpenGraph Type</label>
                    <input type="text" defaultValue="website" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Twitter Card Size</label>
                    <input type="text" defaultValue="summary_large_image" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none" />
                  </div>
                </div>
                <button onClick={() => showAlert("Metadata global berhasil diperbarui!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold py-2.5 px-4 rounded-lg cursor-pointer text-center max-w-[150px]">
                  Simpan Meta
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: SEO - Keyword Ranking */}
          {activeMenu === "seo-keyword" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">TRACKING PERINGKAT KEYWORD (SEO SERP)</h3>
                <p className="text-xs text-slate-500 mt-1">Pantau dan analisis peringkat kata kunci penting di Google Search Engine</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-3 mb-4">Kata Kunci Utama yang Dipantau</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                          <th className="py-2.5">Kata Kunci</th>
                          <th className="py-2.5">Posisi Google</th>
                          <th className="py-2.5">Volume (Bulan)</th>
                          <th className="py-2.5">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {[
                          { kw: "berita madura terkini", pos: "1", vol: "8.100", trend: "up" },
                          { kw: "wisata budaya sumenep", pos: "3", vol: "2.400", trend: "up" },
                          { kw: "jembatan suramadu hari ini", pos: "2", vol: "12.500", trend: "stable" },
                          { kw: "kuliner bebek bangkalan", pos: "5", vol: "1.600", trend: "down" },
                        ].map(k => (
                          <tr key={k.kw}>
                            <td className="py-3 font-mono text-white">{k.kw}</td>
                            <td className="py-3 text-emerald-400 font-bold font-mono">#{k.pos}</td>
                            <td className="py-3 font-mono">{k.vol}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                k.trend === "up" ? "bg-emerald-950 text-emerald-400 border border-emerald-900" :
                                k.trend === "down" ? "bg-red-950 text-red-400 border border-red-900" :
                                "bg-slate-800 text-slate-400"
                              }`}>
                                {k.trend}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4 text-xs font-semibold">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">Tambah Tracker Kata Kunci</span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Kata Kunci Baru</label>
                    <input type="text" placeholder="misal: kerapan sapi madura" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Target Lokasi Penelusuran</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none">
                      <option value="id">Indonesia (google.co.id)</option>
                      <option value="global">Global (google.com)</option>
                    </select>
                  </div>
                  <button onClick={() => showAlert("Kata kunci baru berhasil ditambahkan ke pemantauan!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer mt-2 w-full">
                    Mulai Pantau Keyword
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: SEO - Broken Link */}
          {activeMenu === "seo-broken" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">BROKEN LINK CHECKER (EROR 404)</h3>
                <p className="text-xs text-slate-500 mt-1">Pindai otomatis dan temukan tautan mati / rusak yang merusak peringkat SEO</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tautan Rusak yang Ditemukan (404)</span>
                  <button onClick={() => showAlert("Pemindaian tautan rusak berhasil diselesaikan!", "Sukses", "success")} className="text-xs text-[#D71920] hover:text-[#D71920]/90 font-bold cursor-pointer">Jalankan Pindai Ulang</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5">Tautan Asal</th>
                        <th className="py-2.5">Eror HTTP</th>
                        <th className="py-2.5">Lokasi Artikel</th>
                        <th className="py-2.5">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-mono">
                      {[
                        { link: "http://external-site.com/image-lost.jpg", err: "404 Not Found", page: "Bebek Sinjay Bangkalan Legendaris" },
                        { link: "/redaksi/kontak-darurat-humas", err: "404 Not Found", page: "Hubungi Kami" },
                      ].map(l => (
                        <tr key={l.link}>
                          <td className="py-3 text-red-400 break-all">{l.link}</td>
                          <td className="py-3 font-bold text-white">{l.err}</td>
                          <td className="py-3 text-slate-400 font-sans">{l.page}</td>
                          <td className="py-3">
                            <button onClick={() => showAlert("Redirect / perbaiki link ini!", "Info", "alert")} className="text-xs text-sky-400 hover:text-sky-300 font-bold transition-colors cursor-pointer">Perbaiki</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: SEO - Index Status */}
          {activeMenu === "seo-index" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">STATUS INDEKS GOOGLE SEARCH CONSOLE</h3>
                <p className="text-xs text-slate-500 mt-1">Sambungkan API Google untuk melacak status crawl dan indeks situs</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Total Halaman Terindeks", value: "1.240 Halaman", color: "text-emerald-400" },
                  { label: "Crawl Eror 5xx/4xx", value: "0 Eror", color: "text-slate-400" },
                  { label: "Halaman Ditemukan (Belum Diindeks)", value: "45 Halaman", color: "text-amber-400" },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{stat.label}</span>
                    <span className={`text-xl font-black block mt-2 ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">Kredensial Integrasi API</span>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Unggah berkas kredensial Google Service Account `.json` untuk mengaktifkan pemantauan real-time status indeks langsung di dasbor CMS Anda.
                </p>
                <div className="border-2 border-dashed border-slate-750 hover:border-[#D71920]/60 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-950/40 transition-all">
                  <span className="text-xs text-slate-400 block font-bold">Pilih berkas JSON Google API Key</span>
                </div>
                <button onClick={() => showAlert("Sambungkan kredensial API Google Search Console!", "Info", "alert")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer max-w-[150px]">
                  Hubungkan API
                </button>
              </div>
            </div>
          )}
          {activeMenu === "settings-info" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">INFORMASI WEBSITE</h3>
                <p className="text-xs text-slate-500 mt-1">Identitas dan informasi kontak utama portal Poros Madura</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Nama Portal Berita</label>
                  <input type="text" defaultValue="POROS MADURA" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tagline Media</label>
                  <input type="text" defaultValue="Mengawal Informasi, Membangun Madura." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email Redaksi</label>
                    <input type="email" defaultValue="redaksi@porosmadura.com" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">No. Telepon / WhatsApp</label>
                    <input type="text" defaultValue="+62 812-3456-7890" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Alamat Kantor Redaksi</label>
                  <textarea rows={3} defaultValue="Jl. Raya Suramadu No. 45, Bangkalan, Madura, Jawa Timur" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920] resize-none" />
                </div>
                <button onClick={() => showAlert("Informasi website berhasil diperbarui!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold py-2.5 px-4 rounded-lg cursor-pointer text-center max-w-[150px]">
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Logo */}
          {activeMenu === "settings-logo" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">PENGATURAN LOGO</h3>
                <p className="text-xs text-slate-500 mt-1">Ubah berkas logo utama website Poros Madura</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">Logo Utama (Versi Gelap)</span>
                  <div className="bg-slate-950 p-6 rounded-lg flex items-center justify-center border border-slate-850">
                    <img src={logoPutihUrl} alt="Logo Putih" className="h-10 object-contain" />
                  </div>
                  <button onClick={() => showAlert("Fitur ubah logo terintegrasi dengan Media Library!", "Info", "alert")} className="w-full bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold py-2 rounded-lg cursor-pointer">
                    Ganti Logo Gelap
                  </button>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">Logo Alternatif (Versi Terang)</span>
                  <div className="bg-white p-6 rounded-lg flex items-center justify-center border border-slate-200">
                    <span className="text-slate-950 font-black text-xl font-sans">POROS MADURA</span>
                  </div>
                  <button onClick={() => showAlert("Fitur ubah logo terintegrasi dengan Media Library!", "Info", "alert")} className="w-full bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold py-2 rounded-lg cursor-pointer">
                    Ganti Logo Terang
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Favicon */}
          {activeMenu === "settings-favicon" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">FAVICON</h3>
                <p className="text-xs text-slate-500 mt-1">Kelola ikon kecil website yang muncul di tab browser</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md flex flex-col gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">Favicon Aktif</span>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-4xl">
                    🔴
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white">favicon.ico</span>
                    <span className="text-[10px] font-mono text-slate-500">Format: ICO / PNG · Ukuran: 32x32 px</span>
                  </div>
                </div>
                <button onClick={() => showAlert("Pilih file gambar favicon kustom!", "Info", "alert")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer max-w-[150px]">
                  Unggah Favicon
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Tema */}
          {activeMenu === "settings-tema" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">TEMA WEBSITE</h3>
                <p className="text-xs text-slate-500 mt-1">Pilih desain visual utama portal berita</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { name: "Default Suramadu Red", desc: "Perpaduan merah berani dan biru tua melambangkan Jembatan Suramadu.", active: true },
                  { name: "Slate Dark Stealth", desc: "Tema gelap pekat dengan aksen emerald ramah mata di malam hari.", active: false },
                  { name: "Clean Minimalist Light", desc: "Latar belakang putih bersih dengan tipografi hitam kontras tinggi.", active: false },
                ].map(t => (
                  <div key={t.name} className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between gap-4 ${t.active ? "border-[#D71920]" : "border-slate-800"}`}>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-white">{t.name}</h4>
                        {t.active && <span className="text-[9px] bg-[#D71920]/25 text-[#D71920] border border-[#D71920]/40 px-2 py-0.5 rounded-full font-bold">Aktif</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{t.desc}</p>
                    </div>
                    {!t.active && (
                      <button onClick={() => showAlert(`Tema "${t.name}" berhasil diaktifkan!`, "Sukses", "success")} className="w-full bg-slate-800 hover:bg-slate-750 text-white text-[11px] font-bold py-1.5 rounded-lg cursor-pointer">
                        Aktifkan Tema
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Warna Website */}
          {activeMenu === "settings-warna" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">WARNA WEBSITE KUSTOM</h3>
                <p className="text-xs text-slate-500 mt-1">Ubah palet warna khusus sesuai keinginan Anda</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-5">
                {[
                  { label: "Warna Utama (Primary Color)", val: "#0D2B5C" },
                  { label: "Warna Aksen (Accent Color)", val: "#D71920" },
                  { label: "Latar Belakang Website", val: "#FAFAFB" },
                  { label: "Teks Utama", val: "#1E293B" },
                ].map(c => (
                  <div key={c.label} className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-xs text-slate-300 font-bold">{c.label}</span>
                    <div className="flex items-center gap-3">
                      <input type="color" defaultValue={c.val} className="w-8 h-8 rounded border border-slate-750 bg-transparent cursor-pointer" />
                      <span className="font-mono text-xs text-slate-400 font-bold">{c.val}</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => showAlert("Warna kustom berhasil diterapkan!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer max-w-[150px] mt-2">
                  Simpan Warna
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Layout Homepage */}
          {activeMenu === "settings-layout-home" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">HOMEPAGE LAYOUT BUILDER</h3>
                <p className="text-xs text-slate-500 mt-1">Atur urutan dan visibilitas blok di halaman depan</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4">
                {[
                  { name: "Breaking News Ticker", visible: true },
                  { name: "Slider Headline Utama", visible: true },
                  { name: "Feed Berita Terbaru", visible: true },
                  { name: "Galeri Video Interaktif", visible: true },
                  { name: "Kolom Aspirasi & Opini", visible: true },
                  { name: "Widget Pasar & Cuaca", visible: true },
                ].map((layout, idx) => (
                  <div key={layout.name} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-slate-600 font-bold">{idx + 1}.</span>
                      <span className="text-white font-bold">{layout.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => {}} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white cursor-pointer font-bold">▲</button>
                      <button onClick={() => {}} className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white cursor-pointer font-bold">▼</button>
                      <span className="w-px h-4 bg-slate-800"></span>
                      <input type="checkbox" defaultChecked={layout.visible} className="rounded accent-[#D71920]" />
                    </div>
                  </div>
                ))}
                <button onClick={() => showAlert("Layout homepage builder berhasil disimpan!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer max-w-[150px] mt-2">
                  Simpan Layout
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Layout Artikel */}
          {activeMenu === "settings-layout-artikel" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">LAYOUT ARTIKEL BUILDER</h3>
                <p className="text-xs text-slate-500 mt-1">Konfigurasi struktur elemen pada halaman detail artikel berita</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4">
                {[
                  { id: "art-author", label: "Tampilkan Foto & Avatar Penulis", active: true },
                  { id: "art-time", label: "Tampilkan Estimasi Waktu Membaca", active: true },
                  { id: "art-recom", label: "Tampilkan Blok Rekomendasi Artikel Terkait", active: true },
                  { id: "art-share", label: "Tampilkan Tombol Berbagi Sosial (Floating)", active: true },
                  { id: "art-comment", label: "Aktifkan Kolom Komentar Publik", active: true },
                ].map(opt => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <input type="checkbox" id={opt.id} defaultChecked={opt.active} className="rounded accent-[#D71920]" />
                    <label htmlFor={opt.id} className="text-xs text-slate-300 font-bold cursor-pointer">{opt.label}</label>
                  </div>
                ))}
                <button onClick={() => showAlert("Layout detail artikel builder berhasil disimpan!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer max-w-[150px] mt-2">
                  Simpan Layout
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Layout Kategori */}
          {activeMenu === "settings-layout-kategori" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">LAYOUT KATEGORI BUILDER</h3>
                <p className="text-xs text-slate-500 mt-1">Konfigurasi struktur elemen pada halaman daftar kategori berita</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-bold">Gaya Tampilan Daftar Berita</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Grid Layout (2/3 Kolom)", "Daftar List Klasik", "Split Hero Grid"].map((g, idx) => (
                      <button key={g} onClick={() => {}} className={`py-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${idx === 0 ? "bg-[#D71920]/10 border-[#D71920] text-white" : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">Jumlah Artikel Per Halaman (Pagination)</label>
                  <select defaultValue="10" className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920] w-full">
                    <option value="5">5 Artikel</option>
                    <option value="10">10 Artikel</option>
                    <option value="15">15 Artikel</option>
                    <option value="20">20 Artikel</option>
                  </select>
                </div>
                <button onClick={() => showAlert("Layout kategori builder berhasil disimpan!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer text-center max-w-[150px]">
                  Simpan Layout
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Footer */}
          {activeMenu === "settings-footer" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">PENGATURAN FOOTER</h3>
                <p className="text-xs text-slate-500 mt-1">Ubah teks hak cipta, deskripsi footer, dan tautan sosial media</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Teks Hak Cipta (Copyright)</label>
                  <input type="text" defaultValue="© 2026 Poros Madura. All Rights Reserved." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Facebook URL</label>
                    <input type="text" defaultValue="https://facebook.com/porosmadura" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Instagram URL</label>
                    <input type="text" defaultValue="https://instagram.com/porosmadura" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">YouTube Channel URL</label>
                    <input type="text" defaultValue="https://youtube.com/c/porosmaduratv" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Twitter / X URL</label>
                    <input type="text" defaultValue="https://x.com/porosmadura" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920]" />
                  </div>
                </div>
                <button onClick={() => showAlert("Footer berhasil diperbarui!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold py-2.5 px-4 rounded-lg cursor-pointer text-center max-w-[150px]">
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Header */}
          {activeMenu === "settings-header" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">PENGATURAN HEADER</h3>
                <p className="text-xs text-slate-500 mt-1">Kustomisasi menu atas, ticker info, dan bar pencarian</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4">
                {[
                  { id: "hdr-sticky", label: "Aktifkan Sticky Header (Mengambang saat discroll)", active: true },
                  { id: "hdr-ticker", label: "Tampilkan Running Text Ticker (Berita Terbaru)", active: true },
                  { id: "hdr-date", label: "Tampilkan Tanggal Lengkap di Pojok Kiri", active: true },
                  { id: "hdr-lang", label: "Tampilkan Switcher Pilihan Bahasa (ID / EN)", active: true },
                ].map(opt => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <input type="checkbox" id={opt.id} defaultChecked={opt.active} className="rounded accent-[#D71920]" />
                    <label htmlFor={opt.id} className="text-xs text-slate-300 font-bold cursor-pointer">{opt.label}</label>
                  </div>
                ))}
                <button onClick={() => showAlert("Header berhasil diperbarui!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer max-w-[150px] mt-2">
                  Simpan Header
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Menu Navigasi */}
          {activeMenu === "settings-nav" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">MENU NAVIGASI PORTAL</h3>
                <p className="text-xs text-slate-500 mt-1">Kelola item menu navigasi yang muncul di navbar atas website</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4">
                {[
                  "Politik & Hukum",
                  "Ekonomi & Bisnis",
                  "Budaya & Wisata",
                  "Aspirasi Rakyat",
                  "TV / Video",
                ].map((menuItem, idx) => (
                  <div key={menuItem} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-white font-bold font-mono">{idx + 1}. {menuItem}</span>
                    <button onClick={() => showAlert(`Hapus menu "${menuItem}"?`, "Konfirmasi", "alert")} className="text-xs text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer">
                      Hapus
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input type="text" placeholder="Tambah menu baru..." className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D71920] flex-1" />
                  <button onClick={() => showAlert("Menu baru berhasil ditambahkan!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Widget */}
          {activeMenu === "settings-widget" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">MANAJEMEN WIDGET SIDEBAR</h3>
                <p className="text-xs text-slate-500 mt-1">Aktifkan atau matikan modul widget interaktif di sidebar</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4">
                {[
                  { id: "wd-market", label: "Widget Sembako & Pasar Madura (Live Update)", active: true },
                  { id: "wd-weather", label: "Widget Prakiraan Cuaca Pulau Madura", active: true },
                  { id: "wd-trending", label: "Widget Daftar Berita Terpopuler", active: true },
                  { id: "wd-poll", label: "Widget Polling Aspirasi Aktif", active: true },
                ].map(opt => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <input type="checkbox" id={opt.id} defaultChecked={opt.active} className="rounded accent-[#D71920]" />
                    <label htmlFor={opt.id} className="text-xs text-slate-300 font-bold cursor-pointer">{opt.label}</label>
                  </div>
                ))}
                <button onClick={() => showAlert("Widget sidebar berhasil disimpan!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer max-w-[150px] mt-2">
                  Simpan Widget
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Backup */}
          {activeMenu === "settings-backup" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">EKSPOR CADANGAN (BACKUP)</h3>
                <p className="text-xs text-slate-500 mt-1">Unduh seluruh basis data portal berupa file fisik JSON cadangan</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4">
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Sistem backup akan secara otomatis mengekspor seluruh konten artikel, log aktivitas pengguna, konfigurasi materi iklan, penugasan redaksi, daftar pengguna, sitemap SEO, dan konfigurasi portal utama Anda. Anda disarankan melakukan backup secara berkala.
                </p>
                <button 
                  type="button" 
                  onClick={() => {
                    fetch("/api/backup")
                      .then(res => res.json())
                      .then(data => {
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `poros-madura-db-backup-${new Date().toISOString().split("T")[0]}.json`;
                        a.click();
                        showAlert("Backup JSON berhasil diunduh ke folder Downloads!", "Sukses", "success");
                      });
                  }}
                  className="bg-[#D71920] hover:bg-[#D71920]/95 text-[#FAFAFB] font-bold text-xs py-3 px-4 rounded-lg cursor-pointer max-w-xs text-center shadow animate-bounce"
                >
                  Unduh Backup JSON Database
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Restore */}
          {activeMenu === "settings-restore" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">PEMULIHAN DATA (RESTORE)</h3>
                <p className="text-xs text-slate-500 mt-1">Pulihkan basis data portal berita dari file JSON cadangan Anda</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4">
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  <span className="text-red-500 font-bold uppercase">Peringatan:</span> Melakukan restore akan menimpa seluruh database portal saat ini dengan data cadangan dari file JSON yang diunggah. Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="border-2 border-dashed border-slate-750 hover:border-[#D71920]/60 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-950/40 transition-all">
                  <span className="text-4xl mb-2 block">📁</span>
                  <span className="text-xs text-slate-400 block font-bold">Pilih berkas backup `.json` dari komputer Anda</span>
                </div>
                <button onClick={() => showAlert("Unggah file cadangan JSON yang valid terlebih dahulu!", "Gagal", "error")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer max-w-[180px]">
                  Jalankan Pemulihan
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: Settings - Maintenance Mode */}
          {activeMenu === "settings-maintenance" && (
            <div className="flex flex-col gap-8 animate-scale-up">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-sans tracking-tight">MAINTENANCE MODE (MODE PEMELIHARAAN)</h3>
                <p className="text-xs text-slate-500 mt-1">Aktifkan halaman offline sementara saat portal sedang diperbaiki</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-white block font-sans">Status Pemeliharaan</span>
                    <span className="text-[10px] text-slate-550">Website akan menampilkan halaman offline kustom saat aktif</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="maint-toggle" className="sr-only peer" />
                    <label htmlFor="maint-toggle" className="relative w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-500 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white cursor-pointer"></label>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">Pesan Offline Pengunjung</label>
                  <textarea rows={3} defaultValue="Poros Madura sedang melakukan peningkatan sistem berkala. Kami akan segera kembali dalam beberapa saat." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#D71920] resize-none text-xs font-semibold" />
                </div>
                <button onClick={() => showAlert("Mode Pemeliharaan berhasil disimpan!", "Sukses", "success")} className="bg-[#D71920] hover:bg-[#D71920]/90 text-white font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer max-w-[150px]">
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}

          {activeMenu === "advertisement" && (
            <AdminAdsManager lang={lang} />
          )}

          {/* SCREEN: Semua User */}
          {activeMenu === "user-all" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">SEMUA USER PORTAL</h3>
                  <p className="text-xs text-slate-500 mt-1">Daftar pengguna terdaftar yang memiliki hak akses administratif portal berita</p>
                </div>
                <button 
                  onClick={handleAddUser}
                  className="bg-[#D71920] text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#D71920]/90 transition-colors cursor-pointer shadow flex items-center gap-1.5"
                >
                  <PlusCircle size={14} />
                  <span>Daftarkan User Baru</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-400">
                    <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase font-mono border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Nama Lengkap</th>
                        <th className="px-4 py-3">Alamat Email</th>
                        <th className="px-4 py-3">Peran / Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {usersList.map(u => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold border border-slate-700">
                              {u.avatar}
                            </span>
                            <span>{u.name}</span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">{u.email}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              u.role === "Administrator" ? "bg-red-950/40 text-red-400 border-red-900/50" :
                              u.role === "Editor"        ? "bg-blue-950/40 text-blue-400 border-blue-900/50" :
                              u.role === "Jurnalis"      ? "bg-green-950/40 text-green-400 border-green-900/50" :
                              "bg-slate-800 text-slate-400 border-slate-700"
                            }`}>{u.role}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="bg-green-950/30 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-900/30">
                              {u.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-400 hover:text-red-300 font-bold transition-colors text-[11px] cursor-pointer"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: Role */}
          {activeMenu === "user-role" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">PERAN SISTEM (ROLES)</h3>
                  <p className="text-xs text-slate-500 mt-1">Daftar peran administratif yang menentukan tingkat otorisasi pengguna dalam sistem</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rolesList.map(r => (
                  <div key={r.name} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-baseline border-b border-slate-800 pb-2 mb-3">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{r.name}</span>
                        <span className="text-[10px] font-mono font-bold bg-[#D71920]/15 text-[#D71920] px-2 py-0.5 rounded border border-[#D71920]/25">
                          {r.count} Pengguna
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN: Permission */}
          {activeMenu === "user-permission" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">MATRIKS PERIZINAN HAK AKSES</h3>
                  <p className="text-xs text-slate-500 mt-1">Centang kapabilitas akses yang diizinkan untuk masing-masing peran administratif</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-400">
                    <thead className="bg-slate-950 text-[10px] text-slate-500 uppercase font-mono border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Kapabilitas Izin</th>
                        {rolesList.map(r => (
                          <th key={r.name} className="px-4 py-3 text-center">{r.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {Object.keys(permissionsMatrix).map(permissionKey => (
                        <tr key={permissionKey} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-white font-mono">{permissionKey}</td>
                          {rolesList.map(r => (
                            <td key={r.name} className="px-4 py-3.5 text-center">
                              <input 
                                type="checkbox"
                                checked={permissionsMatrix[permissionKey]?.[r.name] || false}
                                onChange={() => handleTogglePermission(permissionKey, r.name)}
                                className="rounded border-slate-800 text-[#D71920] focus:ring-0 w-4 h-4 cursor-pointer focus:ring-offset-slate-950"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN: User Activity Log */}
          {activeMenu === "user-logs" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-sans tracking-tight">LOG AKTIVITAS OPERASIONAL (AUDIT TRAIL)</h3>
                  <p className="text-xs text-slate-500 mt-1">Audit trail lengkap riwayat tindakan dan operasi yang dilakukan di CMS</p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
                  {logs.map((log, idx) => (
                    <div key={idx} className="flex gap-4 items-start text-xs border-b border-slate-800/60 pb-3.5 last:border-0">
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 mt-0.5">
                        {new Date(log.timestamp).toLocaleString("id-ID")}
                      </span>
                      <div>
                        <span className="font-bold text-white mr-1.5">{log.user}</span>
                        <span className="bg-slate-950 text-[10px] px-2 py-0.5 rounded font-mono text-[#D71920] uppercase mr-2 border border-slate-800">
                          {log.role}
                        </span>
                        <p className="text-slate-350 inline-block font-mono text-[11px]">{log.action}</p>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-slate-500 italic py-8">Tidak ada catatan audit log aktivitas.</div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ─── MODAL: Detail Preview Media ─── */}
      {selectedMediaPreview && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl relative animate-scale-up">
            
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-slate-850">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Detail Media Aset</h4>
              <button 
                onClick={() => setSelectedMediaPreview(null)}
                className="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col items-center gap-4">
              
              {/* Preview Box */}
              <div className="w-full aspect-video rounded-xl bg-slate-950 border border-slate-855 flex items-center justify-center overflow-hidden">
                {selectedMediaPreview.type === "img" && selectedMediaPreview.url ? (
                  <img 
                    src={selectedMediaPreview.url} 
                    alt={selectedMediaPreview.name} 
                    className="w-full h-full object-contain" 
                  />
                ) : selectedMediaPreview.type === "img" ? (
                  <span className="text-5xl">🖼️</span>
                ) : selectedMediaPreview.type === "vid" ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl">🎬</span>
                    <span className="text-[10px] font-mono text-slate-500">Video format</span>
                  </div>
                ) : selectedMediaPreview.type === "pdf" ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl">📄</span>
                    <span className="text-[10px] font-mono text-slate-500">Dokumen PDF</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-5xl">📝</span>
                    <span className="text-[10px] font-mono text-slate-500">Dokumen Teks / Word</span>
                  </div>
                )}
              </div>

              {/* Specs Table */}
              <div className="w-full bg-slate-950 border border-slate-855 rounded-xl p-4 flex flex-col gap-2.5 font-sans">
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Nama Aset:</span>
                  <span className="text-xs text-white truncate max-w-[280px] font-semibold">{selectedMediaPreview.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Tipe File:</span>
                  <span className="text-xs text-slate-300 font-mono uppercase font-bold">{selectedMediaPreview.type === "img" ? "Gambar" : selectedMediaPreview.type === "vid" ? "Video" : selectedMediaPreview.type === "pdf" ? "PDF" : "Dokumen"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Ukuran File:</span>
                  <span className="text-xs text-[#10b981] font-mono font-bold">{selectedMediaPreview.size}</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 py-4 bg-slate-950/40 border-t border-slate-850">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(selectedMediaPreview.url || selectedMediaPreview.name);
                  showAlert("Link / Nama Aset berhasil disalin ke clipboard!", "Sukses", "success");
                }}
                className="px-4 py-2 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer hover:bg-slate-800"
              >
                Salin Tautan Aset
              </button>
              <button 
                onClick={() => setSelectedMediaPreview(null)}
                className="px-4 py-2 bg-[#D71920] hover:bg-[#D71920]/90 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
