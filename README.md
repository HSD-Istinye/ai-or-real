# AI or Real? 🤖📷

**AI or Real? (Spot the AI)**, gerçek fotoğrafları yapay zekâ tarafından üretilmiş görsellerden ayırt etmeye çalıştığınız, skorların canlı bir liderlik tablosuna yazıldığı bir web oyunudur. Kulüp standında **tek bir bilgisayarda**, **internet olmadan** çalışacak şekilde tasarlanmıştır: oyuncular stant bilgisayarında fare ile oynar, liderlik tablosu yanındaki TV/ikinci ekranda canlı görünür.

Her turda yan yana iki görsel gösterilir: biri gerçek, diğeri yapay zekâ ürünü. Oyuncu AI olduğunu düşündüğü görseli seçer, cevabı hemen öğrenir. Doğru ve hızlı cevaplar, art arda doğru bilme serisiyle birlikte daha fazla puan kazandırır. Oyun sonunda oyuncu ismini girer ve liderlik tablosundaki sırasını görür.

---

## 📌 İçindekiler

1. [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
2. [Oyun Akışı](#-oyun-akışı)
3. [Kullanılan Teknolojiler](#️-kullanılan-teknolojiler)
4. [Teknik Mimari](#️-teknik-mimari)
5. [Proje Yapısı](#-proje-yapısı)
6. [Oyun Mantığı ve Skor Sistemi](#-oyun-mantığı-ve-skor-sistemi)
7. [Backend ve Liderlik Tablosu](#-backend-ve-liderlik-tablosu)
8. [Görev Dağılımı ve Durum](#-görev-dağılımı-ve-durum)
9. [Yol Haritası: Refleks / Süreli Mod](#-yol-haritası-refleks--süreli-mod)
10. [Git Çalışma Düzeni](#-git-çalışma-düzeni)
11. [Stant Kurulumu](#️-stant-kurulumu)
12. [Stant Günü Kontrol Listesi](#-stant-günü-kontrol-listesi)

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

### Stant / sunum için (hızlı sürüm)

```bash
npm run build
npm run start
```

`npm run dev` geliştirme içindir ve daha yavaştır; stantta her zaman `build` + `start` kullanın. Kodu değiştirdikten sonra `build`'i tekrar çalıştırmanız gerekir.

| Adres | Ne açılır |
|---|---|
| `http://localhost:3000` | Oyun (ana sayfa) |
| `http://localhost:3000/leaderboard?tv=1` | TV / ikinci ekran için liderlik tablosu (butonsuz) |
| `http://localhost:3000/admin` | Admin paneli |

Stantta her şey aynı bilgisayarda çalışır; internet veya Wi-Fi gerekmez. Ekran düzeni için → [Stant Kurulumu](#️-stant-kurulumu).

### Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Üretim sunucusu |
| `npm run lint` | Kod kontrolü |
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
Ana Sayfa
    ↓
Oyunu Başlat → soruların seçilmesi + A/B konumlarının karıştırılması
    ↓
┌─► Görsel A  ← oyuncu seçimi →  Görsel B
│       ↓
│   Cevap kontrolü → Doğru / Yanlış geri bildirimi + ipuçları
│       ↓
│   Skor + seri (streak) güncellenir
│       ↓
└── Sonraki soru (son soruya kadar)
    ↓
Sonuç ekranı: puan, doğruluk, en uzun seri, unvan
    ↓
İsim girişi → sunucuya kayıt → "Bugün 7. sıradasın"
    ↓
Liderlik tablosu (TV ekranında canlı)
```

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
LAPTOP (localhost:3000, internet gerekmez)
┌──────────────────────── Next.js (tek süreç) ────────────────────────┐
│                                                                     │
│  UI LAYER (tarayıcı)                                                │
│   /  /game  /result     → oyun ekranları                            │
│   /leaderboard          → TV tablosu (3 sn'de bir yenilenir)        │
│   /admin                → gizle, günü sıfırla, CSV, soru istatistiği│
│        │                                                            │
│        ▼                                                            │
│  GAME ENGINE (lib/game/*)  — soru seçimi, cevap kontrolü, skor      │
│        │                                                            │
│        ▼  oyun sonu: lib/net/submitRun.ts (offline kuyruk)          │
│                                                                     │
│  API  /api/runs  /api/leaderboard  /api/stats  /api/health          │
│       /api/admin/*                                                  │
│        │                                                            │
│        ▼                                                            │
│  SERVER (lib/server/*) — doğrulama, skoru yeniden hesaplama, sorgular│
│        │                                                            │
│        ▼                                                            │
│  DATA   data/game.db (SQLite)   data/questions.json   public/images │
└─────────────────────────────────────────────────────────────────────┘

STANT BİLGİSAYARI
 ├─ Ekran 1 (laptop)  → oyun, oyuncu fare ile oynar
 └─ Ekran 2 (TV)      → /leaderboard?tv=1 (canlı tablo)
```

- **UI Layer** oyun kurallarını bilmez; oyuncunun seçimini Game Engine'e iletir, dönen sonucu gösterir.
- **Game Engine** saf TypeScript fonksiyonlarıdır (`lib/game/*`). Hem tarayıcıda hem sunucuda kullanılır; puan formülü bu sayede tek yerde durur.
- **Server** katmanı sadece sunucuda çalışır (`import 'server-only'`). İstemciden gelen skora güvenmez, cevaplardan puanı kendisi hesaplar.

---

## 📂 Proje Yapısı

```text
ai-or-real/
├── app/
│   ├── page.tsx                  # ana sayfa
│   ├── layout.tsx                # ortak düzen + QueueFlusher
│   ├── globals.css               # tema ve tüm stiller
│   ├── game/page.tsx             # oyun ekranı
│   ├── result/page.tsx           # sonuç + isim girişi
│   ├── leaderboard/page.tsx      # TV liderlik tablosu
│   ├── admin/page.tsx            # admin paneli
│   └── api/
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
│   ├── game/                     # GameHeader, QuestionCard, ImageOption,
│   │                             # AnswerFeedback, ProgressBar, ScoreDisplay
│   ├── leaderboard/NameEntry.tsx # isim girişi + sıralama kartı
│   ├── net/QueueFlusher.tsx      # bekleyen skorları arka planda gönderir
│   └── ui/Button.tsx
│
├── lib/
│   ├── game/                     # createGame, selectQuestions, randomizeOptions,
│   │                             # checkAnswer, calculateScore
│   ├── net/                      # api.ts, submitRun.ts (offline kuyruk), uuid.ts
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

- Sorular `data/questions.json` havuzundan karıştırılarak seçilir.
- Her soruda gerçek ve AI görselinin **A/B konumu rastgele** belirlenir; böylece cevap konumu ezberlenemez.
- Bir soruya ikinci kez cevap verilemez; "Yeniden Oyna" yeni bir karışım üretir.

Soru formatı:

```json
{
  "id": "Q001",
  "title": "Stüdyo Portresi: Hangisi Yapay Zekâ?",
  "category": "İnsan Portresi",
  "difficulty": "medium",
  "description": "…",
  "correctAnswer": "ai",
  "options": [
    { "id": "real", "imageUrl": "/images/questions/Q001/real.webp" },
    { "id": "ai",   "imageUrl": "/images/questions/Q001/ai.webp" }
  ],
  "aiClues": ["…", "…"],
  "explanation": "…"
}
```

### Skor (şu anki sürüm — `lib/game/calculateScore.ts`)

| Durum | Puan |
|---|---|
| Doğru cevap | **100 × seri çarpanı + hız bonusu** |
| Seri çarpanı | 1× → 1.25× → 1.5× … en fazla **2.5×** (art arda her doğru +0.25) |
| Hız bonusu | 15 sn içinde cevap verirsen **0–50** puan (ne kadar hızlı, o kadar çok) |
| Yanlış cevap | 0 puan, seri sıfırlanır |

Sonuç ekranında doğruluk oranına göre unvan verilir: 🌱 Acemi Meraklı → 🔍 Gelişen Araştırmacı → ⚡ Siber Gözlemci → 👑 Turing Dedektifi.

> Formülü değiştirmek için sadece `lib/game/calculateScore.ts` düzenlenir; sunucu aynı fonksiyonu kullandığı için liderlik tablosu da otomatik uyum sağlar.

---

## 🏆 Backend ve Liderlik Tablosu

### Veri modeli (`lib/server/schema.sql`)

| Tablo | İçerik |
|---|---|
| `run` | Bir oyun: `id` (UUID), `nick`, `nick_key`, `score`, `correct`, `total`, `avg_ms`, `max_streak`, `device`, `created_at`, `hidden` |
| `answer` | Oyundaki her cevap: `question_id`, `choice`, `correct`, `reaction_ms`, `points`, `foul` |

`answer` tablosu soru bazlı istatistik içindir ("Bu fotoğrafı herkesin %71'i yanlış bildi"). `foul` alanı refleks modu için şimdiden hazırdır.

### API sözleşmesi (`types/api.ts`)

```text
POST /api/runs
  { id: "<uuid>", nick: "Ali Y.", mode: "solo", device: "stand-1", createdAt: "<ISO>",
    answers: [ { questionId: "Q001", choice: "ai", reactionMs: 1840, foul: null }, … ] }
  → 201 { score, correct, total, avgMs, rankToday, percentile, beatenToday, totalToday, … }
  → 200 aynı id tekrar gelirse (yeni kayıt açılmaz)
  → 400 { ok:false, error }  geçersiz istek / uygunsuz isim

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
- **İsim:** uzunluk sınırı yok (yalnızca 40 karakterlik teknik üst sınır). Harf, rakam, boşluk ve `. _ - '` kullanılabilir. 30 sn içinde isim girilmezse otomatik "???" olarak kaydedilir (`NameEntry.tsx` → `AUTO_SUBMIT_MS`).
- **Uygunsuz isim filtresi** (`lib/server/blocklist.ts`): kelime ve kök kontrolü yapar; "s1kt1r" gibi rakamlı yazımları yakalar, "Işık" gibi masum isimleri engellemez. Kaçanlar `/admin`'den gizlenir.
- **"Bugün"** sunucu bilgisayarının saatine göre gece yarısından itibaren sayılır.
- **Offline dayanıklılık:** skor önce tarayıcıya (`localStorage`) yazılır, sonra gönderilir. Sunucu kapalıysa oyuncu "bağlantı gelince eklenecek" mesajı görür; `QueueFlusher` 10 sn'de bir tekrar dener. Aynı `id` sayesinde çift kayıt oluşmaz.
- **Şema değişikliği:** eski veritabanı dosyaları sunucu açılırken otomatik güncellenir (`lib/server/db.ts` → `migrate`). Yeni sütun eklerseniz oraya bir adım ekleyin.

---

## 📋 Görev Dağılımı ve Durum

Geliştirme 5 göreve ayrılmıştır. Görevler birbirinden bağımsız ilerleyebilir; kesişme noktaları `types/*.ts` ve `lib/game/calculateScore.ts`'dir. Bu dosyalarda değişiklik yapmadan önce takımla konuşun.

İşaretler: ✅ tamamlandı · 🔄 kısmen / devam ediyor · ⬜ yapılacak

---

### 🎨 Görev 1 — UI/UX & Frontend

**Dosyalar:** `app/page.tsx`, `app/game/`, `app/result/`, `components/game/`, `components/ui/`, `app/globals.css`

- ✅ Ana sayfa (yeni tasarım: hero, demo kartı, özellik kartları)
- ✅ Oyun ekranı: yan yana A/B görselleri, seçim, ilerleme çubuğu, skor ve seri göstergesi
- ✅ Doğru/yanlış geri bildirimi, ipuçları ve açıklama alanı
- ✅ Sonuç ekranı: puan, doğruluk, en uzun seri, unvan, soru detayları
- ✅ Açık renkli tema (CSS değişkenleri üzerinden; tüm sayfalar otomatik uyar)
- ✅ Liderlik tablosu ve isim girişi bileşenlerinin temaya uyarlanması
- 🔄 Stant bilgisayarının çözünürlüğünde (ör. 1920×1080 ve 1366×768) tam ekran kontrolü; kaydırma gerektirmeden oynanabilmeli
- ⬜ TV liderlik tablosunun 3–4 metreden okunabilirlik testi
- ⬜ Fare imleci ve tıklama alanlarının büyük ve net olması (görsellerin tamamı tıklanabilir)
- ⬜ Oyun bittikten / boşta kalınca ana sayfaya otomatik dönüş (sıradaki oyuncu için)
- ⬜ Refleks modu ekranları: karanlık bekleme ekranı, süre çubuğu, "ÇOK ERKEN!" uyarısı (→ [Yol Haritası](#-yol-haritası-refleks--süreli-mod))
- ⬜ Poster/afiş: "Gözüne güveniyor musun?" + günün en iyi skoru

---

### 🎮 Görev 2 — Game Engine & Oyun Mantığı

**Dosyalar:** `lib/game/*`, `types/game.ts`, `types/question.ts`

- ✅ `Question`, `GameState`, `PlayerAnswer`, `GameSummary` tipleri
- ✅ Yeni oyun oluşturma, soruları karıştırma, A/B konumlarını rastgele belirleme
- ✅ Cevap kontrolü, ikinci kez cevap vermeyi engelleme
- ✅ Skor: taban puan + seri çarpanı + hız bonusu
- ✅ Doğru/yanlış sayısı, en uzun seri, unvan hesaplama
- ✅ Oyun sonunda `runId` üretip sonucu sonuç ekranına aktarma
- ⬜ Zorluk dağılımı (ör. 3 Kolay + 4 Orta + 3 Zor). Şu an `selectQuestions` zorluğa bakmadan karıştırıyor.
- ⬜ Oyun başına soru sayısını sabitleme (stant için 6, normal mod için 10)
- ⬜ **Refleks / süreli mod** çekirdeği: `lib/game/timing.ts`, süre sınırı, yeni puan formülü (→ [Yol Haritası](#-yol-haritası-refleks--süreli-mod))

---

### 🖼️ Görev 3 — Dataset & İçerik

**Dosyalar:** `data/questions.json`, `public/images/questions/`

- ✅ Soru formatı ve klasör yapısı (`Q001/real.webp`, `Q001/ai.webp`)
- ✅ İlk 3 test sorusu (Q001–Q003)
- ⬜ Kategorilerin netleştirilmesi (portre, doğa, şehir, yemek, iç mekân …)
- ⬜ Soru havuzunu **en az 30**, mümkünse **50–60** soruya çıkarma (stantta sırada bekleyenler cevapları ezberlemesin diye)
- ⬜ Görsellerin standart boyut ve formatta (webp, ~1024 px) optimize edilmesi
- ⬜ Her soru için kısa ipucu ve açıklama metinleri
- ⬜ Stanttan sonra `/admin` → soru istatistiklerine göre zorluk etiketlerini düzeltme

---

### 🗄️ Görev 4 — Backend & Liderlik Tablosu

**Dosyalar:** `app/api/*`, `lib/server/*`, `lib/net/*`, `types/api.ts`, `app/leaderboard/`, `app/admin/`, `components/leaderboard/`, `components/net/`, `scripts/*`

- ✅ SQLite veritabanı, şema ve otomatik şema güncelleme
- ✅ `POST /api/runs`: doğrulama, skoru sunucuda hesaplama, çift kayıt koruması
- ✅ `GET /api/leaderboard`, `GET /api/stats`, `GET /api/health`
- ✅ Sonuç ekranında isim girişi, sıralama ve yüzdelik dilim kartı
- ✅ Offline kuyruk (sunucu kapalıyken skor kaybolmaz)
- ✅ TV liderlik tablosu: bugün / tüm zamanlar, yeni girenlerde parlama efekti
- ✅ Admin paneli: gizle/göster, günü sıfırla, CSV indir, soru istatistikleri
- ✅ Uygunsuz isim filtresi
- ✅ `seed` ve `backup` scriptleri
- ⬜ (İsteğe bağlı) SSE ile anlık canlı yayın (`/api/events`); şu an 3 sn'de bir yenileme yeterli
- ⬜ (İsteğe bağlı) Düello modu için `mode: "duel"` kayıtları ve ayrı tablo

---

### 🧪 Görev 5 — Entegrasyon, Test & Stant Hazırlığı

Bu görev ekip tarafından **ortak** yürütülür.

- ✅ Frontend (`ecem`) ve backend değişikliklerinin `main`'de birleştirilmesi
- ⬜ Uçtan uca test: oyna → isim gir → tabloda gör (en az 3 farklı bilgisayarda)
- ⬜ Dayanıklılık testi: oyun sırasında sunucuyu kapat-aç; skorlar kaybolmamalı, sunucu gelince tabloya düşmeli
- ⬜ 10 kişiye oynatıp geri bildirim toplama; zor/kolay soruları ayarlama
- ⬜ Stant bilgisayarında kiosk (tam ekran) modunda oyun + ikinci ekranda tablo testi
- ⬜ Art arda 20+ oyun oynatma: hafıza/yavaşlama olmamalı, tablo doğru güncellenmeli
- ⬜ Stant kurulum provası (→ [Kontrol Listesi](#-stant-günü-kontrol-listesi))

---

## 🚀 Yol Haritası: Refleks / Süreli Mod

Bir sonraki büyük adım, "Refleks Düellosu" fikrini bu oyunla birleştirmek: **iki fotoğraf aynı anda belirir, süre bitmeden AI olanı seç; hızlı ve doğru olan kazanır.**

### Tur akışı

```text
READY ("Hazır ol" + görseller arka planda yüklenir)
   │ rastgele 0.8–2 sn karanlık ekran   (erken basan → "ÇOK ERKEN!")
   ▼
REVEAL  iki görsel aynı karede belirir, t0 kilitlenir, süre çubuğu akar
   │ sol / sağ tuş          │ süre doldu
   ▼                        ▼
FEEDBACK (1.5–2 sn: ✓/✗, "1.84 sn", +puan) → sonraki tur
```

### Önerilen puanlama

| Durum | Puan |
|---|---|
| Doğru | `500 + 500 × (1 − t/T)` → 500–1000 |
| Seri çarpanı | ×(1 + 0.1·seri), en fazla ×1.5 |
| Yanlış | −300 (rastgele hızlı basmayı cezalandırır) |
| < 400 ms | "Tahmin" sayılır → yanlış |
| Süre doldu | 0 |

Süre sınırı (`T`): kolay 5 sn, orta 6 sn, zor 8 sn.

### Teknik notlar

- Süre ölçümü `Date.now()` ile değil, `requestAnimationFrame` + `event.timeStamp` ile yapılmalı. Görseller önceden `img.decode()` ile yüklenmeli; yoksa yükleme süresi oyuncunun süresine eklenir.
- Fare yerine **klavye** (A = sol, L = sağ) veya arcade butonu kullanın; fareyi görsele götürmek süreye 300–600 ms ekler.
- Backend hazır: `answer.reaction_ms` ve `answer.foul` alanları var. Sadece `calculateScore.ts` güncellenir ve istemci `reactionMs` + `foul` doldurur.
- **Düello modu:** aynı ekranda iki oyuncu (1. oyuncu A/S, 2. oyuncu K/L). Seçimler gizli kilitlenir, birlikte açıklanır; ilk doğru cevaplayana +100.

### Diğer fikirler

- (İleride) telefondan katılma, oda kodu, host/player yapısı — stantta şimdilik kullanılmıyor
- Takım modu, turnuva (8 kişilik eleme)
- Paylaşılabilir skor kartı (PNG)
- Arduino/ESP32 ile fiziksel arcade butonu (klavye gibi davranır, kod değişmez)

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

---

## 🖥️ Stant Kurulumu

Stantta **tek bir bilgisayar** kullanılır; sunucu, oyun ve liderlik tablosu aynı makinede çalışır. İnternet veya Wi-Fi gerekmez.

```text
┌──────────── STANT BİLGİSAYARI ────────────┐        ┌──────── TV / 2. EKRAN ────────┐
│  npm run start  (arka planda)             │  HDMI  │  /leaderboard?tv=1            │
│  Ekran 1: oyun (Chrome tam ekran)         │ ─────► │  canlı tablo, 3 sn'de bir     │
│  Oyuncu: fare (+ klavyeyle isim girişi)   │        │  yenilenir                    │
└───────────────────────────────────────────┘        └───────────────────────────────┘
```

### Adım adım

1. Windows'ta ekranı **genişlet** modunda kullanın (`Win + P` → *Genişlet*); TV ikinci ekran olsun.
2. Sunucuyu başlatın (bu terminal gün boyu açık kalır):
   ```bash
   npm run build
   npm run start
   ```
3. Yeni bir terminalden oyun ve tablo pencerelerini **kiosk modunda** açın (adres çubuğu yok, sekme kapatılamaz):
   ```powershell
   # Oyun — ana ekran
   Start-Process chrome -ArgumentList '--kiosk', "--user-data-dir=$env:TEMP\hsd-oyun", 'http://localhost:3000'

   # Liderlik tablosu — ikinci ekran (1920 = ana ekranın genişliği; farklıysa değiştirin)
   Start-Process chrome -ArgumentList '--kiosk', "--user-data-dir=$env:TEMP\hsd-tv", '--window-position=1920,0', 'http://localhost:3000/leaderboard?tv=1'
   ```
   Kiosk modundan çıkmak için `Alt + F4`. Chrome yerine Edge kullanılacaksa `chrome` yerine `msedge` yazın.
4. Bir deneme oyunu oynayın, skorun TV'deki tabloya düştüğünü görün.
5. Prova kayıtlarını temizleyin: `/admin` → **Günü sıfırla** (veya `npm run seed -- --clear` sadece sahte verileri siler).

### Oyuncu akışı (stant görevlisi için)

1. Oyuncu ana sayfada **Oyuna başla**'ya tıklar.
2. Her turda AI olduğunu düşündüğü görsele **fare ile tıklar**, sonra **Sonraki Soru**.
3. Sonuç ekranında ismini klavyeyle yazar → **Kaydet** (yazmazsa 30 sn sonra "İsimsiz" kaydedilir).
4. Sırasını görür; TV'deki tabloda ismi yanıp söner.
5. Görevli **Ana Sayfaya Dön**'e basar, sıradaki oyuncu başlar.

> Uygunsuz bir isim tabloya düşerse: ikinci bir pencerede `/admin` → ilgili satırda **Gizle**.

---

## ✅ Stant Günü Kontrol Listesi

**Donanım**
- [ ] Laptop (şarj adaptörüyle; pil ile çalıştırmayın)
- [ ] İkinci ekran / TV + HDMI kablosu (bilgisayarın HDMI çıkışı yoksa dönüştürücü)
- [ ] **Kablolu fare** (dokunmatik yüzeyle oynatmayın) ve klavye
- [ ] Uzatma kablosu, yedek fare

**Yazılım (gün başında)**
- [ ] `git pull` → `npm install` → `npm run build` → `npm run start`
- [ ] `npm run seed -- --clear` (prova kayıtlarını sil) veya `/admin` → **Günü sıfırla**
- [ ] Oyun ve tablo kiosk modunda açık (→ [Stant Kurulumu](#️-stant-kurulumu))
- [ ] Bir deneme oyunu oyna → skorun tabloya düştüğünü gör
- [ ] Uyku modu, ekran koruyucu, bildirimler ve Windows Update kapalı (Güç ayarları → *Hiçbir zaman*)
- [ ] İnternet gerekmez — Wi-Fi kopsa bile oyun ve tablo çalışmaya devam eder
- [ ] `npm run backup -- E:\yedek` ile gün içinde birkaç kez USB'ye yedek

**İnsan**
- [ ] Nöbet çizelgesi (en az 2 kişi: biri oyunu yönetir, biri kulübü anlatır)
- [ ] 30 saniyelik kulüp tanıtım konuşması
- [ ] İlk 3'e küçük ödül; kulüp kayıt formu / QR
