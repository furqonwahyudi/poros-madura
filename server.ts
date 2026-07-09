import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Market Live Service Imports
import { CacheService } from "./cache/CacheService";
import { YahooFinanceIDXProvider, ReserveIDXProvider } from "./providers/IDXProvider";
import { 
  YahooFinanceCurrencyProvider, 
  ExchangeRateHostCurrencyProvider, 
  TwelveDataCurrencyProvider, 
  FixerCurrencyProvider, 
  OpenExchangeRatesCurrencyProvider, 
  ReserveCurrencyProvider 
} from "./providers/CurrencyProvider";
import { LogamMuliaGoldProvider, PegadaianGoldProvider, ReserveGoldProvider } from "./providers/GoldProvider";
import { MarketDataService } from "./services/MarketDataService";
import { MarketScheduler } from "./jobs/MarketScheduler";
import { MarketController } from "./controllers/MarketController";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "data", "db.json");
const PUBLIC_STORAGE_PATH = path.join(process.cwd(), "public");
const SITE_URL = "https://porosmadura.com";

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}

if (!fs.existsSync(PUBLIC_STORAGE_PATH)) {
  fs.mkdirSync(PUBLIC_STORAGE_PATH, { recursive: true });
}

// Ensure database file exists with seed data
const initialCategories = [
  "Politik", "Nasional", "Daerah", "Internasional", "Ekonomi",
  "Hukum", "Kriminal", "Pendidikan", "Teknologi", "Olahraga",
  "Otomotif", "Lifestyle", "Kesehatan", "Hiburan", "Opini",
  "Kolom", "Infografis", "Video", "Foto", "Editorial"
];

const seedArticles = [
  {
    id: "art-1",
    title: "Koalisi Merah Putih Sepakati Arah Baru Reformasi Parlemen 2026",
    slug: "koalisi-merah-putih-sepakati-arah-baru-reformasi-parlemen-2026",
    category: "Politik",
    subCategory: "Legislatif",
    content: "Jakarta, Poros Madura — Pertemuan tingkat tinggi antar pimpinan partai politik yang tergabung dalam Koalisi Merah Putih akhirnya membuahkan kesepakatan bersejarah. Dalam pertemuan tertutup di Jakarta Selatan, para petinggi partai menyepakati draf reformasi parlemen yang ditargetkan mulai berjalan penuh pada awal kuartal ketiga tahun 2026.\n\nReformasi ini mencakup penyederhanaan birokrasi komisi, digitalisasi pengawasan anggaran, serta peningkatan keterbukaan publik terkait proses legislasi. Juru bicara koalisi menyatakan bahwa langkah ini diambil untuk mengembalikan kepercayaan publik terhadap lembaga perwakilan rakyat.\n\n'Kami menginginkan parlemen yang lebih akuntabel, efisien, dan responsif terhadap aspirasi rakyat. Ini bukan sekadar kompromi politik, melainkan cetak biru masa depan demokrasi Indonesia,' ujarnya dalam konferensi pers.\n\nBeberapa pengamat politik menilai langkah koalisi ini sebagai lompatan besar yang cerdas, meskipun tantangan implementasi teknis di lapangan tetap perlu dikawal ketat oleh publik.",
    tags: ["Parlemen", "Reformasi", "Koalisi", "Politik 2026"],
    image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
    author: "Budi Santoso",
    reporter: "Andini Putri",
    editor: "Giri Wijaya",
    publishDate: "2026-06-28T09:15:00.000Z",
    status: "published",
    views: 4820,
    reads: 3200,
    shares: 890,
    isBreaking: true,
    isHeadline: true,
    isEditorChoice: true,
    isTrending: true,
    videoUrl: "",
    audioUrl: "",
    metaDescription: "Koalisi Merah Putih menyepakati arah baru reformasi parlemen 2026 demi mewujudkan parlemen yang transparan dan akuntabel.",
    metaKeywords: ["parlemen", "politik indonesia", "koalisi", "reformasi parlemen"],
    canonicalUrl: "https://porosmadura.com/politik/koalisi-merah-putih-sepakati-arah-baru-reformasi-parlemen-2026"
  },
  {
    id: "art-2",
    title: "Pemerintah Resmikan Proyek Kereta Cepat Trans-Sumatera Tahap I",
    slug: "pemerintah-resmikan-proyek-kereta-cepat-trans-sumatera-tahap-i",
    category: "Nasional",
    subCategory: "Infrastruktur",
    content: "Palembang, Poros Madura — Impian masyarakat Sumatra untuk menikmati moda transportasi massal modern berkecepatan tinggi kini selangkah lebih dekat menjadi kenyataan. Presiden hari ini secara resmi melakukan groundbreaking untuk Proyek Strategis Nasional (PSN) Kereta Cepat Trans-Sumatera Tahap I yang menghubungkan Bandar Lampung dengan Palembang.\n\nProyek yang ditargetkan rampung pada akhir tahun 2028 ini membentang sepanjang 350 kilometer dan diproyeksikan memangkas waktu tempuh antar-kota dari semula 6 jam menjadi hanya 1,5 jam. Menggunakan teknologi persinyalan mutakhir generasi terbaru, kereta ini diklaim ramah lingkungan dan sepenuhnya bertenaga listrik.\n\n'Ini adalah babak baru konektivitas Sumatra. Infrastruktur berkualitas tinggi adalah kunci pemerataan ekonomi regional dan peningkatan daya saing nasional di kancah global,' tegas Menteri Perhubungan.\n\nSektor logistik dan pariwisata lokal diprediksi akan menjadi sektor yang paling cepat merasakan dampak positif dari mega proyek ini.",
    tags: ["Infrastruktur", "Kereta Cepat", "Trans-Sumatera", "Nasional"],
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
    author: "Dewi Lestari",
    reporter: "Rian Hidayat",
    editor: "Giri Wijaya",
    publishDate: "2026-06-27T14:30:00.000Z",
    status: "published",
    views: 3120,
    reads: 2150,
    shares: 420,
    isBreaking: false,
    isHeadline: true,
    isEditorChoice: false,
    isTrending: true,
    videoUrl: "",
    audioUrl: "",
    metaDescription: "Groundbreaking Kereta Cepat Trans-Sumatera tahap I resmi dimulai, memangkas waktu tempuh Bandar Lampung - Palembang menjadi 1,5 jam.",
    metaKeywords: ["kereta cepat", "sumatera", "infrastruktur", "konektivitas"],
    canonicalUrl: "https://porosmadura.com/nasional/pemerintah-resmikan-proyek-kereta-cepat-trans-sumatera-tahap-i"
  },
  {
    id: "art-3",
    title: "Poros Madura AI Luncurkan Large Language Model Bahasa Indonesia Pertama Berakurasi 98%",
    slug: "poros-madura-ai-luncurkan-llm-bahasa-indonesia-pertama",
    category: "Teknologi",
    subCategory: "Kecerdasan Buatan",
    content: "Bandung, Poros Madura — Industri teknologi tanah air kembali mengukir prestasi emas di kancah global. Startup inkubasi lokal Poros Madura AI hari ini merilis LLM (Large Language Model) khusus Bahasa Indonesia generasi terbaru yang dinamai 'Aspirasi-GPT-3.5'.\n\nDalam uji performa standar industri, model kecerdasan buatan ini mencatatkan tingkat akurasi pemahaman konteks lokal dan dialek daerah hingga 98%, mengungguli model-model generatif global yang ada saat ini. Keberhasilan ini dicapai berkat pelatihan menggunakan dataset lokal terkurasi berukuran ratusan terabyte.\n\n'Kami melatih model ini dengan pemahaman budaya, metafora, serta tata bahasa formal dan informal Indonesia yang sangat kompleks. Kami ingin menghadirkan teknologi AI yang berdaulat dan relevan untuk efisiensi bisnis nasional,' ungkap Chief AI Officer Poros Madura AI.\n\nSektor perbankan, layanan pelanggan, dan instansi pemerintahan dilaporkan telah mengantre untuk mengintegrasikan model canggih ini ke dalam alur kerja digital mereka.",
    tags: ["AI", "Kecerdasan Buatan", "LLM", "Teknologi Indonesia"],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    author: "Rizky Pratama",
    reporter: "Siti Rahma",
    editor: "Hendry Tan",
    publishDate: "2026-06-28T02:00:00.000Z",
    status: "published",
    views: 5210,
    reads: 3950,
    shares: 1200,
    isBreaking: false,
    isHeadline: true,
    isEditorChoice: true,
    isTrending: true,
    videoUrl: "",
    audioUrl: "",
    metaDescription: "Poros Madura AI resmi meluncurkan Aspirasi-GPT-3.5, LLM Bahasa Indonesia pertama dengan akurasi pemahaman lokal mencapai 98%.",
    metaKeywords: ["AI", "Aspirasi GPT", "LLM Indonesia", "Kecerdasan Buatan"],
    canonicalUrl: "https://porosmadura.com/teknologi/poros-madura-ai-luncurkan-llm-bahasa-indonesia-pertama"
  },
  {
    id: "art-4",
    title: "Rupiah Menguat Tajam Pasca BI Umumkan Suku Bunga Terbaru",
    slug: "rupiah-menguat-tajam-pasca-bi-umumkan-suku-bunga-terbaru",
    category: "Ekonomi",
    subCategory: "Moneter",
    content: "Jakarta, Poros Madura — Nilai tukar rupiah terhadap dolar AS ditutup menguat tajam pada perdagangan sore hari ini, menyentuh level terkuatnya dalam enam bulan terakhir. Penguatan ini dipicu oleh keputusan taktis Bank Indonesia (BI) yang mempertahankan suku bunga acuan di level optimal.\n\nLangkah BI dinilai pasar sangat tepat untuk menjaga stabilitas inflasi domestik sekaligus memberikan kepastian bagi sektor riil di tengah fluktuasi ekonomi global. Aliran modal asing terpantau langsung mengalir deras kembali ke pasar saham dan surat utang negara.\n\n'Kebijakan moneter kami tetap diarahkan untuk menjaga stabilitas makroekonomi seraya terus mendorong momentum pertumbuhan ekonomi berkelanjutan,' jelas Deputi Gubernur Senior BI.\n\nPara pelaku usaha menyambut positif penguatan rupiah ini karena dapat menekan biaya impor bahan baku manufaktur.",
    tags: ["Rupiah", "Bank Indonesia", "Suku Bunga", "Ekonomi Makro"],
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    author: "Irwan Syah",
    reporter: "Fajar Siddiq",
    editor: "Hendry Tan",
    publishDate: "2026-06-28T05:30:00.000Z",
    status: "published",
    views: 2900,
    reads: 1800,
    shares: 230,
    isBreaking: false,
    isHeadline: true,
    isEditorChoice: false,
    isTrending: false,
    videoUrl: "",
    audioUrl: "",
    metaDescription: "Rupiah menguat tajam ke level tertinggi enam bulan terakhir setelah Bank Indonesia merilis kebijakan suku bunga acuan terbaru.",
    metaKeywords: ["rupiah", "bank indonesia", "suku bunga", "ekonomi makro"],
    canonicalUrl: "https://porosmadura.com/ekonomi/rupiah-menguat-tajam-pasca-bi-umumkan-suku-bunga-terbaru"
  },
  {
    id: "art-5",
    title: "Festival Kebudayaan Toraja Jaring Ratusan Ribu Wisatawan Mancanegara",
    slug: "festival-kebudayaan-toraja-jaring-ratusan-ribu-wisatawan",
    category: "Daerah",
    subCategory: "Pariwisata",
    content: "Tana Toraja, Poros Madura — Keindahan adat istiadat dan kearifan lokal Tana Toraja kembali memukau dunia. Gelaran tahunan Toraja Cultural Festival 2026 dilaporkan sukses memecahkan rekor kunjungan wisatawan mancanegara sejak pertama kali diselenggarakan.\n\nPembukaan festival ditandai dengan parade busana adat kolosal, tari tarian magis tradisional, serta ritual ikonik Ma'nene yang disajikan secara edukatif bagi para pengunjung. Pemerintah daerah bekerja sama dengan Kementerian Pariwisata telah meningkatkan infrastruktur aksesibilitas udara menuju bandara baru Toraja.\n\n'Toraja adalah magnet kebudayaan dunia yang tak ternilai harganya. Melalui festival ini, kami ingin membuktikan bahwa pelestarian tradisi adat berjalan harmonis dengan pertumbuhan ekonomi pariwisata,' ujar Bupati Tana Toraja.\n\nHunian hotel dan homestay warga lokal dilaporkan terisi penuh hingga 100% selama sepekan pelaksanaan acara.",
    tags: ["Toraja", "Wisata", "Kebudayaan", "Daerah"],
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
    author: "Maria Ulfa",
    reporter: "Sultan Hasanuddin",
    editor: "Giri Wijaya",
    publishDate: "2026-06-27T08:00:00.000Z",
    status: "published",
    views: 1950,
    reads: 1400,
    shares: 510,
    isBreaking: false,
    isHeadline: false,
    isEditorChoice: false,
    isTrending: false,
    videoUrl: "",
    audioUrl: "",
    metaDescription: "Toraja Cultural Festival 2026 sukses menyedot ratusan ribu wisatawan mancanegara berkat sajian kebudayaan adat yang magis dan luhur.",
    metaKeywords: ["toraja", "pariwisata", "kebudayaan", "sulawesi"],
    canonicalUrl: "https://porosmadura.com/daerah/festival-kebudayaan-toraja-jaring-ratusan-ribu-wisatawan"
  },
  {
    id: "art-6",
    title: "Timnas Indonesia Gemilang, Lolos Kualifikasi Piala Dunia Putaran Final",
    slug: "timnas-indonesia-gemilang-lolos-kualifikasi-piala-dunia",
    category: "Olahraga",
    subCategory: "Sepak Bola",
    content: "Jakarta, Poros Madura — Air mata haru dan sorak-sorai kemenangan membahana di Stadion Utama Gelora Bung Karno. Tim Nasional Sepak Bola Indonesia secara spektakuler mengunci tiket lolos langsung ke putaran final Piala Dunia setelah menumbangkan rival beratnya dengan skor meyakinkan 3-1.\n\nKemenangan taktis ini merupakan buah kerja keras kolektif tim, kedisiplinan taktis yang luar biasa di bawah asuhan pelatih kepala, serta dukungan militan dari puluhan ribu suporter merah putih yang memadati stadion.\n\n'Ini adalah malam bersejarah untuk sepak bola Indonesia. Kami membuktikan bahwa mimpi besar bangsa ini dapat terwujud jika kita bersatu dan berjuang pantang menyerah!' teriak Kapten Timnas dalam wawancara di pinggir lapangan.\n\nSeluruh penjuru nusantara merayakan pencapaian emas ini, menandai era baru kejayaan olahraga nasional di panggung elite dunia.",
    tags: ["Timnas", "Piala Dunia", "Garuda", "Sepak Bola"],
    image: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=1200&q=80",
    author: "Bambang Pamungkas",
    reporter: "Rian Hidayat",
    editor: "Hendry Tan",
    publishDate: "2026-06-28T01:10:00.000Z",
    status: "published",
    views: 7540,
    reads: 6100,
    shares: 2400,
    isBreaking: true,
    isHeadline: true,
    isEditorChoice: true,
    isTrending: true,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    audioUrl: "",
    metaDescription: "Sejarah tercipta! Timnas Indonesia resmi lolos ke putaran final Piala Dunia setelah melibas rival kuatnya 3-1 di GBK.",
    metaKeywords: ["timnas indonesia", "piala dunia", "sepak bola", "garuda lolos"],
    canonicalUrl: "https://porosmadura.com/olahraga/timnas-indonesia-gemilang-lolos-kualifikasi-piala-dunia"
  },
  {
    id: "art-7",
    title: "Mengawal Demokrasi Digital: Antara Kebebasan Aspirasi dan Literasi Informasi",
    slug: "mengawal-demokrasi-digital-antara-kebebasan-aspirasi-dan-literasi",
    category: "Opini",
    subCategory: "Sosial Politik",
    content: "Oleh: Prof. Dr. Ahmad Sodikin (Guru Besar Sosiologi Komunikasi)\n\nLansekap digital telah mendemokrasikan ruang publik kita. Hari ini, setiap warga negara memiliki pelantang suara virtual untuk menyuarakan aspirasi, mengkritik kebijakan, dan membangun komunitas gerakan sosial tanpa batas.\n\nNamun, kebebasan yang melimpah ini bagaikan pisau bermata dua. Tanpa dibekali literasi informasi yang kokoh, ruang digital kita kerap kali berubah menjadi ladang subur penyebaran misinformasi, disinformasi, serta ujaran kebencian yang memecah-belah kohesi sosial.\n\nMenyatukan informasi dan mengawal aspirasi bukanlah tugas mudah. Media massa kredibel harus memosisikan dirinya sebagai mercusuar kebenaran — melakukan verifikasi ketat, menyediakan analisis mendalam, serta memberikan ruang diskusi yang sehat.\n\nKita butuh sinergi menyeluruh antara regulasi cerdas, tanggung jawab platform teknologi, edukasi sekolah, dan kedewasaan netizen untuk menjaga demokrasi digital tetap bersih, bernilai, dan berdaulat.",
    tags: ["Demokrasi", "Demokrasi Digital", "Literasi", "Opini Publik"],
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80",
    author: "Prof. Ahmad Sodikin",
    reporter: "Poros Madura Editorial",
    editor: "Giri Wijaya",
    publishDate: "2026-06-26T04:20:00.000Z",
    status: "published",
    views: 1250,
    reads: 980,
    shares: 340,
    isBreaking: false,
    isHeadline: false,
    isEditorChoice: true,
    isTrending: false,
    videoUrl: "",
    audioUrl: "",
    metaDescription: "Analisis sosiologi tentang bagaimana menjaga kebebasan berpendapat di internet sembari membentengi masyarakat dari serangan hoaks.",
    metaKeywords: ["demokrasi digital", "opini", "hoaks", "literasi digital"],
    canonicalUrl: "https://porosmadura.com/opini/mengawal-demokrasi-digital-antara-kebebasan-aspirasi-dan-literasi"
  },
  {
    id: "art-8",
    title: "Kemenkes Targetkan Indonesia Bebas Tuberkulosis Pada Tahun 2030",
    slug: "kemenkes-targetkan-indonesia-bebas-tb-2030",
    category: "Kesehatan",
    subCategory: "Kesehatan Masyarakat",
    content: "Jakarta, Poros Madura — Kementerian Kesehatan RI mengumumkan komitmen akselerasi program eliminasi penyakit Tuberkulosis (TB) secara masif dengan target bebas TB nasional pada tahun 2030.\n\nProgram ini mengedepankan tiga pilar strategis: perluasan penapisan digital di puskesmas, adopsi regimen obat generasi baru yang mempersingkat masa penyembuhan dari semula 9 bulan menjadi hanya 4 bulan, serta optimalisasi pendanaan jaminan kesehatan.\n\n'Kita tidak boleh lengah. TB adalah silent killer yang masih mengancam produktivitas generasi muda kita. Deteksi sedini mungkin dan kepatuhan pengobatan adalah kuncinya,' tegas Menteri Kesehatan dalam rilisnya.\n\nPemerintah juga meluncurkan aplikasi digital 'PeduliTB' untuk membantu pasien memantau konsumsi obat harian secara mandiri.",
    tags: ["Kesehatan", "Kemenkes", "Tuberkulosis", "Bebas TB 2030"],
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
    author: "Dr. Amanda Raisa",
    reporter: "Siti Rahma",
    editor: "Giri Wijaya",
    publishDate: "2026-06-28T04:10:00.000Z",
    status: "published",
    views: 1840,
    reads: 1100,
    shares: 190,
    isBreaking: false,
    isHeadline: false,
    isEditorChoice: false,
    isTrending: false,
    videoUrl: "",
    audioUrl: "",
    metaDescription: "Kementerian Kesehatan mempercepat eliminasi tuberkulosis dengan target bebas penyakit TB di Indonesia pada 2030 mendatang.",
    metaKeywords: ["kesehatan", "tuberkulosis", "kemenkes", "eliminasi tb"],
    canonicalUrl: "https://porosmadura.com/kesehatan/kemenkes-targetkan-indonesia-bebas-tb-2030"
  }
];



const seedComments = [
  {
    id: "c-1",
    articleSlug: "koalisi-merah-putih-sepakati-arah-baru-reformasi-parlemen-2026",
    author: "Rahmat Jatmiko",
    content: "Langkah yang sangat ditunggu oleh rakyat! Semoga transparansi ini tidak hanya di atas kertas saja, melainkan benar-benar dipantau langsung perkembangannya. Bravo Poros Madura!",
    timestamp: "2026-06-28T09:30:00.000Z",
    likes: 42,
    dislikes: 2,
    replies: [
      {
        id: "c-1-r1",
        author: "Kiki Amalia",
        content: "Sepakat pak Rahmat. Digitalisasi anggaran harus bisa kita kawal bareng lewat dashboard publik.",
        timestamp: "2026-06-28T09:45:00.000Z",
        likes: 15,
        dislikes: 0
      }
    ]
  },
  {
    id: "c-2",
    articleSlug: "koalisi-merah-putih-sepakati-arah-baru-reformasi-parlemen-2026",
    author: "Hendry Prasetyo",
    content: "Pesimis saya dengan koalisi politik. Paling ini cuma manuver jelang pilkada, tapi ayo kita kawal saja apa benar terjadi digitalisasi birokrasi di parlemen.",
    timestamp: "2026-06-28T10:00:00.000Z",
    likes: 28,
    dislikes: 5,
    replies: []
  },
  {
    id: "c-3",
    articleSlug: "poros-madura-ai-luncurkan-llm-bahasa-indonesia-pertama",
    author: "Budi Programmer",
    content: "Keren sekali buatan lokal! Sebagai praktisi teknologi, saya bangga sekali. Kapan rilis API publiknya untuk dicoba di proyek kami?",
    timestamp: "2026-06-28T02:30:00.000Z",
    likes: 56,
    dislikes: 1,
    replies: [
      {
        id: "c-3-r1",
        author: "Developer Sejati",
        content: "Infonya bulan depan bakal ada sandbox buat startup lokal pak. Mantap sih ini.",
        timestamp: "2026-06-28T03:00:00.000Z",
        likes: 18,
        dislikes: 0
      }
    ]
  }
];

const seedSubscriber = [
  "furqonwahyudi1603@gmail.com",
  "andrian@outlook.com",
  "dian.puspita@company.co.id"
];

const seedLogs = [
  { timestamp: "2026-06-28T06:00:00.000Z", user: "Super Admin", role: "Super Admin", action: "System Initialize & Seed database" },
  { timestamp: "2026-06-28T06:10:00.000Z", user: "Hendry Tan (Editor)", role: "Editor", action: "Approved Article: Poros Madura AI Luncurkan LLM Bahasa Indonesia Pertama" },
  { timestamp: "2026-06-28T07:12:00.000Z", user: "Giri Wijaya (Editor)", role: "Editor", action: "Published Article: Koalisi Merah Putih Sepakati Arah Baru Reformasi Parlemen" },
  { timestamp: "2026-06-28T08:15:00.000Z", user: "Super Admin", role: "Super Admin", action: "Updated Ad Banner: Billboard Top - Poros Madura Premium" }
];

const defaultSettings = {
  siteName: "POROS MADURA",
  tagline: "Menyatukan Informasi, Mengawal Aspirasi Madura.",
  logoUrl: "",
  primaryColor: "#1C0770",
  secondaryColor: "#261CC1",
  accentColor: "#FFC81E",
  contactEmail: "redaksi@porosmadura.com",
  contactPhone: "+62 21 5550 123",
  address: "Gedung Poros Madura Enterprise Lt. 12-15, Jalan Jenderal Sudirman No. 50, Jakarta Selatan, 12190",
  socials: {
    facebook: "https://facebook.com/porosmadura",
    instagram: "https://instagram.com/porosmadura",
    twitter: "https://twitter.com/porosmadura",
    tiktok: "https://tiktok.com/@porosmadura",
    youtube: "https://youtube.com/porosmadura",
    linkedin: "https://linkedin.com/company/porosmadura"
  }
};


// ==========================================
// ENTERPRISE AD SYSTEM SEEDS & DEFINITIONS
// ==========================================

const seedAdSlots = [
  { id: "slot-01", name: "Top Billboard", slug: "top-billboard", size: "970x250", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-02", name: "Top Leaderboard", slug: "top-leaderboard", size: "728x90", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-03", name: "Header Banner", slug: "header-banner", size: "468x60", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-04", name: "Floating Left Skyscraper", slug: "floating-left-skyscraper", size: "160x600", type: "floating", page: "homepage", status: "active", priority: 1, lazyLoad: true, sticky: true, floating: true, closeButton: true, responsive: false },
  { id: "slot-05", name: "Floating Right Skyscraper", slug: "floating-right-skyscraper", size: "160x600", type: "floating", page: "homepage", status: "active", priority: 1, lazyLoad: true, sticky: true, floating: true, closeButton: true, responsive: false },
  { id: "slot-06", name: "Hero Banner", slug: "hero-banner", size: "728x90", type: "display", page: "homepage", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-07", name: "Breaking News Banner", slug: "breaking-news-banner", size: "728x90", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-08", name: "Homepage Banner Atas", slug: "homepage-banner-atas", size: "970x90", type: "display", page: "homepage", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-09", name: "Homepage Banner Tengah", slug: "homepage-banner-tengah", size: "728x90", type: "display", page: "homepage", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-10", name: "Homepage Banner Bawah", slug: "homepage-banner-bawah", size: "970x250", type: "display", page: "homepage", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-11", name: "Sidebar Top", slug: "sidebar-top", size: "300x250", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-12", name: "Sidebar Middle", slug: "sidebar-middle", size: "300x250", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-13", name: "Sidebar Bottom", slug: "sidebar-bottom", size: "300x250", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-14", name: "Sidebar Sticky", slug: "sidebar-sticky", size: "300x600", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: true, floating: false, closeButton: false, responsive: true },
  { id: "slot-15", name: "In Feed #1", slug: "in-feed-1", size: "728x90", type: "native", page: "homepage,kategori", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-16", name: "In Feed #2", slug: "in-feed-2", size: "728x90", type: "native", page: "homepage,kategori", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-17", name: "In Feed #3", slug: "in-feed-3", size: "728x90", type: "native", page: "homepage,kategori", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-18", name: "In Feed #4", slug: "in-feed-4", size: "728x90", type: "native", page: "homepage,kategori", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-19", name: "In Article #1", slug: "in-article-1", size: "728x90", type: "native", page: "artikel", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-20", name: "In Article #2", slug: "in-article-2", size: "728x90", type: "native", page: "artikel", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-21", name: "In Article #3", slug: "in-article-3", size: "728x90", type: "native", page: "artikel", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-22", name: "In Article #4", slug: "in-article-4", size: "728x90", type: "native", page: "artikel", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-23", name: "Category Banner", slug: "category-banner", size: "970x90", type: "display", page: "kategori", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-24", name: "Related News Banner", slug: "related-news-banner", size: "728x90", type: "display", page: "artikel", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-25", name: "Video Banner", slug: "video-banner", size: "640x360", type: "video", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-26", name: "Footer Billboard", slug: "footer-billboard", size: "970x250", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-27", name: "Footer Banner", slug: "footer-banner", size: "728x90", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-28", name: "Mobile Top Banner", slug: "mobile-top-banner", size: "320x50", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-29", name: "Mobile In Feed Banner", slug: "mobile-in-feed-banner", size: "320x100", type: "display", page: "homepage,kategori", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-30", name: "Mobile Anchor Banner", slug: "mobile-anchor-banner", size: "320x50", type: "display", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: true, responsive: true },
  { id: "slot-31", name: "Popup / Interstitial", slug: "popup-interstitial", size: "500x500", type: "popup", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: true, responsive: true },
  { id: "slot-32", name: "Video Pre-Roll", slug: "video-pre-roll", size: "640x360", type: "video", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-33", name: "Video Mid-Roll", slug: "video-mid-roll", size: "640x360", type: "video", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-34", name: "Video Post-Roll", slug: "video-post-roll", size: "640x360", type: "video", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
  { id: "slot-35", name: "Native Banner", slug: "native-banner", size: "300x250", type: "native", page: "all", status: "active", priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true }
];

const seedAdvertisers = [
  { id: "adv-1", name: "Samsung Indonesia", email: "ads@samsung.co.id", phone: "+62 21 2937 4000", company: "PT Samsung Electronics Indonesia", status: "active" },
  { id: "adv-2", name: "Bank Mandiri", email: "marketing@bankmandiri.co.id", phone: "+62 21 526 8282", company: "PT Bank Mandiri (Persero) Tbk", status: "active" },
  { id: "adv-3", name: "Telkomsel", email: "ads@telkomsel.co.id", phone: "+62 21 5289 1234", company: "PT Telekomunikasi Selular", status: "active" },
  { id: "adv-4", name: "Traveloka Indonesia", email: "adops@traveloka.com", phone: "+62 21 2977 5800", company: "PT Trinusa Travelindo", status: "active" }
];

const seedCampaigns = [
  { id: "camp-1", name: "Galaxy S26 Ultra Launch", advertiserId: "adv-1", budget: 150000000, startDate: "2026-06-01", endDate: "2026-08-31", status: "active" },
  { id: "camp-2", name: "Livin by Mandiri Campaign 2026", advertiserId: "adv-2", budget: 240000000, startDate: "2026-05-15", endDate: "2026-10-15", status: "active" },
  { id: "camp-3", name: "Telkomsel Hyper 5G Promo", advertiserId: "adv-3", budget: 90000000, startDate: "2026-07-01", endDate: "2026-07-31", status: "active" },
  { id: "camp-4", name: "Traveloka Epic Sale 2026", advertiserId: "adv-4", budget: 180000000, startDate: "2026-06-10", endDate: "2026-07-31", status: "active" }
];

const seedAdCategories = [
  { id: "acat-1", name: "Technology & Gadget", slug: "tech-gadget" },
  { id: "acat-2", name: "Banking & Finance", slug: "banking-finance" },
  { id: "acat-3", name: "Telecommunication", slug: "telecommunication" },
  { id: "acat-4", name: "Travel & Lifestyle", slug: "travel-lifestyle" }
];

const seedAdPricing = [
  { id: "price-01", slotSlug: "top-billboard", pricePerDay: 2500000, pricePerImpression: 15, pricePerClick: 1200 },
  { id: "price-02", slotSlug: "top-leaderboard", pricePerDay: 1800000, pricePerImpression: 10, pricePerClick: 1000 },
  { id: "price-04", slotSlug: "floating-left-skyscraper", pricePerDay: 3000000, pricePerImpression: 20, pricePerClick: 1500 }
];

const seedAdMediaLibrary = [
  { id: "media-1", name: "Samsung S26 Ultra Banner Desktop", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=970&h=250&q=80", tags: ["samsung", "s26", "desktop"], uploadedAt: "2026-06-01T09:00:00.000Z" },
  { id: "media-2", name: "Samsung S26 Ultra Banner Mobile", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=320&h=100&q=80", tags: ["samsung", "s26", "mobile"], uploadedAt: "2026-06-01T09:05:00.000Z" },
  { id: "media-3", name: "Livin Mandiri Leaderboard", url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=728&h=90&q=80", tags: ["mandiri", "livin", "leaderboard"], uploadedAt: "2026-05-15T08:30:00.000Z" }
];

const seedAdSettings = {
  adsensePublisherId: "pub-5510668293774811",
  googleAdManagerId: "/1234567/poros_madura_leaderboard",
  inFeedGap: 4,
  inArticleParagraphs: [3, 6, 10, 15],
  interstitialFrequency: 3
};

const seedAds = [];
let db = {
  articles: seedArticles,
  categories: initialCategories,
  adSlots: seedAdSlots,
  advertisers: seedAdvertisers,
  campaigns: seedCampaigns,
  adCategories: seedAdCategories,
  adPricing: seedAdPricing,
  adMediaLibrary: seedAdMediaLibrary,
  adSettings: seedAdSettings,
  ads: seedAds,
  comments: seedComments,
  subscribers: seedSubscriber,
  logs: seedLogs,
  settings: defaultSettings,
  visitors: [
    { date: "22 Jun", visits: 18500, pageviews: 42000 },
    { date: "23 Jun", visits: 21000, pageviews: 48500 },
    { date: "24 Jun", visits: 19200, pageviews: 45000 },
    { date: "25 Jun", visits: 24500, pageviews: 58000 },
    { date: "26 Jun", visits: 28900, pageviews: 64000 },
    { date: "27 Jun", visits: 31200, pageviews: 71000 },
    { date: "28 Jun", visits: 34500, pageviews: 78500 }
  ],
  searchAnalytics: [
    { term: "Kereta Cepat", count: 820 },
    { term: "Suku Bunga BI", count: 450 },
    { term: "LLM Indonesia", count: 1200 },
    { term: "Toraja Festival", count: 320 },
    { term: "Piala Dunia", count: 1450 }
  ],
  sitemapStatus: null as any
};

const categoryImagePools: Record<string, string[]> = {
  "Teknologi": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=80"
  ],
  "Olahraga": [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1471958680802-1345a694ba6d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80"
  ],
  "Kesehatan": [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1200&q=80"
  ],
  "Pendidikan": [
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"
  ],
  "Ekonomi": [
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
  ],
  "Hiburan": [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80"
  ],
  "Opini": [
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"
  ]
};

function getDiverseImage(category: string, id: string, title: string, defaultValue: string): string {
  const pool = categoryImagePools[category];
  if (!pool || pool.length === 0) return defaultValue;
  
  let hash = 0;
  const str = id + title;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

// Load database if it exists
function generateDynamicArticles() {
  const categories = [
    { name: "Politik", sub: "Parlemen", tags: ["Politik", "DPR", "Kebijakan"] },
    { name: "Nasional", sub: "Pemerintah", tags: ["Pemerintah", "Nasional", "Infrastruktur"] },
    { name: "Daerah", sub: "Pembangunan", tags: ["Daerah", "Wisata", "Budaya"] },
    { name: "Internasional", sub: "Diplomasi", tags: ["Internasional", "Dunia", "Hubungan"] },
    { name: "Ekonomi", sub: "Finansial", tags: ["Ekonomi", "Investasi", "Pasar"] },
    { name: "Hukum", sub: "Keadilan", tags: ["Hukum", "MK", "Regulasi"] },
    { name: "Kriminal", sub: "Kepolisian", tags: ["Kriminal", "Kejahatan", "Polisi"] },
    { name: "Pendidikan", sub: "Sekolah", tags: ["Pendidikan", "Sekolah", "Beasiswa"] },
    { name: "Teknologi", sub: "Siber", tags: ["Teknologi", "AI", "Startup"] },
    { name: "Olahraga", sub: "Kompetisi", tags: ["Olahraga", "Prestasi", "Timnas"] },
    { name: "Otomotif", sub: "Modifikasi", tags: ["Otomotif", "Mobil", "Motor"] },
    { name: "Lifestyle", sub: "Trend", tags: ["Lifestyle", "Fesyen", "Gaya"] },
    { name: "Kesehatan", sub: "Layanan", tags: ["Kesehatan", "Kemenkes", "Medis"] },
    { name: "Hiburan", sub: "Seni", tags: ["Musik", "Hiburan", "Seni"] },
    { name: "Opini", sub: "Analisis", tags: ["Opini", "Analisis", "Refleksi"] },
    { name: "Kolom", sub: "Esai", tags: ["Kolom", "Esai", "Catatan"] },
    { name: "Infografis", sub: "Visual", tags: ["Infografis", "Visual", "Data"] },
    { name: "Video", sub: "Multimedia", tags: ["Video", "Streaming", "Laporan"] },
    { name: "Foto", sub: "Galeri", tags: ["Foto", "Galeri", "Peristiwa"] },
    { name: "Editorial", sub: "Redaksi", tags: ["Editorial", "Redaksi", "Sikap"] }
  ];

  const subthemes = [
    {
      title: "Gebrakan Baru {kebijakan} Siap Mendorong {sektor} di {wilayah}",
      content: "Jakarta, Poros Madura — Langkah taktis pemerintah daerah dalam merilis kebijakan {kebijakan} baru mendapat apresiasi positif dari kalangan industri. Kebijakan ini diproyeksikan mampu mendongkrak geliat {sektor} di kawasan {wilayah} secara signifikan dalam waktu dekat.\n\nBeberapa pelaku usaha menyatakan bahwa regulasi ini memberikan kepastian hukum serta keringanan operasional yang sangat dinantikan. 'Kami optimis inisiatif ini membawa perubahan konkret bagi pertumbuhan ekonomi masyarakat lokal,' ujar perwakilan asosiasi dagang setempat.",
      image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Menilik Kesiapan Infrastruktur {kebijakan} Guna Mendukung {sektor} di {wilayah}",
      content: "{wilayah}, Poros Madura — Sinergi lintas sektoral terus dikerahkan guna mengawal implementasi {kebijakan} di lapangan. Kunjungan kerja dinas terkait memastikan seluruh instrumen pendukung {sektor} telah siap beroperasi penuh.\n\nDalam laporannya, kesiapan teknis di {wilayah} dilaporkan telah mencapai lebih dari 90 persen. Hal ini diharapkan mampu menekan inefisiensi logistik serta memberikan layanan terbaik bagi publik.",
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Inovasi Strategis: Penerapan Sistem {kebijakan} demi Efisiensi {sektor} {wilayah}",
      content: "{wilayah}, Poros Madura — Era digital menuntut perubahan metode kerja yang serba cepat dan akurat. Integrasi sistem {kebijakan} ke dalam ekosistem {sektor} lokal terbukti mampu menghemat biaya operasional hingga 30 persen.\n\nUji coba yang dilakukan sebulan terakhir menunjukkan respon kepuasan masyarakat yang sangat tinggi. Diharapkan model sukses di {wilayah} ini dapat segera diadaptasi secara nasional oleh kementerian terkait.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  const kebijakanList = [
    "Digitalisasi Birokrasi Terpadu",
    "Insentif Pajak Usaha Mikro",
    "Sistem Transportasi Cerdas",
    "Transisi Energi Ramah Lingkungan",
    "Sertifikasi Kompetensi Kejuruan",
    "Proteksi Kedaulatan Data Digital",
    "Suku Bunga Pinjaman Rendah",
    "Ketahanan Pangan Mandiri"
  ];

  const sektorList = [
    "Sektor Ekonomi Kreatif",
    "Manufaktur Berkelanjutan",
    "Pariwisata Budaya Lokal",
    "Layanan Kesehatan Terintegrasi",
    "Pendidikan Vokasi Unggulan",
    "Teknologi Finansial Inklusif",
    "Pertanian Presisi Modern",
    "Keamanan Informasi Siber"
  ];

  const wilayahList = [
    "Jakarta Raya", "Surabaya", "Bandung Raya", "Medan", "Makassar", 
    "Yogyakarta", "Semarang", "Palembang", "Balikpapan", "Denpasar",
    "Solo", "Malang", "Manado", "Banjarmasin", "Pontianak"
  ];

  const authors = [
    "Budi Santoso", "Siti Rahma", "Irwan Syah", "Dewi Lestari", 
    "Dr. Amanda Raisa", "Bambang Pamungkas", "Prof. Ahmad Sodikin", 
    "Maria Ulfa", "Hendry Tan", "Andini Putri", "Rian Hidayat"
  ];

  const list: any[] = [];
  let articleId = 1;

  for (const cat of categories) {
    for (let j = 1; j <= 20; j++) {
      const theme = subthemes[articleId % subthemes.length];
      const kebijakan = kebijakanList[articleId % kebijakanList.length];
      const sektor = sektorList[(articleId + 2) % sektorList.length];
      const wilayah = wilayahList[(articleId + 4) % wilayahList.length];
      const author = authors[articleId % authors.length];
      
      let title = theme.title
        .replace("{kebijakan}", kebijakan)
        .replace("{sektor}", sektor)
        .replace("{wilayah}", wilayah);
        
      let content = theme.content
        .replace("{kebijakan}", kebijakan)
        .replace("{sektor}", sektor)
        .replace("{wilayah}", wilayah)
        .replace("{wilayah}", wilayah);

      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-") + `-${articleId}`;

      const date = new Date();
      date.setDate(date.getDate() - (articleId % 15));
      date.setHours(8 + (articleId % 8), (articleId * 12) % 60, 0, 0);

      const views = 500 + (articleId * 135) % 4000;
      const reads = Math.floor(views * 0.7);
      const shares = Math.floor(views * 0.15);

      let image = getDiverseImage(cat.name, `art-generated-${articleId}`, title, theme.image);

      list.push({
        id: `art-generated-${articleId}`,
        title,
        slug,
        category: cat.name,
        subCategory: cat.sub,
        content,
        tags: [...cat.tags, kebijakan.split(" ")[0]],
        image,
        author,
        reporter: authors[(articleId + 1) % authors.length],
        editor: "Giri Wijaya",
        publishDate: date.toISOString(),
        status: "published",
        views,
        reads,
        shares,
        isBreaking: (articleId % 15 === 0),
        isHeadline: (articleId % 12 === 0),
        isEditorChoice: (articleId % 18 === 0),
        isTrending: (articleId % 10 === 0),
        videoUrl: "",
        audioUrl: "",
        metaDescription: `${title}. Baca berita selengkapnya hanya di Poros Madura.`,
        metaKeywords: cat.tags,
        canonicalUrl: `https://porosmadura.com/${cat.name.toLowerCase()}/${slug}`
      });

      articleId++;
    }
  }
  return list;
}

function ensureAtLeast50Articles() {
  db.articles = generateDynamicArticles();
}

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      if (data.trim()) {
        const loaded = JSON.parse(data);
        db = { ...db, ...loaded };
      }
    }
    
    // Ensure we always have at least 50 articles
    if (!db.articles || db.articles.length < 50) {
      ensureAtLeast50Articles();
      saveDb();
    }

    // Migrate existing articles to have diverse images
    if (db.articles && db.articles.length > 0) {
      let changed = false;
      for (const art of db.articles) {
        const newImg = getDiverseImage(art.category, art.id, art.title, art.image);
        if (art.image !== newImg) {
          art.image = newImg;
          changed = true;
        }
      }
      if (changed) {
        saveDb();
      }
    }
  } catch (err) {
    console.error("Failed to load db.json, using seed:", err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save db.json:", err);
  }
}

type SitemapOptions = {
  includeArticles?: boolean;
  includeCategories?: boolean;
  includeTags?: boolean;
  includeAuthors?: boolean;
};

type SitemapFileResult = {
  name: string;
  url: string;
  path: string;
  count: number;
  updatedAt: string;
};

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function slugifySegment(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isoDateOnly(value?: string): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split("T")[0];
  }
  return date.toISOString().split("T")[0];
}

function getPublishedArticles() {
  return [...(db.articles || [])]
    .filter((article: any) => article.status === "published" && article.slug && article.category)
    .sort((a: any, b: any) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime());
}

function buildArticleUrl(article: any): string {
  const category = slugifySegment(article.category || "artikel");
  return `${SITE_URL}/${category}/${article.slug}`;
}

function buildUrlset(entries: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }>): string {
  const urls = entries.map(entry => [
    "  <url>",
    `    <loc>${escapeXml(entry.loc)}</loc>`,
    entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "",
    entry.changefreq ? `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>` : "",
    entry.priority ? `    <priority>${escapeXml(entry.priority)}</priority>` : "",
    "  </url>"
  ].filter(Boolean).join("\n"));

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`
  ].join("\n");
}

function buildSitemapIndex(files: SitemapFileResult[]): string {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...files.filter(file => file.name !== "sitemap.xml").map(file => [
      "  <sitemap>",
      `    <loc>${escapeXml(file.url)}</loc>`,
      `    <lastmod>${escapeXml(file.updatedAt)}</lastmod>`,
      "  </sitemap>"
    ].join("\n")),
    `</sitemapindex>`
  ].join("\n");
}

function buildNewsSitemap(articles: any[]): string {
  const latestNews = articles.slice(0, 1000).map(article => [
    "  <url>",
    `    <loc>${escapeXml(buildArticleUrl(article))}</loc>`,
    "    <news:news>",
    "      <news:publication>",
    "        <news:name>Poros Madura</news:name>",
    "        <news:language>id</news:language>",
    "      </news:publication>",
    `      <news:publication_date>${escapeXml(article.publishDate || new Date().toISOString())}</news:publication_date>`,
    `      <news:title>${escapeXml(article.title)}</news:title>`,
    "    </news:news>",
    "  </url>"
  ].join("\n"));

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`,
    ...latestNews,
    `</urlset>`
  ].join("\n");
}

function writeSitemapFile(name: string, xml: string, count: number): SitemapFileResult {
  const targetPath = path.join(PUBLIC_STORAGE_PATH, name);
  fs.writeFileSync(targetPath, xml, "utf8");
  const updatedAt = new Date().toISOString();
  return {
    name,
    url: `${SITE_URL}/${name}`,
    path: targetPath,
    count,
    updatedAt
  };
}

function generateSitemaps(options: SitemapOptions = {}) {
  const includeArticles = options.includeArticles !== false;
  const includeCategories = options.includeCategories !== false;
  const includeTags = options.includeTags !== false;
  const includeAuthors = options.includeAuthors !== false;
  const articles = getPublishedArticles();
  const latestArticleDate = isoDateOnly(articles[0]?.publishDate);

  const pages = [
    { loc: `${SITE_URL}/`, lastmod: latestArticleDate, changefreq: "always", priority: "1.0" },
    { loc: `${SITE_URL}/admin`, lastmod: latestArticleDate, changefreq: "monthly", priority: "0.2" }
  ];

  const articleEntries = includeArticles ? articles.map((article: any) => ({
    loc: buildArticleUrl(article),
    lastmod: isoDateOnly(article.publishDate),
    changefreq: "weekly",
    priority: "0.8"
  })) : [];

  const categoryEntries = includeCategories ? (db.categories || []).map((category: string) => ({
    loc: `${SITE_URL}/category/${slugifySegment(category)}`,
    lastmod: latestArticleDate,
    changefreq: "weekly",
    priority: "0.6"
  })) : [];

  const uniqueTags = Array.from(new Set(articles.flatMap((article: any) => article.tags || []))).filter(Boolean) as string[];
  const tagEntries = includeTags ? uniqueTags.map(tag => ({
    loc: `${SITE_URL}/tag/${slugifySegment(tag)}`,
    lastmod: latestArticleDate,
    changefreq: "weekly",
    priority: "0.4"
  })) : [];

  const uniqueAuthors = Array.from(new Set(articles.map((article: any) => article.author).filter(Boolean))) as string[];
  const authorEntries = includeAuthors ? uniqueAuthors.map(author => ({
    loc: `${SITE_URL}/author/${slugifySegment(author)}`,
    lastmod: latestArticleDate,
    changefreq: "weekly",
    priority: "0.4"
  })) : [];

  const files: SitemapFileResult[] = [];
  files.push(writeSitemapFile("sitemap-pages.xml", buildUrlset(pages), pages.length));
  files.push(writeSitemapFile("sitemap-articles.xml", buildUrlset(articleEntries), articleEntries.length));
  files.push(writeSitemapFile("sitemap-categories.xml", buildUrlset(categoryEntries), categoryEntries.length));
  files.push(writeSitemapFile("sitemap-tags.xml", buildUrlset(tagEntries), tagEntries.length));
  files.push(writeSitemapFile("sitemap-authors.xml", buildUrlset(authorEntries), authorEntries.length));
  files.push(writeSitemapFile("sitemap-news.xml", buildNewsSitemap(includeArticles ? articles : []), includeArticles ? Math.min(articles.length, 1000) : 0));

  const indexFile = writeSitemapFile("sitemap.xml", buildSitemapIndex(files), files.reduce((sum, file) => sum + file.count, 0));
  const allFiles = [indexFile, ...files];
  const totalUrls = files.reduce((sum, file) => sum + file.count, 0);

  db.sitemapStatus = {
    generatedAt: new Date().toISOString(),
    totalUrls,
    options: { includeArticles, includeCategories, includeTags, includeAuthors },
    files: allFiles.map(file => ({ name: file.name, url: file.url, count: file.count, updatedAt: file.updatedAt })),
    counts: {
      pages: pages.length,
      articles: articleEntries.length,
      categories: categoryEntries.length,
      tags: tagEntries.length,
      authors: authorEntries.length,
      news: includeArticles ? Math.min(articles.length, 1000) : 0
    }
  };

  return db.sitemapStatus;
}

function ensureSitemapFiles() {
  const sitemapPath = path.join(PUBLIC_STORAGE_PATH, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    generateSitemaps({ includeArticles: true, includeCategories: true, includeTags: true, includeAuthors: true });
    saveDb();
  }
}

function sendSitemapFile(res: express.Response, filename: string) {
  ensureSitemapFiles();
  const targetPath = path.join(PUBLIC_STORAGE_PATH, filename);
  if (!fs.existsSync(targetPath)) {
    res.status(404).type("text/plain").send("Sitemap file not found");
    return;
  }
  res.type("application/xml").send(fs.readFileSync(targetPath, "utf8"));
}

// Load DB immediately
loadDb();

// Initialize Market Live Service Components (Dependency Injection)
const cacheService = CacheService.getInstance();
const marketProviders = [
  new YahooFinanceIDXProvider(),
  new ReserveIDXProvider(),
  new YahooFinanceCurrencyProvider(),
  new ExchangeRateHostCurrencyProvider(),
  new TwelveDataCurrencyProvider(),
  new FixerCurrencyProvider(),
  new OpenExchangeRatesCurrencyProvider(),
  new ReserveCurrencyProvider(),
  new LogamMuliaGoldProvider(),
  new PegadaianGoldProvider(),
  new ReserveGoldProvider()
];

export const marketDataService = new MarketDataService(cacheService, marketProviders);
const marketScheduler = new MarketScheduler(marketDataService);
export const marketController = new MarketController(marketDataService);

// Start background synchronization
marketScheduler.start();

// Setup Express parser limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API: Settings
app.get("/api/settings", (req, res) => {
  res.json(db.settings);
});

app.post("/api/settings", (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  saveDb();
  res.json({ success: true, settings: db.settings });
});

// API: Categories
app.get("/api/categories", (req, res) => {
  res.json(db.categories);
});

app.post("/api/categories", (req, res) => {
  const { name } = req.body;
  if (name && !db.categories.includes(name)) {
    db.categories.push(name);
    saveDb();
  }
  res.json({ success: true, categories: db.categories });
});

// API: Articles (GET with filters)
app.get("/api/articles", (req, res) => {
  let list = [...db.articles];
  const { category, search, status, limit } = req.query;

  if (category) {
    const catLower = (category as string).toLowerCase();
    list = list.filter(a => 
      (a.category && a.category.toLowerCase() === catLower) ||
      (a.subCategory && a.subCategory.toLowerCase() === catLower)
    );
  }
  if (status && status !== "all") {
    list = list.filter(a => a.status === status);
  } else if (!status) {
    // default only show published
    list = list.filter(a => a.status === "published");
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
    
    // Log search query
    if (q.trim().length > 2) {
      const foundTerm = db.searchAnalytics.find(t => t.term.toLowerCase() === q.trim().toLowerCase());
      if (foundTerm) {
        foundTerm.count += 1;
      } else {
        db.searchAnalytics.push({ term: q.trim(), count: 1 });
      }
      saveDb();
    }
  }

  // Sort by publishDate descending
  list.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  if (limit) {
    list = list.slice(0, parseInt(limit as string));
  }

  res.json(list);
});

// API: Single Article GET
app.get("/api/articles/:slug", (req, res) => {
  const article = db.articles.find(a => a.slug === req.params.slug);
  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  // Increment views
  article.views = (article.views || 0) + 1;
  saveDb();

  res.json(article);
});

// API: Create Article
app.post("/api/articles", (req, res) => {
  const { title, content, category, subCategory, image, tags, isBreaking, isHeadline, isEditorChoice, isTrending, videoUrl, audioUrl, status, author } = req.body;
  
  if (!title || !content || !category) {
    return res.status(400).json({ error: "Title, content, and category are required" });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const newArticle = {
    id: "art-" + Date.now(),
    title,
    slug,
    category,
    subCategory: subCategory || "",
    content,
    tags: tags || [],
    image: image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    author: author || "Staff Editor",
    reporter: "Andini Putri",
    editor: "Giri Wijaya",
    publishDate: new Date().toISOString(),
    status: status || "published",
    views: 0,
    reads: 0,
    shares: 0,
    isBreaking: !!isBreaking,
    isHeadline: !!isHeadline,
    isEditorChoice: !!isEditorChoice,
    isTrending: !!isTrending,
    videoUrl: videoUrl || "",
    audioUrl: audioUrl || "",
    metaDescription: content.substring(0, 150) + "...",
    metaKeywords: tags || [],
    canonicalUrl: `https://porosmadura.com/${category.toLowerCase()}/${slug}`
  };

  db.articles.push(newArticle);

  // Add Log Action
  db.logs.unshift({
    timestamp: new Date().toISOString(),
    user: "Super Admin",
    role: "Super Admin",
    action: `Created article: ${title}`
  });

  saveDb();
  res.json({ success: true, article: newArticle });
});

// API: Edit Article
app.put("/api/articles/:id", (req, res) => {
  const index = db.articles.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Article not found" });
  }

  db.articles[index] = { ...db.articles[index], ...req.body };
  
  // Add Log Action
  db.logs.unshift({
    timestamp: new Date().toISOString(),
    user: "Super Admin",
    role: "Super Admin",
    action: `Edited article: ${db.articles[index].title}`
  });

  saveDb();
  res.json({ success: true, article: db.articles[index] });
});

// API: Delete Article
app.delete("/api/articles/:id", (req, res) => {
  const index = db.articles.findIndex(a => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Article not found" });
  }

  const title = db.articles[index].title;
  db.articles.splice(index, 1);

  db.logs.unshift({
    timestamp: new Date().toISOString(),
    user: "Super Admin",
    role: "Super Admin",
    action: `Deleted article: ${title}`
  });

  saveDb();
  res.json({ success: true });
});

// API: Comments (GET & POST)
app.get("/api/comments/:slug", (req, res) => {
  const comments = db.comments.filter(c => c.articleSlug === req.params.slug);
  res.json(comments);
});

app.post("/api/comments/:slug", (req, res) => {
  const { author, content, parentId } = req.body;
  if (!author || !content) {
    return res.status(400).json({ error: "Author and content are required" });
  }

  if (parentId) {
    const mainComment = db.comments.find(c => c.id === parentId);
    if (mainComment) {
      if (!mainComment.replies) mainComment.replies = [];
      mainComment.replies.push({
        id: "rep-" + Date.now(),
        author,
        content,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0
      });
    }
  } else {
    db.comments.push({
      id: "c-" + Date.now(),
      articleSlug: req.params.slug,
      author,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      replies: []
    });
  }

  saveDb();
  res.json({ success: true });
});

// Comments Interaction (Like/Dislike)
app.post("/api/comments/:commentId/like", (req, res) => {
  const comment = db.comments.find(c => c.id === req.params.commentId);
  if (comment) {
    comment.likes = (comment.likes || 0) + 1;
    saveDb();
    return res.json({ success: true, likes: comment.likes });
  }
  
  // Search in replies
  for (const c of db.comments) {
    if (c.replies) {
      const rep = c.replies.find(r => r.id === req.params.commentId);
      if (rep) {
        rep.likes = (rep.likes || 0) + 1;
        saveDb();
        return res.json({ success: true, likes: rep.likes });
      }
    }
  }
  res.status(404).json({ error: "Comment not found" });
});

// API: Share Count Incrementor
app.post("/api/articles/:slug/share", (req, res) => {
  const article = db.articles.find(a => a.slug === req.params.slug);
  if (article) {
    article.shares = (article.shares || 0) + 1;
    saveDb();
    res.json({ success: true, shares: article.shares });
  } else {
    res.status(404).json({ error: "Article not found" });
  }
});

// ==========================================
// ENTERPRISE AD SYSTEM API ENDPOINTS (REST & ANALYTICS)
// ==========================================

// Global Summary / Metrics Dashboard
app.get("/api/ad-system/summary", (req, res) => {
  const ads = db.ads || [];
  const slots = db.adSlots || [];
  const advertisers = db.advertisers || [];

  const totalAds = ads.length;
  const adsActive = ads.filter(a => a.status === 'active').length;
  const adsExpired = ads.filter(a => a.status === 'expired').length;
  const pending = ads.filter(a => a.status === 'pending').length;
  const draft = ads.filter(a => a.status === 'draft').length;

  let totalImpression = 0;
  let totalClick = 0;
  let revenue = 0;
  let sumViewability = 0;
  let activeWithViewability = 0;

  ads.forEach(ad => {
    totalImpression += (ad.impressions || 0);
    totalClick += (ad.clicks || 0);
    revenue += (ad.revenue || 0);
    if (ad.viewability) {
      sumViewability += ad.viewability;
      activeWithViewability++;
    }
  });

  const ctr = totalImpression > 0 ? Number(((totalClick / totalImpression) * 100).toFixed(2)) : 0;
  const avgViewability = activeWithViewability > 0 ? Math.round(sumViewability / activeWithViewability) : 85;

  // Top Advertiser
  const advStats = {};
  ads.forEach(ad => {
    advStats[ad.advertiserId] = (advStats[ad.advertiserId] || 0) + (ad.revenue || 0);
  });
  let topAdvertiser = "Belum Ada";
  let maxRev = -1;
  Object.keys(advStats).forEach(id => {
    if (advStats[id] > maxRev) {
      maxRev = advStats[id];
      const advObj = advertisers.find(a => a.id === id);
      topAdvertiser = advObj ? advObj.name : id;
    }
  });

  // Top Slot
  const slotStats = {};
  ads.forEach(ad => {
    slotStats[ad.slotSlug] = (slotStats[ad.slotSlug] || 0) + (ad.impressions || 0);
  });
  let topSlot = "Belum Ada";
  let maxImps = -1;
  Object.keys(slotStats).forEach(slug => {
    if (slotStats[slug] > maxImps) {
      maxImps = slotStats[slug];
      const slotObj = slots.find(s => s.slug === slug);
      topSlot = slotObj ? slotObj.name : slug;
    }
  });

  // Daily Chart (7 Days mockup)
  const chartDaily = [
    { date: "Senin", impressions: 8200, clicks: 210, revenue: 1500000 },
    { date: "Selasa", impressions: 9400, clicks: 250, revenue: 1900000 },
    { date: "Rabu", impressions: 8800, clicks: 230, revenue: 1600000 },
    { date: "Kamis", impressions: 11200, clicks: 310, revenue: 2500000 },
    { date: "Jumat", impressions: 12400, clicks: 340, revenue: 2900000 },
    { date: "Sabtu", impressions: 14500, clicks: 420, revenue: 3800000 },
    { date: "Minggu", impressions: 15800, clicks: 480, revenue: 4200000 }
  ];

  // Monthly Chart
  const chartMonthly = [
    { name: "Jan", impressions: 180000, clicks: 4500, revenue: 35000000 },
    { name: "Feb", impressions: 195000, clicks: 5100, revenue: 42000000 },
    { name: "Mar", impressions: 210000, clicks: 5400, revenue: 48000000 },
    { name: "Apr", impressions: 220000, clicks: 5800, revenue: 51000000 },
    { name: "Mei", impressions: 245000, clicks: 6800, revenue: 64000000 },
    { name: "Jun", impressions: 289000, clicks: 8200, revenue: 78000000 }
  ];

  // Yearly Chart
  const chartYearly = [
    { name: "2024", impressions: 1200000, clicks: 32000, revenue: 240000000 },
    { name: "2025", impressions: 1800000, clicks: 48000, revenue: 390000000 },
    { name: "2026", impressions: 2400000, clicks: 62000, revenue: 520000000 }
  ];

  res.json({
    totalAds,
    adsActive,
    adsExpired,
    pending,
    draft,
    totalImpression,
    totalClick,
    ctr,
    revenue,
    viewability: avgViewability,
    topAdvertiser,
    topSlot,
    chartDaily,
    chartMonthly,
    chartYearly
  });
});

// CRUD: Ad Slots
app.get("/api/ad-slots", (req, res) => {
  res.json(db.adSlots || []);
});
app.post("/api/ad-slots", (req, res) => {
  const newSlot = { id: "slot-" + Date.now(), ...req.body };
  if (!db.adSlots) db.adSlots = [];
  db.adSlots.push(newSlot);
  saveDb();
  res.json({ success: true, slot: newSlot });
});
app.put("/api/ad-slots/:id", (req, res) => {
  const idx = db.adSlots.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Slot not found" });
  db.adSlots[idx] = { ...db.adSlots[idx], ...req.body };
  saveDb();
  res.json({ success: true, slot: db.adSlots[idx] });
});
app.delete("/api/ad-slots/:id", (req, res) => {
  const idx = db.adSlots.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Slot not found" });
  const deleted = db.adSlots.splice(idx, 1);
  saveDb();
  res.json({ success: true, slot: deleted[0] });
});

// CRUD: Advertisers
app.get("/api/advertisers", (req, res) => {
  res.json(db.advertisers || []);
});
app.post("/api/advertisers", (req, res) => {
  const newAdv = { id: "adv-" + Date.now(), ...req.body };
  if (!db.advertisers) db.advertisers = [];
  db.advertisers.push(newAdv);
  saveDb();
  res.json({ success: true, advertiser: newAdv });
});
app.put("/api/advertisers/:id", (req, res) => {
  const idx = db.advertisers.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Advertiser not found" });
  db.advertisers[idx] = { ...db.advertisers[idx], ...req.body };
  saveDb();
  res.json({ success: true, advertiser: db.advertisers[idx] });
});
app.delete("/api/advertisers/:id", (req, res) => {
  const idx = db.advertisers.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Advertiser not found" });
  const deleted = db.advertisers.splice(idx, 1);
  saveDb();
  res.json({ success: true, advertiser: deleted[0] });
});

// CRUD: Campaigns
app.get("/api/campaigns", (req, res) => {
  res.json(db.campaigns || []);
});
app.post("/api/campaigns", (req, res) => {
  const newCamp = { id: "camp-" + Date.now(), ...req.body };
  if (!db.campaigns) db.campaigns = [];
  db.campaigns.push(newCamp);
  saveDb();
  res.json({ success: true, campaign: newCamp });
});
app.put("/api/campaigns/:id", (req, res) => {
  const idx = db.campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Campaign not found" });
  db.campaigns[idx] = { ...db.campaigns[idx], ...req.body };
  saveDb();
  res.json({ success: true, campaign: db.campaigns[idx] });
});
app.delete("/api/campaigns/:id", (req, res) => {
  const idx = db.campaigns.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Campaign not found" });
  const deleted = db.campaigns.splice(idx, 1);
  saveDb();
  res.json({ success: true, campaign: deleted[0] });
});

// CRUD: Ad Categories
app.get("/api/ad-categories", (req, res) => {
  res.json(db.adCategories || []);
});
app.post("/api/ad-categories", (req, res) => {
  const newCat = { id: "acat-" + Date.now(), ...req.body };
  if (!db.adCategories) db.adCategories = [];
  db.adCategories.push(newCat);
  saveDb();
  res.json({ success: true, category: newCat });
});
app.delete("/api/ad-categories/:id", (req, res) => {
  const idx = db.adCategories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Category not found" });
  db.adCategories.splice(idx, 1);
  saveDb();
  res.json({ success: true });
});

// CRUD: Ad Pricing
app.get("/api/ad-pricing", (req, res) => {
  res.json(db.adPricing || []);
});
app.post("/api/ad-pricing", (req, res) => {
  const newPrice = { id: "price-" + Date.now(), ...req.body };
  if (!db.adPricing) db.adPricing = [];
  db.adPricing.push(newPrice);
  saveDb();
  res.json({ success: true, pricing: newPrice });
});
app.put("/api/ad-pricing/:id", (req, res) => {
  const idx = db.adPricing.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Pricing not found" });
  db.adPricing[idx] = { ...db.adPricing[idx], ...req.body };
  saveDb();
  res.json({ success: true, pricing: db.adPricing[idx] });
});
app.delete("/api/ad-pricing/:id", (req, res) => {
  const idx = db.adPricing.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Pricing not found" });
  db.adPricing.splice(idx, 1);
  saveDb();
  res.json({ success: true });
});

// CRUD: Ad Media Library
app.get("/api/ad-media", (req, res) => {
  res.json(db.adMediaLibrary || []);
});
app.post("/api/ad-media", (req, res) => {
  const newMedia = { id: "media-" + Date.now(), uploadedAt: new Date().toISOString(), ...req.body };
  if (!db.adMediaLibrary) db.adMediaLibrary = [];
  db.adMediaLibrary.push(newMedia);
  saveDb();
  res.json({ success: true, media: newMedia });
});
app.delete("/api/ad-media/:id", (req, res) => {
  const idx = db.adMediaLibrary.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Media file not found" });
  db.adMediaLibrary.splice(idx, 1);
  saveDb();
  res.json({ success: true });
});

// Settings
app.get("/api/ad-settings", (req, res) => {
  res.json(db.adSettings || {});
});
app.post("/api/ad-settings", (req, res) => {
  db.adSettings = { ...db.adSettings, ...req.body };
  saveDb();
  res.json({ success: true, settings: db.adSettings });
});

// CRUD: Ads (Creative)
app.get("/api/ads", (req, res) => {
  res.json(db.ads || []);
});
app.post("/api/ads", (req, res) => {
  const newAd = { id: "ad-" + Date.now(), impressions: 0, clicks: 0, revenue: 0, viewability: 95, ...req.body };
  if (!db.ads) db.ads = [];
  db.ads.push(newAd);
  saveDb();
  res.json({ success: true, ad: newAd });
});
app.put("/api/ads/:id", (req, res) => {
  const idx = db.ads.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Ad not found" });
  db.ads[idx] = { ...db.ads[idx], ...req.body };
  saveDb();
  res.json({ success: true, ad: db.ads[idx] });
});
app.delete("/api/ads/:id", (req, res) => {
  const idx = db.ads.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Ad not found" });
  const deleted = db.ads.splice(idx, 1);
  saveDb();
  res.json({ success: true, ad: deleted[0] });
});

// Dynamic Pelacakan Klik & Impresi Asinkron
app.post("/api/ads/track", (req, res) => {
  const { adId, action } = req.body; // action: 'impression' | 'click'
  const ad = db.ads.find(a => a.id === adId);
  if (ad) {
    if (action === "click") {
      ad.clicks = (ad.clicks || 0) + 1;
      // Mock revenue addition based on click (PT Mandiri / Samsung: say Rp 10,000 per click)
      ad.revenue = (ad.revenue || 0) + 10000;
    } else {
      ad.impressions = (ad.impressions || 0) + 1;
      ad.revenue = (ad.revenue || 0) + 100; // Rp 100 per impression
    }
    saveDb();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Ad not found" });
  }
});
// API: Newsletter Signup
app.post("/api/newsletter/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!db.subscribers.includes(email)) {
    db.subscribers.push(email);
    saveDb();
  }
  res.json({ success: true });
});

app.get("/api/newsletter/subscribers", (req, res) => {
  res.json(db.subscribers);
});

// API: Market Live Widget & CMS Configuration Endpoints
app.get("/api/market/live", marketController.getLiveRates);
app.get("/api/market/settings", marketController.getSettings);
app.post("/api/market/settings", marketController.updateSettings);
app.get("/api/market/logs", marketController.getErrorLogs);
app.get("/api/market/updates", marketController.getUpdates);

// API: Real-time Market Rates (Compatibility Layer mapping old route to the core service)
app.get("/api/market-rates", async (req, res) => {
  try {
    const settings = marketDataService.getSettings();
    const [ihsg, usd, gold] = await Promise.all([
      marketDataService.getLatestRate("ihsg"),
      marketDataService.getLatestRate("usd"),
      marketDataService.getLatestRate("gold")
    ]);

    res.json({
      success: true,
      rates: {
        ihsg: {
          val: ihsg ? ihsg.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Data tidak tersedia",
          change: ihsg ? `${ihsg.change >= 0 ? "+" : ""}${ihsg.change.toFixed(2)}%` : "0.00%",
          positive: ihsg ? ihsg.status === "up" : true,
          raw: ihsg ? ihsg.price : 7300,
          base: ihsg ? ihsg.price / (1 + ihsg.change / 100) : 7300
        },
        usdIdr: {
          val: usd ? usd.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Data tidak tersedia",
          change: usd ? `${usd.change >= 0 ? "+" : ""}${usd.change.toFixed(2)}%` : "0.00%",
          positive: usd ? usd.status === "up" : true,
          raw: usd ? usd.price : 16100,
          base: usd ? usd.price / (1 + usd.change / 100) : 16100
        },
        gold: {
          val: gold ? gold.price.toLocaleString("en-US") : "Data tidak tersedia",
          change: gold ? `${gold.change >= 0 ? "+" : ""}${gold.change.toFixed(2)}%` : "0.00%",
          positive: gold ? gold.status === "up" : true,
          raw: gold ? gold.price : 1400000,
          base: gold ? gold.price / (1 + gold.change / 100) : 1400000
        },
        idrSgd: {
          val: "12,015.00",
          change: "0.00%",
          positive: true,
          raw: 12015,
          base: 12015
        }
      }
    });
  } catch (error) {
    console.error("Market rates API compatibility error:", error);
    res.status(500).json({ error: "Failed to load market rates compatibility" });
  }
});

// API: Logs & Analytics
app.get("/api/logs", (req, res) => {
  res.json(db.logs);
});

app.get("/api/analytics/summary", (req, res) => {
  // Return visitor data, device data, popular keywords
  const totalViews = db.articles.reduce((acc, a) => acc + (a.views || 0), 0);
  const totalReads = db.articles.reduce((acc, a) => acc + (a.reads || 0), 0);
  const totalShares = db.articles.reduce((acc, a) => acc + (a.shares || 0), 0);
  
  res.json({
    totalViews,
    totalReads,
    totalShares,
    subscribersCount: db.subscribers.length,
    articlesCount: db.articles.length,
    visitors: db.visitors,
    searchAnalytics: db.searchAnalytics,
    deviceBreakdown: [
      { name: "Desktop", value: 52 },
      { name: "Mobile", value: 41 },
      { name: "Tablet", value: 7 }
    ],
    browserBreakdown: [
      { name: "Chrome", value: 65 },
      { name: "Safari", value: 20 },
      { name: "Firefox", value: 10 },
      { name: "Edge", value: 5 }
    ],
    activeRealtimeVisitors: Math.floor(Math.random() * 45) + 15 // simulated real-time
  });
});

// API: AI SEO & Meta Generator using Gemini API
app.post("/api/ai/seo", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and Content are required to run AI Analysis" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured in the Secrets Panel. Please set it in Settings > Secrets."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `Analisis artikel berikut dan hasilkan metadata SEO profesional dalam format JSON:
Judul: "${title}"
Konten: "${content.substring(0, 1500)}"

Berikan output JSON dengan struktur eksak berikut tanpa teks tambahan/wrapper markdown selain JSON mentah:
{
  "summary": "Ringkasan ringkas artikel berbobot profesional 2 kalimat",
  "metaDescription": "Meta deskripsi SEO ramah mesin pencari maksimal 155 karakter",
  "keywords": ["kata_kunci1", "kata_kunci2", "kata_kunci3", "kata_kunci4"],
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "headlineSuggestion": "Alternatif judul berita yang sangat clickbait tapi profesional"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const textOutput = response.text || "";
    const cleanJson = textOutput.trim();
    const result = JSON.parse(cleanJson);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Gagal berinteraksi dengan AI Gemini. Pastikan API Key valid.",
      details: error.message
    });
  }
});

// Sitemap Public Files
app.get("/sitemap.xml", (req, res) => sendSitemapFile(res, "sitemap.xml"));
app.get("/sitemap-pages.xml", (req, res) => sendSitemapFile(res, "sitemap-pages.xml"));
app.get("/sitemap-articles.xml", (req, res) => sendSitemapFile(res, "sitemap-articles.xml"));
app.get("/sitemap-categories.xml", (req, res) => sendSitemapFile(res, "sitemap-categories.xml"));
app.get("/sitemap-tags.xml", (req, res) => sendSitemapFile(res, "sitemap-tags.xml"));
app.get("/sitemap-authors.xml", (req, res) => sendSitemapFile(res, "sitemap-authors.xml"));
app.get("/sitemap-news.xml", (req, res) => sendSitemapFile(res, "sitemap-news.xml"));

// API: Sitemap Status
app.get("/api/sitemap/status", (req, res) => {
  ensureSitemapFiles();
  res.json(db.sitemapStatus || {});
});

// API: Regenerate Sitemap
app.post("/api/sitemap/regenerate", (req, res) => {
  const options = req.body || {};
  const status = generateSitemaps(options);
  
  // Add Log Action
  if (!db.logs) db.logs = [];
  db.logs.unshift({
    timestamp: new Date().toISOString(),
    user: "Super Admin",
    role: "Super Admin",
    action: `Regenerated sitemap XML with total ${status.totalUrls} URLs`
  });

  saveDb();
  res.json({ success: true, status });
});

// Backup & Restore
app.get("/api/backup", (req, res) => {
  res.json(db);
});

app.post("/api/backup/restore", (req, res) => {
  if (req.body && req.body.articles) {
    db = req.body;
    saveDb();
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid backup data" });
  }
});

// Setup dev and prod servers
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
