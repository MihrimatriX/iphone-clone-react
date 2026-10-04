# iPhone Clone

Gece, lamba ışığında bir çalışma masasında alüminyum standa yaslanmış, Three.js ile render edilen bir iPhone 15 Pro Max modeli; ekranında React ile
yazılmış, iOS 26 "Liquid Glass" dilinde çalışan bir OS kabuğu ve 16 uygulama. Her dokunuş, toggle ve fiziksel tuş haptik + ses + görsel tepki verir.

## Kurulum

```bash
bun install && bun dev
```

| Komut | Ne yapar |
| --- | --- |
| `bun dev` | Geliştirme sunucusu (HTML import, `--hot`) |
| `bun run build` | `dist/` içine production build (code splitting, three.js ayrı chunk; `public/assets` → `dist/assets`) |
| `bun start` | Production sunucusu (Safari'nin frame kontrolü API'si dahil) |
| `bun test` | Hesap makinesi, jest eşikleri ve haptik desen testleri |
| `bun run typecheck` | `tsc --noEmit` (strict) |

## Kullanım

| Girdi | Etki |
| --- | --- |
| Sürükle / çift tık | Kamerayı masanın etrafında döndür / ekrana karşıdan odaklan; sahnede çift tık geri döner, ekranda çift tık yalnızca odaklar |
| Yan tuşlar (3D) | Güç = kilitle/uyandır · Ses +/− = HUD · Eylem = sessiz mod veya el feneri · Kamera Denetimi (sağ alt) = Kamera |
| `F` | Düz mod (3D'siz); dokunmatik cihazlarda varsayılan |
| `L` · `+` / `−` · `M` · `K` | Güç · ses · eylem düğmesi · Kamera Denetimi |
| `C` · `N` · `S` · `Esc` | Kontrol Merkezi · Bildirim Merkezi · App Switcher · bir katman geri |
| Alttan yukarı (hızlı / yavaş) | Ana ekran / App Switcher (kartı yukarı at = kapat) |
| Alt kenarda yatay | Önceki uygulama |
| Sol üstten / sağ üstten aşağı | Bildirim Merkezi / Kontrol Merkezi |
| Ana ekranda aşağı · uzun bas | Spotlight · jiggle modu |

## Tarayıcı uyumluluğu

| | Chrome / Edge (masaüstü) | Chrome (Android) | Safari (macOS) | Safari (iOS 18+) | Firefox |
| --- | --- | --- | --- | --- | --- |
| Glass: blur + saturate | ✓ | ✓ | ✓ | ✓ | ✓ |
| Glass: SVG kırılma (`backdrop-filter: url()`) | ✓ | ✓ | – (blur fallback) | – (blur fallback) | – (blur fallback) |
| Haptik 1: `navigator.vibrate` | API var, motor yok | ✓ | – | – | Android ✓ |
| Haptik 2: `<input switch>` hilesi | – | – | – | ✓ | – |
| Haptik 3: 3D sarsıntı + 150 Hz buzz | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pil seviyesi (Battery API) | ✓ | ✓ | sabit değer | sabit değer | sabit değer |

## Mimari

1. `main.tsx` modu seçer: `scene/` (R3F) ya da düz mod; ikisi de aynı `os/Shell`'i render eder.
2. `scene/Desk` masa, zemin ve duvarı PBR dokularla kurar; `scene/Lamp` ve `scene/Decor` CC0 glTF modelleri (`public/assets`, sunucuda `/assets/*`) yerleştirir; `scene/Mug` (lathe profilli seramik kupa, kahve ve `scene/Steam` buharı), `scene/Props` (deri defter, kalem) ve `scene/FairyLights` prosedüreldir; `scene/Laptop` bir MacBook glTF modelidir, ekranına `scene/laptopScreen.ts`'te kanvasa çizilen editör yerleşir; yüzey dokuları `scene/surfaces.ts`'te kanvasa çizilir; `scene/Phone` gövde olarak `scene/IPhone` glTF modelini yükler (ekranı ve Dynamic Island'ı gizlenir); yan tuşlar `scene/HardwareButtons`'ta modelin tuşları üstünde görünmez tıklama alanlarıdır, yalnızca eklenen Kamera Denetimi çizilir; ekran drei `<Html transform occlude="blending">` ile 390×844 px DOM'dur.
3. `frameloop="demand"`: kare kamera, haptik sarsıntı ya da tuş animasyonu istediğinde çizilir; tek sürekli istek kahve buharınındır (30 fps, `setInterval` ile).
4. `os/store.ts` tek zustand store'dur; ayarlar ve uygulama verisi `persist` ile localStorage'a, fotoğraflar `lib/storage` ile IndexedDB'ye yazılır.
5. `os/Shell` katmanları üst üste dizer: duvar kağıdı → ana ekran → uygulama → kilit → katmanlar → status bar / Island → kenar jestleri.
6. Jest kararları (`os/gestures.ts`) ve hesap makinesi mantığı (`apps/calculator/logic.ts`) saf fonksiyondur ve test edilir.
7. `ui/Glass` tek Liquid Glass yüzeyidir; tüm değerler `ui/tokens.css`'tedir, JS spring'leri de oradan okur.
8. `lib/haptics` tek `haptic(kind)` API'sidir; bir titreşim deseni üç katmanı (vibrate, iOS switch, 3D sarsıntı + buzz) birlikte sürer.
9. `apps/registry.ts`: yeni uygulama = bir klasör + bir satır; her uygulama `lazy()` ile ayrı chunk'tır ve `AppFrame` kullanır.
10. Sistem aktiviteleri (zamanlayıcı, müzik, arama) ve derin bağlantılar (`noteId`, `threadId`, `contactId`, `projectId`) store'da yaşar; Kişiler, Spotlight, App Store ve widget'lar diğer uygulamaları bu alanlarla belirli bir kayıtta açar.

## Kararlar

- **HMR kapalı.** Bun 1.4.2'nin istemci HMR dönüşümü `*.module.css` importlarını düşürüyor (çalışma anında `ReferenceError`). CSS Modules zorunlu olduğu için HMR kapatıldı; `bun --hot` sunucuyu yine yeniden başlatır, sayfa elle yenilenir.
- **StrictMode yok.** drei `<Html>` kendi React root'unu açıyor; StrictMode'un çift effect'i bu root'u gecikmeli unmount edip ekranı boşaltıyor. Ayrıca `Html`'e sabit bir `portal` verildi, aksi halde R3F event'leri bağlanınca hedef değişip aynı sorun oluşuyor.
- **Uygulama açılışı `layoutId` değil.** motion `layoutId` ölçümü `getBoundingClientRect` ile yapıyor; ekranın etrafındaki CSS3D dönüşümü bu ölçümü bozuyor. Bunun yerine ikonun merkezinden `transform-origin` ile spring ölçekleme kullanılıyor.
- **Gövde:** drei `RoundedBox` köşe yarıçapını derinliğin yarısıyla sınırlıyor; derinliği gerdirip z'de geri ölçekleyerek büyük köşe + ince kenar elde edildi.
- **Telefon standda sabit.** Süzülme animasyonu kaldırıldı (CSS3D ekranın her karede yeniden çizilmesi yazıları titretiyordu). Dokunuş ve seçim haptikleri 3D telefonu sarsmaz, 150 Hz "vızıltı" yerine kısa bir tık sesi çalar; yalnızca orta ve güçlü haptikler kısa bir titreşim verir. Glass'ın "jelly" esnemesinde 8 px ölü bölge var, böylece tıklarken düğmeler kıpırdamaz.
- **Oda:** eşyalar ve dokular Poly Haven'dan CC0 (aşağıda), 1k çözünürlük, ~22 MB; modeller metre cinsinden, sahne cm (×100). Hepsi ayrı bir `<Suspense>` içinde yüklenir, telefon beklemez. Dizüstü ekranındaki kod ve klavye dokusu kanvasa çizilir; ekran gerçek bir `RectAreaLight`'tır. Stand, kamera tümseğine değmeyecek yükseklikte biter.
- **Loş oda:** ortam haritası %30, çoğunlukla yansıma için. Asıl ışık, lamba modelinin ampul primitive'inden hesaplanan, gölge düşüren yumuşak kenarlı bir spot; kenarlar sisle karanlığa iner, peri ışıkları additive sprite haleleriyle "bloom" taklidi yapar. CSS vinyet kullanılmadı: `occlude="blending"` ekranı canvas'ın arkasına koyuyor, vinyet odak modunda ekranı da karartırdı. Açık ekran, parlaklığıyla orantılı soğuk bir ışık yayar.
- **`frameloop="demand"` + Suspense:** R3F askıya alınmayan kardeşleri erkenden (gizli) commit ettiği için onların effect'leri modeller görünmeden çalışır. Kare isteği, Suspense fallback'inin cleanup'ındadır; fallback tam da içeriği açığa çıkaran commit'te kaldırılır.
- **Ekran netliği:** Chrome CSS3D katmanını kamera her hareket ettiğinde yeni ölçekte yeniden rasterize eder, glifler her karede başka piksele oturup titrer. Kamera hareket ederken ekrana `will-change: transform` verilir (raster sabit), durduktan 180 ms sonra kaldırılır (tek, net raster). Ekran deliği ön camdan 0,01 öndedir ve kamera `near` 1'dir; aksi halde derinlik hassasiyeti yetmeyip cam ekranın üstüne çizgi çizgi z-fighting yapıyordu.
- **Camlar:** Poly Haven camları JPG üzerinde `BLEND` olarak geliyor (alfa yok), three.js'te opak çizilip çerçevedeki resmi ve saat kadranını örtüyordu. Hepsi tek bir siyah cam materyaliyle değiştirildi: renk toplanır, alfa yazılmaz, yani yalnızca yansıma ekler. Aynı cam telefon ekranının üstünde de var; canvas DOM'un üstünde olduğundan lamba ve oda yansımaları canlı ekranın üzerine düşer. Duvardaki posterin resmi kanvasa çizilir.
- **Kamera sınırı:** yatay dönüş ~80° ile sınırlı; daha genişi uzaklaşınca kamerayı duvarın arkasına taşıyordu.
- **Kırılma tespiti:** Safari `backdrop-filter: url()` sözdizimini kabul edip hiçbir şey çizmiyor; bu yüzden `CSS.supports` + Chromium kontrolü birlikte kullanılıyor.
- **Yazı tipi:** Apple cihazlarında SF Pro, diğerlerinde Google Fonts'tan Inter (optik boyut ekseniyle büyük boyutta Display kesimi, SF'nin Text/Display ayrımına benzer). Yığında `system-ui` yok: Windows'ta Segoe UI'a çözülüp arayüzü "Windows" gibi gösteriyordu.
- **Pil rengi** iOS kuralıyla: Düşük Güç Modu sarı (şarjda bile), şarj yeşil, %20 ve altı kırmızı, aksi halde ön plan rengi (`os/battery.ts`, durum çubuğu ve kilit ekranı widget'ı ortak kullanır).
- **Adaptif kontrast** piksel örneklemesi yerine `data-tone` ile: duvar kağıdının tonu ve uygulamanın teması CSS değişkenleriyle glass ön plan rengini belirliyor.
- **Safari frame kontrolü:** tarayıcı X-Frame-Options engelini göremediği için dev/production sunucusundaki `/api/frame-check` başlıkları okuyor. Statik `dist/` servis edilirse kontrol atlanır ve sayfa doğrudan yüklenmeye çalışılır.
- **Konsol:** R3F 9'un kullandığı (r183'te deprecated) `THREE.Clock` uyarısı ve Windows ANGLE'ın HLSL hassasiyet notları `setConsoleFunction` ile süzülüyor; diğer her şey iletilir.
- **Hesap makinesi** iOS gibi işlem önceliğine uyar (`2+3×4=14`), tekrar `=` son işlemi yineler, `%` toplama/çıkarmada sol terimin yüzdesidir. Türkçe biçim (`1.234,5`). Bir şey yazılıyken `C`, aksi halde `AC` gösterilir.
- **Alarmlar** yalnızca sayfa açıkken çalar. Uygulamanın içindeyken gelen olaylar bildirim yerine Dynamic Island toast'u olarak gösterilir.
- **Hava durumu** ters geocoding yapmaz; konum izni varsa "Konumum", yoksa İstanbul.
- **Takvim** haftayı Pazartesi başlatır; etkinlik saati gelince (sayfa açıkken) bildirim düşer. **Hatırlatıcılar** "Bugün" listesi gecikmişleri de kapsar ve uygulama ikonunda rozet olarak sayılır. Kişilerden başlatılıp hiç yazılmamış sohbetler Mesajlar listesinde gizlenir.
- **Projelerim / App Store** tek kaynaktan (`apps/projects/data.ts`) beslenir: projeler gerçek (README'lerden), özgeçmişte `sample` işaretli kayıtlar yer tutucudur ve değiştirilmelidir. App Store kurulumları (`installed`) kalıcıdır ve son ana ekran sayfasına proje ikonu ekler; ana ekranda silme rozeti olmadığı için kaldırma App Store'daki ürün sayfasından yapılır.
- **App Switcher** kartları canlı ekran görüntüsü değil, uygulama ikonu önizlemesidir; jiggle modunda sıralama değiştirme yoktur.
- **Performans:** bir uygulama veya kilit ekranı ana ekranı tamamen kapatınca ana ekran `visibility: hidden` olur (glass `backdrop-filter`'ları çizilmez); alttan kaydırırken tekrar görünür.
- **Boyut:** ~5.6k satır TS/TSX (CSS ve testler hariç); hedef ~3k idi. Tüm dosyalar ≤150 satır; mantık fonksiyonları ≤40 satır, JSX ağırlıklı bileşenlerin bir kısmı 60 satıra kadar çıkıyor.

## Varlıklar ve atıflar

**Telefon modeli:** ["Apple iPhone 15 Pro Max Black"](https://sketchfab.com/3d-models/apple-iphone-15-pro-max-black-df17520841214c1792fb8a44c6783ee7), yazarı [polyman](https://sketchfab.com/Polyman_3D), lisansı [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/). Değişiklikler: ekran ve Dynamic Island mesh'leri gizlendi (yerlerini canlı DOM ekran alıyor), model döndürülüp standa oturtuldu, metal materyallerin yansıması artırıldı. Dosya (`public/assets/models/iphone_15_pro_max/iphone.glb`) [adrianhajdin/iphone](https://github.com/adrianhajdin/iphone) reposundaki Draco sıkıştırılmış kopyadır; yazar ve lisans bilgisi dosyanın içinde gömülü. Draco çözücüsü three.js'ten kopyalanıp `public/assets/draco` altından sunulur.

**Dizüstü modeli:** ["macbook pro M3 16 inch 2024"](https://sketchfab.com/3d-models/macbook-pro-m3-16-inch-2024-8e34fc2b303144f78490007d91ff57c4), yazarı [jackbaeten](https://sketchfab.com/jackbaeten), lisansı [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/). Değişiklikler: 14 inç boyutuna ölçeklendi, ekranın duvar kağıdı kanvasa çizilmiş editör ekranıyla değiştirildi, ekrana alan ışığı eklendi. Dosya (`public/assets/models/macbook_pro_m3/macbook.glb`) [ashi-s1/macbook-pro-3d](https://github.com/ashi-s1/macbook-pro-3d) reposundaki Draco sıkıştırılmış kopyadır; yazar ve lisans bilgisi dosyanın içinde gömülü.

Diğer tüm model ve dokular [Poly Haven](https://polyhaven.com)'dan, [CC0](https://polyhaven.com/license) lisanslı (atıf gerekmez, yine de listeleniyor):

- Modeller: `desk_lamp_arm_01`, `book_encyclopedia_set_01`, `potted_plant_02`, `potted_plant_04`, `alarm_clock_01`, `standing_picture_frame_01`, `hanging_picture_frame_01`, `wall_clock`, `ceramic_vase_01`
- Dokular: `black_walnut_veneer_01` (masa), `painted_plaster_wall` (duvar), `herringbone_parquet` (zemin)
