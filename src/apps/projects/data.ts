/**
 * Portfolio content for Projelerim and App Store. Projects are real (from each repo's README);
 * entries marked `sample: true` are placeholders to replace with real data, then drop the flag.
 */
import type { IconName } from "../../ui/icons";

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  tech: string[];
  year: number;
  icon: IconName;
  /** Icon and hero background. */
  accent: string;
  repo?: string;
};

export const projects: Project[] = [
  {
    id: "iphone-clone-react",
    name: "iPhone Clone",
    tagline: "Masada duran 3D iPhone, içinde iOS 26",
    description: "Three.js ile prosedürel render edilen bir iPhone, ahşap bir masada alüminyum standa yaslanıyor; ekranında React ile yazılmış, iOS 26 \"Liquid Glass\" dilinde bir OS kabuğu çalışıyor. Her dokunuş, toggle ve fiziksel tuş haptik, ses ve görsel tepki veriyor.",
    features: ["Liquid Glass yüzeyi: SVG kırılma, desteklenmeyen tarayıcıda blur", "Telefon, Mesajlar, Kamera, Müzik, Safari dahil 16 uygulama", "Dynamic Island, Kontrol ve Bildirim Merkezi, App Switcher", "Üç katmanlı haptik: vibrate, iOS switch hilesi, 3D sarsıntı", "3D'siz düz mod; dokunmatik cihazlarda varsayılan"],
    tech: ["Bun", "React 19", "TypeScript", "Three.js", "React Three Fiber", "zustand", "motion"],
    year: 2026,
    icon: "faceid",
    accent: "linear-gradient(135deg, #3a3a40, #0b0b10)",
  },
  {
    id: "android-react",
    name: "WebDroid",
    tagline: "Tarayıcıda Android 15 / Material 3 telefon",
    description: "Tarayıcıda çalışan, Android 15 / Material 3 gibi görünen ve davranan bir telefon simülatörü. Her sekme ayrı bir cihaz; veriler sunucuda bun:sqlite ile cihaz başına saklanır, ikinci bir cihazı arayıp mesaj atabilirsiniz.",
    features: ["Kurulum sihirbazı: dil, ad, PIN ve duvar kağıdı", "Cihazlar arası WebRTC arama ve mesajlaşma", "Intent, yayın alıcıları ve içerik sağlayıcılarla konuşan uygulamalar", "Material You tema, bildirim perdesi, kilit ekranı", "Haritalar, Dosyalar, Ses Kaydedici dahil 17 uygulama"],
    tech: ["Bun", "React 19", "TypeScript", "Tailwind 4", "Zustand", "bun:sqlite", "WebRTC"],
    year: 2026,
    icon: "robot",
    accent: "linear-gradient(135deg, #7ee0a1, #0f8a4a)",
  },
  {
    id: "indie-valley",
    name: "Indie Valley",
    tagline: "Bağımsız oyun geliştiricileri için sosyal platform",
    description: "Bağımsız oyun geliştiricileri ve oyuncular için sosyal bir platform. Feed, profil, gerçek zamanlı mesajlaşma, indie/stüdyo profilleri, oyun kütüphanesi, haberler ve etkinlikler tek ekosistemde; web, API, mobil ve yönetim paneli aynı monorepoda.",
    features: ["Feed: gönderi, yorum, @mention, medya ve paylaşım", "1:1 ve grup sohbet; yazıyor, okundu ve çevrimiçi durumu", "Onaylı indie/stüdyo profilleri, ekip, topluluk duvarı ve wiki", "IGDB entegrasyonlu oyun kütüphanesi", "Expo mobil uygulaması ve ayrı yönetim paneli"],
    tech: ["Next.js 16", "NestJS 11", "Prisma", "PostgreSQL", "Redis", "Socket.IO", "Expo", "Docker"],
    year: 2026,
    icon: "gamepad",
    accent: "linear-gradient(135deg, #ffb35c, #e2456b)",
    repo: "https://github.com/BoxuDev/indie-valley",
  },
  {
    id: "macos-clone-react",
    name: "macOS Web",
    tagline: "Tarayıcıda macOS Sequoia/Tahoe masaüstü",
    description: "Tarayıcıda çalışan, macOS hissi veren bir masaüstü ortamı. Apple varlığı kullanılmaz: ikonlar CSS gradient ve glif, duvar kâğıtları CSS mesh-gradient; Finder, Terminal ve diğer uygulamalar IndexedDB'de saklanan ortak bir sanal dosya sistemini paylaşır.",
    features: ["Menü çubuğu, Dock, Spotlight, Launchpad, Mission Control", "Finder, Terminal, TextEdit, Preview, Notlar, Safari, Müzik", "Veri odaklı kayıt: menüler ve kısayollar tek yerde", "IndexedDB'de kalıcı sanal dosya sistemi"],
    tech: ["Bun", "React 19", "TypeScript", "Tailwind 4", "Zustand", "motion", "react-rnd"],
    year: 2026,
    icon: "window",
    accent: "linear-gradient(135deg, #8fb8ff, #5b3fd1)",
  },
  {
    id: "xp-clone-react",
    name: "XP Desktop",
    tagline: "Tarayıcıda Windows XP (Luna) masaüstü",
    description: "Açılış ekranıyla başlayan, Hoş Geldiniz ekranından oturum açılan bir Windows XP masaüstü. Pencereler sürüklenir, boyutlandırılır ve küçültülür; uygulamalar gerçekten çalışır ve tarayıcıda saklanan ortak bir dosya sistemini kullanır.",
    features: ["Paint, Notepad, Hesap Makinesi, Mayın Tarlası", "Internet Explorer 7 ve Komut İstemi", "Başlat menüsü, görev çubuğu, Geri Dönüşüm Kutusu", "Web Audio ile üretilen açılış ve oturum sesleri", "Ekran koruyucular: Blank, Marquee, Starfield"],
    tech: ["Bun", "React 19", "TypeScript", "xp.css", "react-rnd", "zustand", "Docker"],
    year: 2026,
    icon: "flag",
    accent: "linear-gradient(135deg, #5aa7ff, #1d4fb8 60%, #3c9a2e)",
    repo: "https://github.com/MihrimatriX/xp-clone-react",
  },
  {
    id: "win8-metro",
    name: "Win8 Metro",
    tagline: "Windows 8.1 klonu olan bir portfolyo",
    description: "Tarayıcıda çalışan bir Windows 8.1 klonu ve aynı zamanda bir portfolyo. Masaüstü ve tablette Windows 8.1, telefonda Windows Phone 8.1 düzeni açılır; projeler Mağaza'da, özgeçmiş Kişiler'de yaşar.",
    features: ["Canlı kutucuklu Başlangıç ekranı ve charm çubuğu", "Aero Snap'li pencereler, görev çubuğu, Win+X menüsü", "localStorage'da kalıcı sanal dosya sistemi", "Her proje kendi Mağaza sayfasında", "İki dil (TR/EN), sıfırdan çizilmiş SVG simgeler"],
    tech: ["Next.js 16", "React 19", "TypeScript", "esbuild"],
    year: 2026,
    icon: "tiles",
    accent: "linear-gradient(135deg, #2bb3a6, #0f5f8f)",
    repo: "https://github.com/MihrimatriX/win8-metro",
  },
  {
    id: "ps5-showcase",
    name: "AFU · Console",
    tagline: "Projeleri konsol ana ekranı gibi sergileyen portfolyo",
    description: "Projeleri bir oyun konsolunun ana ekranı gibi sergileyen portfolyo: açılış, kullanıcı seçimi, oyun kutucukları, kontrol merkezi, kupalar ve kütüphane. Tek bir ses, logo ya da ikon dosyası yok; sesler Web Audio ile sentezleniyor, kapaklar SVG olarak üretiliyor.",
    features: ["Klavye, fare, dokunmatik ve oyun kumandası (Gamepad API)", "Her proje bir oyun sayfası: aktiviteler, teknolojiler, kupalar", "Gezdikçe kazanılan 9 konsol kupası", "Dokuz kategorili, çalışan Ayarlar", "Telefonda kendine özgü dikey düzen"],
    tech: ["Next.js 16", "React 19", "TypeScript", "Web Audio", "Gamepad API", "SVG"],
    year: 2026,
    icon: "gamepad",
    accent: "linear-gradient(135deg, #38bdf8, #0b3a8a 70%, #020617)",
    repo: "https://github.com/MihrimatriX/ps5-showcase",
  },
];

export const projectById = (id: string | null) => projects.find(p => p.id === id);

export const profile = {
  name: "AFU",
  onlineId: "MihrimatriX",
  title: "Full-Stack Geliştirici",
  location: "İstanbul, Türkiye",
  about: "Web'de insanların 'vay' dediği deneyimler kuruyorum. Arayüz, hareket ve performansı aynı masada düşünmeyi seviyorum; bir fikri tasarımdan canlıya kadar tek başıma götürebilirim.",
  experience: [
    { company: "Nova Studio", role: "Kıdemli Frontend Geliştirici", period: "2024 —", summary: "Tasarım sistemi ve 3D ürün yapılandırıcısı. Sayfa yükünü %40 azalttım." },
    { company: "Kuzey Yazılım", role: "Full-Stack Geliştirici", period: "2021 — 2024", summary: "Gerçek zamanlı panel ve ödeme altyapısı; 12 kişilik ekipte teknik öncülük." },
    { company: "Serbest", role: "Web Geliştirici", period: "2019 — 2021", summary: "Ajanslar ve markalar için 30'dan fazla site ve kampanya sayfası." },
  ],
  skills: [
    { name: "TypeScript", value: 92 },
    { name: "React / Next.js", value: 90 },
    { name: "Three.js / WebGL", value: 78 },
    { name: "Node.js", value: 82 },
    { name: "UI / Motion", value: 86 },
    { name: "PostgreSQL", value: 70 },
  ],
  education: [{ school: "Yıldız Teknik Üniversitesi", degree: "Bilgisayar Mühendisliği", period: "2015 — 2019" }],
  languages: [
    { name: "Türkçe", level: "Ana dil" },
    { name: "İngilizce", level: "İleri" },
  ],
  sample: true,
};

export type Social = { id: string; label: string; handle: string; url: string; icon: IconName; sample?: boolean };

export const socials: Social[] = [
  { id: "github", label: "GitHub", handle: "MihrimatriX", url: "https://github.com/MihrimatriX", icon: "globe" },
  { id: "linkedin", label: "LinkedIn", handle: "in/afu", url: "#", icon: "person", sample: true },
  { id: "mail", label: "E-posta", handle: "merhaba@afu.dev", url: "mailto:merhaba@afu.dev", icon: "message", sample: true },
  { id: "x", label: "X", handle: "@afu", url: "#", icon: "globe", sample: true },
  { id: "blog", label: "Blog", handle: "afu.dev", url: "#", icon: "book", sample: true },
];

/** Placeholder links ("#") go nowhere. */
export const openUrl = (url: string) => url !== "#" && window.open(url, "_blank", "noopener");
