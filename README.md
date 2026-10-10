# AI or Real? 🤖📷

**AI or Real? (Spot the AI)**, gerçek fotoğrafları yapay zekâ tarafından üretilmiş görsellerden ayırt etmeye çalıştığınız, skorların canlı bir liderlik tablosuna yazıldığı bir web oyunudur. **Tek bir bilgisayarda**, **internet olmadan** çalışır: oyuncular bilgisayarda fare ya da klavye ile oynar, liderlik tablosu aynı bilgisayarda ya da bağlı ikinci bir ekranda canlı görünür.

Her turda kısa bir "Hazır ol…" beklemesinden sonra iki görsel **aynı anda** belirir: biri gerçek, diğeri yapay zekâ ürünü. Oyuncu süre bitmeden AI olanı **fare** ya da **klavye (← / →)** ile seçer. Doğru ve hızlı cevaplar, art arda doğru bilme serisiyle birlikte daha fazla puan kazandırır. Oyuncu başlamadan önce ismini girer; oyun bitince skoru otomatik kaydedilir ve liderlik tablosunda kendi sırasını görür.

---

## 📌 İçindekiler

1. [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
2. [Oyun Akışı](#-oyun-akışı)
3. [Kullanılan Teknolojiler](#️-kullanılan-teknolojiler)
4. [Teknik Mimari](#️-teknik-mimari)
5. [Proje Yapısı](#-proje-yapısı)
6. [Oyun Mantığı ve Skor Sistemi](#-oyun-mantığı-ve-skor-sistemi)
7. [Backend ve Liderlik Tablosu](#-backend-ve-liderlik-tablosu)
8. [Yol Haritası](#-yol-haritası)
9. [Git Çalışma Düzeni](#-git-çalışma-düzeni)

---

## 💻 Kurulum ve Çalıştırma

### Gereksinimler

| Araç | Sürüm | Not |
|---|---|---|
| **Node.js** | **20.x veya 22.x LTS** | `node -v` ile kontrol edin. Çok yeni (tek sayılı) sürümlerde `better-sqlite3` derleme hatası verebilir. |
| **npm** | Node ile gelir | |
| **Git** | herhangi | |

### İlk kurulum (bir kez)

```bash
# 1) Depoyu klonlayın
git clone https://github.com/HSD-Istinye/ai-or-real.git
cd ai-or-real

# 2) Paketleri yükleyin (better-sqlite3 dahil)
npm install

# 3) Ortam dosyasını oluşturun ve ADMIN_TOKEN'ı değiştirin
copy .env.example .env.local      # Windows
# cp .env.example .env.local      # macOS / Linux

# 4) (İsteğe bağlı) Liderlik tablosunu sahte verilerle doldurun
npm run seed
```

`.env.local` içeriği:

| Değişken | Ne işe yarar |
|---|---|
| `ADMIN_TOKEN` | `/admin` paneline giriş şifresi. Boşsa admin kapalıdır. |
| `NEXT_PUBLIC_DEVICE_ID` | Birden fazla laptop kullanılırsa her birine farklı isim verin (`stand-1`, `stand-2`). |
| `DB_PATH` | (İsteğe bağlı) Veritabanı dosyasının yeri. Varsayılan `data/game.db`. |

Veritabanı (`data/game.db`) ilk API isteğinde **otomatik oluşur**; elle bir şey kurmanıza gerek yoktur. Bu dosya ve `.env.local` git'e girmez.

### Geliştirme

```bash
npm run dev
```

Tarayıcıda **http://localhost:3000** açın. Kodu kaydettiğinizde sayfa kendiliğinden yenilenir.

### Hızlı (üretim) sürüm

```bash
npm run build
npm run start
```

`npm run dev` geliştirme içindir ve daha yavaştır; oyunu oynatırken `build` + `start` kullanın. Kodu değiştirdikten sonra `build`'i tekrar çalıştırmanız gerekir.

| Adres | Ne açılır |
|---|---|
| `http://localhost:3000` | Oyun (ana sayfa) |
| `http://localhost:3000/leaderboard?tv=1` | TV / ikinci ekran için liderlik tablosu (butonsuz) |
| `http://localhost:3000/admin` | Admin paneli |

Her şey aynı bilgisayarda çalışır; internet veya Wi-Fi gerekmez. Tabloyu ikinci bir ekranda göstermek için o ekranda `/leaderboard?tv=1` adresini tam ekran (F11) açmanız yeterli.

### Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Üretim sunucusu |
| `npm run seed` | 200 sahte oyun ekler (`npm run seed -- 50` → 50 tane) |
| `npm run seed -- --clear` | **Sadece** sahte kayıtları siler (gerçeklere dokunmaz) |
| `npm run backup` | `data/backups/` altına anlık yedek alır (`npm run backup -- E:\yedek` → USB) |

### Sık karşılaşılan sorunlar

| Hata | Çözüm |
|---|---|
| `'next' is not recognized` | `npm install` çalıştırılmamış. |
| `npm` tanınmıyor | Node.js kurulu değil → nodejs.org'dan LTS kurun, terminali yeniden açın. |
| `npm install` sırasında `node-gyp` / `Visual Studio` hatası | Node sürümünüz desteklenmiyor → Node 20 veya 22 LTS'ye geçin, `node_modules`'u silip tekrar `npm install`. |
| Liderlik tablosunda "sunucuya ulaşılamıyor" | Sunucu kapalı. `npm run dev` / `npm run start` çalışıyor mu? |
| Port 3000 kullanımda | Next başka porta geçer; terminalde yazan adresi kullanın. |
| Admin: "ADMIN_TOKEN tanımlı değil" | `.env.local` yok veya `ADMIN_TOKEN` boş. Ekleyip sunucuyu yeniden başlatın. |

---

## 🎮 Oyun Akışı

```text
Ana Sayfa → "Oyuna başla"
    ↓
İsim ekranı (/start) → isim sunucuda kontrol edilir (uygunsuz isim filtresi)
    ↓
Oyun başlar → sorular seçilir, A/B konumları karıştırılır
    ↓
┌─► Hazırlan : görseller arka planda yüklenir
│   Bekle    : "Hazır ol…" (rastgele 0.8–2 sn) — bu sırada basmak = "Çok erken!", bekleme baştan
│   Göster   : iki görsel aynı anda belirir, süre çubuğu akar (kolay 5 / orta 6 / zor 8 sn)
│              oyuncu fare ile görsele basar ya da ← / A (sol), → / L (sağ)
│   Sonuç    : ✓/✗, süre (ör. 1.21 sn), +puan  →  ~1.8 sn sonra otomatik geçer
│              (Enter / Boşluk ile beklemeden geçilir)
└── Sonraki tur (son soruya kadar)
    ↓
Sonuç ekranı: unvan → skor otomatik kaydedilir → "Bugün 7. sıradasın"
              → liderlik tablosu (oyuncunun satırı "SEN" ile vurgulu)
              → puan, doğruluk, seri, soru detayları (her sorunun süresi)
    ↓
"Yeniden Oyna" (aynı isim) · "Yeni Oyuncu" (isim ekranına döner)
```

### Kontroller

| Ne | Fare | Klavye |
|---|---|---|
| Sol görseli seç | Görsele bas | `←` veya `A` |
| Sağ görseli seç | Görsele bas | `→` veya `L` (`D` de çalışır) |
| Tur sonucunu beklemeden geç | — | `Enter` veya `Boşluk` |

Görseller belirmeden önce basmak "Çok erken!" uyarısı verir ve bekleme baştan başlar; puan kaybı yoktur.

---

## 🛠️ Kullanılan Teknolojiler

| Katman | Teknoloji | Neden |
|---|---|---|
| Arayüz | **Next.js 15 (App Router) + React** | Sayfa yapısı ve bileşenler |
| Dil | **TypeScript** | Oyun ve API verileri tip güvenli |
| Stil | **CSS** (`app/globals.css`) | Tema değişkenleri tek yerde |
| Backend | **Next.js Route Handlers** (`app/api/**`) | Ayrı sunucu yok; oyun ve API tek komutla çalışır |
| Veritabanı | **SQLite** (`better-sqlite3`) | Kurulum yok, tek dosya, internetsiz; yedek = dosyayı kopyalamak |
| İçerik | **JSON** (`data/questions.json`) + `public/images/` | Soru ve görseller |

---

## 🏗️ Teknik Mimari

```text
BİLGİSAYAR (localhost:3000, internet gerekmez)
┌──────────────────────── Next.js (tek süreç) ────────────────────────┐
│                                                                     │
│  UI LAYER (tarayıcı)                                                │
│   /  /start  /game  /result → oyun ekranları                        │
│   /leaderboard              → TV tablosu (3 sn'de bir yenilenir)    │
│   /admin                    → gizle, günü sıfırla, CSV, istatistik  │
│        │                                                            │
│        ▼                                                            │
│  GAME ENGINE (lib/game/*) — soru seçimi, süre kuralları, cevap      │
│        │                    kontrolü, skor, süre ölçümü             │
│        ▼  oyun sonu: lib/net/submitRun.ts (offline kuyruk)          │
│                                                                     │
│  API   /api/nick  /api/runs  /api/leaderboard  /api/stats           │
│        /api/health  /api/admin/*                                    │
│        │                                                            │
│        ▼                                                            │
│  SERVER (lib/server/*) — doğrulama, skoru yeniden hesaplama, sorgu  │
│        │                                                            │
│        ▼                                                            │
│  DATA  data/game.db (SQLite)  data/questions.json  public/images    │
└─────────────────────────────────────────────────────────────────────┘

 Ekran 1  → oyun (fare veya klavye)
 Ekran 2  → /leaderboard?tv=1 (isteğe bağlı, canlı tablo)
```

- **UI Layer** oyun kurallarını bilmez; oyuncunun seçimini Game Engine'e iletir, dönen sonucu gösterir.
- **Game Engine** saf TypeScript fonksiyonlarıdır (`lib/game/*`). Kurallar (`rules.ts`), cevap kontrolü ve puan hem tarayıcıda hem sunucuda kullanılır; formül bu sayede tek yerde durur. Yalnızca süre ölçümü (`timing.ts`) tarayıcıya özeldir.
- **Server** katmanı sadece sunucuda çalışır (`import 'server-only'`). İstemciden gelen skora güvenmez, cevaplardan puanı kendisi hesaplar.

---

## 📂 Proje Yapısı

```text
ai-or-real/
├── app/
│   ├── page.tsx                  # ana sayfa
│   ├── start/page.tsx            # isim ekranı (oyundan önce)
│   ├── layout.tsx                # ortak düzen + QueueFlusher
│   ├── globals.css               # tema ve tüm stiller
│   ├── game/page.tsx             # oyun ekranı
│   ├── result/page.tsx           # sonuç + otomatik kayıt + liderlik tablosu
│   ├── leaderboard/page.tsx      # TV liderlik tablosu
│   ├── admin/page.tsx            # admin paneli
│   └── api/
│       ├── nick/route.ts         # POST  isim kontrolü
│       ├── runs/route.ts         # POST  oyun kaydet
│       ├── leaderboard/route.ts  # GET   ilk N
│       ├── stats/route.ts        # GET   yüzdelik, medyan, soru istatistiği
│       ├── health/route.ts       # GET   sunucu/veritabanı ayakta mı
│       └── admin/
│           ├── runs/route.ts     # GET   son kayıtlar
│           ├── hide/route.ts     # POST  gizle / geri getir
│           ├── reset-day/route.ts# POST  bugünü gizle
│           └── export/route.ts   # GET   CSV
│
├── components/
│   ├── game/                     # GameHeader, QuestionCard, ImageOption, ProgressBar,
│   │                             # ScoreDisplay, TimerBar (süre çubuğu),
│   │                             # RoundFeedback (tur sonucu)
│   ├── leaderboard/
│   │   ├── LeaderboardTable.tsx  # tablo satırları (ortak)
│   │   └── RunResult.tsx         # oyun sonu: otomatik kayıt + sıra + tablo
│   ├── net/QueueFlusher.tsx      # bekleyen skorları arka planda gönderir
│   └── ui/Button.tsx
│
├── lib/
│   ├── game/                     # createGame, selectQuestions, randomizeOptions,
│   │                             # checkAnswer, calculateScore,
│   │                             # rules.ts (süre/puan kuralları), timing.ts (ölçüm)
│   ├── net/                      # api.ts, submitRun.ts (offline kuyruk), uuid.ts
│   ├── player.ts                 # oyuncu ismi (sessionStorage)
│   └── server/                   # db.ts, schema.sql, validate.ts, blocklist.ts,
│                                 # runs.ts, http.ts
│
├── types/
│   ├── question.ts
│   ├── game.ts
│   └── api.ts                    # API sözleşmesi (istemci + sunucu ortak)
│
├── data/
│   ├── questions.json            # soru havuzu
│   └── game.db                   # liderlik veritabanı (otomatik, git'e girmez)
│
├── public/images/questions/Q001/{real,ai}.webp …
├── scripts/
│   ├── seed.mjs                  # sahte veri
│   └── backup.mjs                # yedek
├── .env.example
└── package.json
```

---

## 🧠 Oyun Mantığı ve Skor Sistemi

### Soru seçimi

- Her oyunda **10 soru**: havuzdan **3 kolay + 4 orta + 3 zor** rastgele seçilir, sıraları karıştırılır (`QUESTION_MIX`, `lib/game/rules.ts`).
- Havuz `data/questions.json` (şu an 50 soru). Oyunun kullandığı biçime `lib/game/questions.ts` çevirir.
- Her soruda gerçek ve AI görselinin **A/B konumu rastgele** belirlenir; böylece cevap konumu ezberlenemez.
- Bir soruya ikinci kez cevap verilemez; "Yeniden Oyna" yeni bir karışım üretir.

Soru formatı (`data/questions.json`):

```json
{
  "id": "Q001",
  "category": "city",
  "difficulty": "easy",
  "realImage": "/images/questions/Q001/real.webp",
  "aiImage": "/images/questions/Q001/ai.webp",
  "explanation": "…"
}
```

- `category`: `portrait`, `nature`, `animal`, `city`, `food`, `technology`, `architecture`, `art` (ekranda Türkçe görünür).
- `difficulty`: `easy`, `medium` veya `hard`.
- Görseller: `public/images/questions/QXXX/` altında `real.webp` ve `ai.webp`, en fazla 1080×1080 px. Bir sorudaki iki görsel **aynı boyutta** olmalı; biri daha bulanık olursa cevabı ele verir.

### Süreli mod ve skor

Tüm sayılar tek dosyada: **`lib/game/rules.ts`**. Hem oyun hem sunucu bu dosyayı kullanır.

| Kural | Değer |
|---|---|
| Süre sınırı | kolay **5 sn**, orta **6 sn**, zor **8 sn** |
| Bekleme ("Hazır ol…") | rastgele **0.8–2 sn** — erken basış "Çok erken!" der, bekleme baştan başlar (puan kaybı yok) |
| Doğru cevap | **500 + 500 × (1 − süre / süre sınırı)** → 500–1000 |
| Seri çarpanı | ×1.0 → ×1.1 → ×1.2 … en fazla **×1.5** |
| Yanlış cevap | **0** (ceza yok), seri sıfırlanır |
| Süre doldu | **0**, seri sıfırlanır |
| 0.25 sn'den hızlı | "Tahmin" sayılır → **0** (görmeden basmayı önler) |

Örnek: orta zorlukta (6 sn) 1.5 sn'de doğru → `500 + 500 × 0.75 = 875`; 3. doğru üst üste ise ×1.2 → **1050**.

Sonuç ekranında doğruluk oranına göre unvan verilir: 🌱 Acemi Meraklı → 🔍 Gelişen Araştırmacı → ⚡ Siber Gözlemci → 👑 Turing Dedektifi.

### Süre nasıl ölçülüyor? (`lib/game/timing.ts`)

`Date.now()` yerine tarayıcının hassas saatleri kullanılır:

1. **Önceden yükleme:** görseller `img.decode()` ile indirilip çözülür; yükleme süresi oyuncuya yazılmaz.
2. **Gösterim anı:** görseller `requestAnimationFrame` içinde görünür yapılır, bir sonraki karenin zamanı **t0** olarak kilitlenir (görselin gerçekten ekrana çıktığı an).
3. **Basma anı:** fare için `pointerdown` (tuş **basıldığı** an; `click` bırakınca tetiklenir ve +80–150 ms ekler), klavye için `keydown` olayının `event.timeStamp` değeri kullanılır.
4. **Süre = basma anı − t0.** Zamanlama React state'inde değil ref'lerde tutulur; ekranın yeniden çizilmesi ölçümü etkilemez.

> Monitör ve fare/klavye gecikmesi (~20–40 ms) ölçülemez; ama herkes aynı bilgisayarda oynadığı için sıralama adildir.

### Sunucu doğrulaması

Puanı yine sunucu hesaplar (`lib/server/runs.ts` → `scoreRun`): her cevabın süre sınırını sorunun zorluğundan kendisi bulur, "tahmin" ve "süre doldu" kararını kendisi verir. Ağ/ölçüm payı için süre sınırına **0.5 sn** tolerans tanınır; daha uzun süreler "süre doldu" sayılır.

> Puan formülünü değiştirmek için `lib/game/rules.ts` / `lib/game/calculateScore.ts` düzenlenir; sunucu aynı kodu kullandığı için liderlik tablosu otomatik uyum sağlar. Eski formülle kaydedilmiş skorlar varsa `/admin` → **Günü sıfırla** ile temiz başlayın.

---

## 🏆 Backend ve Liderlik Tablosu

### Veri modeli (`lib/server/schema.sql`)

| Tablo | İçerik |
|---|---|
| `run` | Bir oyun: `id` (UUID), `nick`, `nick_key`, `score`, `correct`, `total`, `avg_ms`, `max_streak`, `device`, `created_at`, `hidden` |
| `answer` | Oyundaki her cevap: `question_id`, `choice`, `correct`, `reaction_ms`, `points`, `foul` |

`answer` tablosu soru bazlı istatistik içindir ("Bu fotoğrafı herkesin %71'i yanlış bildi"). `reaction_ms` cevabın süresini, `foul` ise `guess` (0.25 sn'den hızlı, tahmin) ya da `timeout` (süre doldu) durumunu tutar; ikisini de sunucu belirler.

### API sözleşmesi (`types/api.ts`)

```text
POST /api/nick  { nick }
  → 200 { ok:true, nick }          temizlenmiş isim
  → 400 { ok:false, error }        boş / geçersiz karakter / uygunsuz isim

POST /api/runs
  { id: "<uuid>", nick: "Ali Y.", mode: "solo", device: "stand-1", createdAt: "<ISO>",
    answers: [ { questionId: "Q001", choice: "ai", reactionMs: 1840 },
               { questionId: "Q002", choice: null, reactionMs: null },   // süre doldu
               … ] }
  → 201 { score, correct, total, avgMs, rankToday, percentile, beatenToday, totalToday, … }
  → 200 aynı id tekrar gelirse (yeni kayıt açılmaz)
  → 400 { ok:false, error }  geçersiz istek / uygunsuz isim
  (puan, süre sınırı, tahmin ve süre doldu kararları sunucuda yeniden hesaplanır)

GET  /api/leaderboard?scope=today|alltime&limit=10&mode=solo
  → { rows: [ { rank, nick, score, correct, total, avgMs, … } ], totalPlayers }

GET  /api/stats?scope=today&score=1450
  → { total, percentile, median, best, avgAccuracy,
      questions: [ { questionId, attempts, correctRate, avgMs } ] }

GET  /api/health                              → { ok, runs }
GET  /api/admin/runs           [X-Admin-Token]
POST /api/admin/hide           [X-Admin-Token]  { id, hidden?: boolean }
POST /api/admin/reset-day      [X-Admin-Token]  bugünkü kayıtları gizler (silmez)
GET  /api/admin/export?token=…                 CSV
```

### Kurallar

- **Skoru sunucu hesaplar.** İstemci sadece cevapları gönderir; konsoldan sahte skor gönderilemez.
- **Sıralama:** puan (yüksekten düşüğe), eşitlikte doğru cevapların ortalama süresi (hızlı olan üstte).
- **Aynı isim** (büyük/küçük harf fark etmez) tabloda en iyi skoruyla **bir kez** görünür. İsimsiz (`???`) oyuncular ayrı sayılır ve "İsimsiz" yazar.
- **İsim:** oyuna başlamadan önce `/start` ekranında sorulur; isim girilmeden `/game` açılmaz. En fazla 20 karakter (TV tablosuna sığsın); harf, rakam, boşluk ve `. _ - '` kullanılabilir, en az bir harf şart. İsim oyun boyunca tarayıcı sekmesinde (`sessionStorage`) tutulur; "Yeni Oyuncu" butonu sıfırlar.
- **Kayıt:** oyun bitince skor bu isimle **otomatik** kaydedilir, ayrıca bir şey sormaz. Sunucu ismi oyun sonunda yine de reddederse skor kaybolmaz, "İsimsiz" olarak kaydedilir.
- **Uygunsuz isim filtresi** (`lib/server/blocklist.ts`): isim ekranında anında uyarı verir; kelime ve kök kontrolü yapar, "s1kt1r" gibi rakamlı yazımları yakalar, "Işık" gibi masum isimleri engellemez. Kaçanlar `/admin`'den gizlenir.
- **"Bugün"** sunucu bilgisayarının saatine göre gece yarısından itibaren sayılır.
- **Offline dayanıklılık:** skor önce tarayıcıya (`localStorage`) yazılır, sonra gönderilir. Sunucu kapalıysa oyuncu "bağlantı gelince eklenecek" mesajı görür; `QueueFlusher` 10 sn'de bir tekrar dener. Aynı `id` sayesinde çift kayıt oluşmaz.
- **Şema değişikliği:** eski veritabanı dosyaları sunucu açılırken otomatik güncellenir (`lib/server/db.ts` → `migrate`). Yeni sütun eklerseniz oraya bir adım ekleyin.

---

## 🚀 Yol Haritası

- **Düello modu:** aynı ekranda iki oyuncu (1. oyuncu A/S, 2. oyuncu K/L). Seçimler gizli kilitlenir, birlikte açıklanır; ilk doğru cevaplayana bonus. Backend `mode: "duel"` için hazır.
- **Soru istatistikleri:** `/admin`'deki soru bazlı doğruluk oranlarına göre zorluk etiketlerini düzeltme.
- Diğer fikirler: takım modu, turnuva (eleme), paylaşılabilir skor kartı (PNG), fiziksel arcade butonu (klavye gibi davranır, kod değişmez).

---

## 🌿 Git Çalışma Düzeni

- `main`'e **doğrudan push yok**. Her iş kendi branch'inde yapılır, Pull Request ile birleştirilir; başka bir ekip üyesi kısaca bakar.
- Branch isimleri: `isim` veya `feature/konu` (ör. `ecem`, `feature/refleks-modu`).

```bash
git checkout main
git pull                          # en güncel main
git checkout -b feature/konu      # yeni branch
# … değişiklikler …
git add .
git commit -m "Kısa ve açıklayıcı mesaj"
git push -u origin feature/konu   # sonra GitHub'da PR aç
```

- `package.json` değiştiyse (yeni paket), branch'i çeken herkes `npm install` çalıştırmalı.
- `data/game.db`, `.env.local`, `node_modules/`, `.next/` git'e **girmez**.
