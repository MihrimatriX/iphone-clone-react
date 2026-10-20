# ROL
Kıdemli bir frontend + WebGL mühendisisin. Okunabilir, az ama eksiksiz kod yazarsın.
Her fazı çalıştırıp doğrulamadan "bitti" demezsin.

# HEDEF
Tarayıcıda çalışan, Three.js ile fotogerçekçi render edilmiş bir iPhone. Ekranında React ile
yazılmış, iOS 26 "Liquid Glass" tasarım diline sahip, gerçekten çalışan bir OS kabuğu ve uygulamalar.
Her fiziksel/mekanik etkileşim (dokunma, tuş, toggle, jest) haptik + ses + görsel tepki verir.

# TEKNOLOJİ (sabit, değiştirme)
- Bun: runtime, paket yöneticisi, dev server (HTML import + HMR), build ve test. Vite/Webpack/Next KULLANMA.
  Başlangıç: `bun init` React şablonu. Komutlar: `bun dev`, `bun run build`, `bun test`.
- React 19 + TypeScript (strict, `any` yok)
- three + @react-three/fiber + @react-three/drei
- zustand (+ persist middleware) — tek global store
- motion (`motion/react`) animasyonlar, @use-gesture/react jestler
- idb-keyval (fotoğraf depolama)
- Stil: CSS Modules (Bun yerleşik) + `tokens.css` içinde CSS değişkenleri. Tailwind/UI kit yok.
- Kurmadan önce her paketin güncel stabil sürümünü ve Bun uyumluluğunu kontrol et.
- Kural: 30 satırda yazılabilecek bir şey için yeni bağımlılık ekleme.

# KLASÖR YAPISI
```
src/
  main.tsx
  scene/   Scene.tsx (ışık, env, kamera), Phone.tsx (prosedürel model), HardwareButtons.tsx
  os/      store.ts, Shell.tsx, LockScreen.tsx, Home.tsx, StatusBar.tsx, DynamicIsland.tsx,
           ControlCenter.tsx, NotificationCenter.tsx, AppSwitcher.tsx, gestures.ts
  ui/      Glass.tsx, AppFrame.tsx, List.tsx, Toggle.tsx, Slider.tsx, Sheet.tsx, icons.tsx, tokens.css
  lib/     haptics.ts, sound.ts, storage.ts
  apps/    registry.ts, <app>/index.tsx (her uygulama kendi klasöründe)
```

# 1) 3D TELEFON
- Prosedürel model (dış GLB yok):
  - Gövde: drei RoundedBox, titanyum PBR (metalness≈1, roughness≈0.35).
  - Ön cam: MeshPhysicalMaterial (clearcoat).
  - 19.5:9 ekran, Dynamic Island, 3 lensli kamera adası (iç halkalar, cam parlaması), flaş.
  - Yan tuşlar: güç, ses +/-, Action button.
  - Apple logosu YOK.
- Sahne: stüdyo aydınlatması (drei Environment + Lightformer), ContactShadows, boştayken hafif float.
- Kamera: sınırlı açılı OrbitControls. Çift tıklama ekrana odaklanma tween'i yapar.
  "Flat mode" kısayolu (F) 3D'siz tam ekran gösterir; mobil cihazlarda varsayılan budur.
- Ekran: drei `<Html transform occlude="blending">`, mantıksal 390×844 px, köşe radius ≈55px.
- Fiziksel tuşlar tıklanabilir. Basılınca içeri giriş animasyonu + haptic + işlev:
  - güç = kilitle/uyandır
  - ses = volume HUD + store.volume
  - action = sessiz mod / el feneri
- El feneri açılınca 3D sahnede arka flaşta gerçek bir PointLight yanar.
- Performans:
  - dpr [1,2], `frameloop="demand"` + `invalidate()`.
  - Hedef 60fps, gereksiz re-render yok.

# 2) HAPTİK (lib/haptics.ts)
Tek API: `haptic(kind: 'selection'|'light'|'medium'|'heavy'|'success'|'warning'|'error')`

- Katman 1: `navigator.vibrate(pattern)` (Android/Chromium). Her tür için ayrı pattern.
- Katman 2: iOS 18+ Safari'de gizli `<input type="checkbox" switch>` + label.click() hilesi.
  Feature-detect et, çalışmazsa sessizce geç.
- Katman 3 (her zaman): store'a shake impulse yaz. Phone.tsx bunu useFrame'de sönümlenen
  sinüs offset olarak uygular, böylece telefon gerçekten titrer. Ses açık ve sessiz mod
  kapalıysa Web Audio ile ~150Hz, 40–120ms buzz çal.
- Ayarlar'dan kapatılabilir. `prefers-reduced-motion` aktifse sarsıntıyı azalt.
- Eşleme:
  - selection: liste kaydırma, picker
  - light: tuş/ikon dokunma
  - medium: uzun basma, jiggle
  - heavy: fiziksel tuş
  - success/error: işlem sonucu

# 3) LIQUID GLASS (ui/Glass.tsx — tek bileşen, tüm sistem bunu kullanır)
- Props:
  - variant: 'regular' | 'clear'
  - shape: 'pill' | 'rounded' | 'circle'
  - interactive?: boolean
- Katmanlar:
  1. `backdrop-filter: blur() saturate(180%)`.
  2. Kırılma: SVG filtre (feTurbulence/feImage + feDisplacementMap), kenarlarda güçlü,
     ortada zayıf. `backdrop-filter: url(#lg)` yalnızca Chromium'da çalışır;
     `CSS.supports` ile tespit et, diğer tarayıcılarda blur fallback kullan.
  3. Specular: `::before` ile ışık yönüne göre kenar parlaması (gradient) + 1px iç kenar
     + yumuşak iç gölge.
  4. Adaptif kontrast: arka plan açık/koyuya göre ön plan rengi değişir.
- Etkileşim:
  - basınca scale 0.96 + parlama artışı
  - sürüklemede spring tabanlı "jelimsi" esneme
- Kullanım yerleri: dock, klasörler, kontrol merkezi modülleri, bildirimler, tab bar'lar,
  nav bar butonları, arama alanları, kilit ekranı kısayolları.
- Tüm renk, blur, radius ve spring değerleri tokens.css'te.

# 4) OS KABUĞU
- Kilit ekranı: büyük saat/tarih, bildirimler, el feneri + kamera kısayolları.
  Yukarı kaydırınca Face ID simülasyonu ile açılır.
- Ana ekran:
  - 4×6 grid, çok sayfa + sayfa noktaları, dock, widget'lar (saat, hava, takvim).
  - Uzun basma → jiggle mode.
  - Aşağı kaydırma → Spotlight araması (uygulamaları ve notları bulur).
- Uygulama açma/kapama: ikonun konumundan genişleyen/küçülen spring animasyonu (motion layoutId).
- Jestler (fare + dokunma):
  - home indicator'dan yukarı → ana ekran
  - yukarı + bekle → App Switcher (kartı yukarı at = kapat)
  - alt kenarda yatay → önceki uygulama
  - sağ üstten aşağı → Kontrol Merkezi
  - sol üstten aşağı → Bildirim Merkezi
- Status bar: gerçek saat, pil (Battery API varsa gerçek değer), sinyal/wifi.
- Dynamic Island:
  - zamanlayıcı, müzik ve arama için canlı aktivite
  - dokununca genişler, spring animasyonlu
- Kontrol Merkezi:
  - wifi/bluetooth/uçak/odak toggle'ları
  - parlaklık slider'ı → ekrana gerçek `filter: brightness()`
  - ses slider'ı → store.volume, 3D ses tuşlarıyla senkron
  - el feneri, karanlık mod
- Global ayarlar (persist edilir): duvar kağıdı, karanlık mod, haptik, ses, metin boyutu.

# 5) UYGULAMALAR
Registry pattern: `{ id, name, icon, accent, Component: lazy(() => import(...)) }`.
Yeni uygulama = 1 klasör + registry'de 1 satır.
Tüm uygulamalar AppFrame'i (large title nav bar, glass tab bar, geri jesti) kullanır.

1. **Telefon**
   - tuş takımı + gerçek DTMF sesleri (Web Audio, çift frekans)
   - son aramalar, kişiler
   - arama ekranı + Dynamic Island aktivitesi
2. **Mesajlar**
   - konuşma listesi, kuyruklu balonlar
   - gönderme animasyonu, "yazıyor…" göstergesi
   - basit kural tabanlı otomatik cevap
3. **Kamera**
   - getUserMedia (ön/arka)
   - deklanşör: ses + beyaz flaş + haptic
   - fotoğrafı IndexedDB'ye kaydet
   - izin yoksa zarif bir fallback ekranı
4. **Fotoğraflar**
   - grid, tam ekran görüntü + pinch/çift tık zoom
   - silme
   - örnek görseller kodla (gradient) üretilir
5. **Hesap Makinesi**
   - iOS davranışı birebir: AC/C, ±, %, zincir işlemler, aktif operatör vurgusu,
     ekranda kaydırarak son haneyi silme
   - Mantık saf fonksiyon olarak yazılır ve `bun test` ile test edilir.
6. **Saat**
   - dünya saati
   - alarm (sayfa açıkken çalar)
   - kronometre (turlar)
   - zamanlayıcı → Dynamic Island; bitince ses + haptic
7. **Hava Durumu**
   - Open-Meteo (API anahtarı yok)
   - konum izni yoksa İstanbul
   - hava koşuluna göre animasyonlu arka plan
8. **Notlar**
   - liste, düzenleme, otomatik kayıt, arama
9. **Müzik**
   - Web Audio ile prosedürel üretilmiş 3 demo parça (telifsiz)
   - oynat/durdur/ileri, ilerleme çubuğu
   - kilit ekranı oynatıcısı + Dynamic Island
10. **Ayarlar**
    - native iOS liste görünümü
    - bölüm 4'teki tüm global ayarlar gerçekten etki eder
11. **Safari**
    - adres çubuğu (glass, altta), sekme sayısı
    - iframe ile sayfa yükleme; X-Frame-Options engeli varsa bilgilendirme kartı
    - favorilerden oluşan başlangıç sayfası

**"Çalışıyor" tanımı:** uygulama açılır, ana işlevi uçtan uca çalışır, veri sayfa yenilemeden
sonra kalır, konsolda hata/uyarı yoktur.

# KOD KURALLARI (minimum + anlaşılır)
- Hedef: toplam ~3000 satır TS/TSX (CSS hariç). Dosya başına ≤150, fonksiyon başına ≤40 satır.
- Okunabilirlik satır sayısından önce gelir: code golf, iç içe ternary ve tek harfli isim yok.
- Soyutlamayı ancak 3. tekrarda yap.
- Tek zustand store (slice'lar halinde), prop drilling yok.
- Yorum yalnızca "neden" için. Sihirli sayılar tokens'a taşınır.
- Saf mantık (hesap makinesi, haptic pattern seçimi, jest eşikleri) UI'dan ayrı tutulur ve test edilir.

# MARKA / TELİF
- Apple logosu, SF Pro font dosyaları, Apple'ın ikonları ve duvar kağıtları KULLANILMAZ.
- Font stack: `-apple-system, system-ui, Inter, sans-serif`.
- İkonlar özgün SVG'ler + kendi gradyanların. Duvar kağıtları CSS/shader ile üretilir.

# ÇALIŞMA ŞEKLİ (fazlar)
- **Faz 0:** scaffold, `bun dev` çalışıyor, `tsc --noEmit` temiz, `bun test` kurulu.
- **Faz 1:** 3D telefon, ekran, fiziksel tuşlar, flat mode.
- **Faz 2:** store, Glass, haptics, sound.
- **Faz 3:** OS kabuğu + tüm jestler.
- **Faz 4:** uygulamalar (öncelik sırası: Ayarlar → Hesap Makinesi → Saat → Notlar → Kamera/Fotoğraflar → diğerleri).
- **Faz 5:** performans profili, erişilebilirlik (klavye, aria, odak), README.

Her faz sonunda:
1. typecheck + testleri çalıştır
2. uygulamayı çalıştırıp kabul kriterlerini tek tek kontrol et
3. satır sayısını raporla
4. kısa bir özet yaz ve sonraki faza geç

Yalnızca gerçekten tıkanırsan soru sor. Belirsiz bir davranışta iOS 26'yı taklit et;
emin değilsen en basit makul çözümü seç ve README'deki "Kararlar" bölümüne yaz.

# GENEL KABUL KRİTERLERİ
- Masaüstü Chrome'da 60fps, Safari/Firefox'ta glass fallback ile hatasız çalışır.
- Her dokunuş, toggle ve fiziksel tuş haptic + görsel tepki verir; ses açıksa ses de verir.
- Tüm jestler hem fareyle hem dokunmayla çalışır.
- Yenilemeden sonra ayarlar, notlar, mesajlar ve fotoğraflar korunur.
- README şunları içerir:
  - kurulum: `bun install && bun dev`
  - tarayıcı uyumluluk tablosu (haptic ve glass katmanları)
  - 10 satırlık mimari özeti
