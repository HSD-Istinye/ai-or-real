# AI or Real? 🤖📷

**AI or Real?**, kullanıcıların gerçek fotoğraflar ile yapay zekâ tarafından üretilmiş görselleri ayırt etmeye çalıştığı etkileşimli bir web oyunudur.

Her turda kullanıcıya yan yana iki görsel gösterilir. Görsellerden biri gerçek, diğeri ise yapay zekâ tarafından üretilmiştir. Kullanıcı AI tarafından oluşturulduğunu düşündüğü görseli seçer ve seçimden hemen sonra doğru cevabı görür.

Oyun belirli sayıda turdan oluşur. Doğru cevaplar puan kazandırır ve oyun sonunda toplam skor ile doğru/yanlış cevap sayısı gösterilir.

---

## 🎮 Oyun Akışı

```text id="yp4u4u"
Ana Sayfa
    ↓
Oyunu Başlat
    ↓
Soruların Seçilmesi
    ↓
Görsellerin A/B Konumlarının Rastgele Belirlenmesi
    ↓
Görsel A ← Kullanıcı Seçimi → Görsel B
    ↓
Cevap Kontrolü
    ↓
Doğru / Yanlış Geri Bildirimi
    ↓
Skor Güncelleme
    ↓
Sonraki Soru
    ↓
Oyun Sonucu
    ↓
Toplam Skor + Doğru/Yanlış Sayısı
```

---

## 🛠️ Kullanılan Teknolojiler

* **Next.js** — Web uygulaması ve sayfa yapısı
* **React** — Component tabanlı kullanıcı arayüzü
* **TypeScript** — Tip güvenli oyun ve veri yapısı
* **CSS / Tailwind CSS** — Arayüz tasarımı ve responsive yapı
* **JSON** — Soru ve görsel bilgilerinin saklanması

İlk sürümde uygulama tamamen istemci tarafında çalışacaktır. Backend, kullanıcı hesabı veya veritabanı kullanılmayacaktır.

---

## 🏗️ Teknik Mimari

Proje üç temel katmana ayrılır:

```text id="6qqh0c"
                  AI OR REAL?
                       │
                       ▼
               ┌──────────────┐
               │   UI Layer   │
               │ React / Next │
               └──────┬───────┘
                      │
                      ▼
               ┌──────────────┐
               │ Game Engine  │
               │              │
               │ Soru Seçimi  │
               │ Cevap Kontrol│
               │ Skor Sistemi │
               │ Randomization│
               └──────┬───────┘
                      │
                      ▼
               ┌──────────────┐
               │  Data Layer  │
               │              │
               │ questions    │
               │ images       │
               └──────────────┘
```

### 1. UI Layer

Kullanıcının doğrudan etkileşim kurduğu katmandır.

Bu katmanda:

* Ana sayfa
* Oyun ekranı
* Görsel seçenekleri
* Soru ilerleme göstergesi
* Skor göstergesi
* Doğru/yanlış geri bildirimi
* Sonuç ekranı

yer alır.

UI katmanı oyun kurallarını yönetmez. Kullanıcının seçimini Game Engine'e iletir ve dönen sonucu ekranda gösterir.

### 2. Game Engine

Oyunun temel mantığını yöneten katmandır.

Game Engine:

* Oyun için soruları seçer.
* Soruları zorluk seviyelerine göre dağıtır.
* Gerçek ve AI görsellerinin A/B konumlarını rastgele belirler.
* Kullanıcının cevabını kontrol eder.
* Puanı hesaplar.
* Mevcut soruyu takip eder.
* Oyun durumunu yönetir.
* Tüm sorular tamamlandığında oyunu sonlandırır.

### 3. Data Layer

Oyunda kullanılacak içerikleri tutar.

Her soru temel olarak şu bilgileri içerir:

```json id="ve2rzv"
{
  "id": "Q001",
  "category": "city",
  "difficulty": "medium",
  "realImage": "/images/questions/Q001/real.webp",
  "aiImage": "/images/questions/Q001/ai.webp",
  "explanation": "AI görselindeki bazı detaylar gerçek görüntüyle tutarlı değildir."
}
```

Sorular farklı kategorilere ve zorluk seviyelerine ayrılabilir.

---

## 📂 Önerilen Proje Yapısı

```text id="gzr70q"
ai-or-real/
│
├── app/
│   ├── page.tsx
│   ├── game/
│   │   └── page.tsx
│   ├── result/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── game/
│   │   ├── GameHeader.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── ImageOption.tsx
│   │   ├── AnswerFeedback.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ScoreDisplay.tsx
│   │
│   └── ui/
│       └── Button.tsx
│
├── data/
│   └── questions.json
│
├── lib/
│   └── game/
│       ├── createGame.ts
│       ├── selectQuestions.ts
│       ├── randomizeOptions.ts
│       ├── checkAnswer.ts
│       └── calculateScore.ts
│
├── types/
│   ├── game.ts
│   └── question.ts
│
├── public/
│   └── images/
│       └── questions/
│
└── package.json
```

---

# 📋 Görev Dağılımı

Uygulamanın geliştirme süreci **4 ana göreve** ayrılmıştır. Görevler mümkün olduğunca birbirinden bağımsız geliştirilecek ve son aşamada tek sistem altında birleştirilecektir.

---

## 🎨 Görev 1 — UI/UX & Frontend

Oyunun kullanıcı tarafından görülen tüm ekranlarının tasarlanması ve geliştirilmesi.

### Görev Açıklaması

* Ana sayfanın tasarlanması ve kodlanması.
* Oyunu başlat butonunun oluşturulması.
* Oyun ekranının temel layout'unun hazırlanması.
* İki görselin yan yana gösterileceği A/B seçim alanlarının oluşturulması.
* Görsellerin tıklanabilir hale getirilmesi.
* Seçilen görselin görsel olarak belirtilmesi.
* Soru numarası ve ilerleme göstergesinin oluşturulması.
* Mevcut skorun gösterilmesi.
* Doğru ve yanlış cevap durumlarının tasarlanması.
* Cevap sonrası geri bildirim alanının hazırlanması.
* Sonraki soru butonunun oluşturulması.
* Sonuç ekranının tasarlanması.
* Toplam skor, doğru ve yanlış sayılarının gösterilmesi.
* Tekrar oyna butonunun hazırlanması.
* Mobil ve masaüstü responsive tasarımın sağlanması.
* Gerekli hover, transition ve temel animasyonların eklenmesi.

---

## 🎮 Görev 2 — Game Engine & Oyun Mantığı

Oyunun kurallarını ve oyun sırasında gerçekleşen tüm işlemleri yöneten sistemin geliştirilmesi.

### Görev Açıklaması

* `Question`, `GameQuestion`, `GameState` ve `PlayerAnswer` TypeScript tiplerinin oluşturulması.
* Yeni oyun oluşturma sisteminin geliştirilmesi.
* Soru havuzundan 10 sorunun seçilmesi.
* Soruların zorluk seviyelerine göre seçilmesi.
* 3 Easy + 4 Medium + 3 Hard dağılımının uygulanması.
* Seçilen soruların sırasının rastgele belirlenmesi.
* Her soru için gerçek ve AI görsellerinin A/B konumlarının rastgele belirlenmesi.
* Kullanıcının A veya B seçiminin alınması.
* Seçilen cevabın doğru olup olmadığının kontrol edilmesi.
* Doğru cevap için +10 puan verilmesi.
* Yanlış cevap için puan verilmemesi.
* Doğru ve yanlış cevap sayılarının tutulması.
* Bir cevap seçildikten sonra ikinci kez cevap verilmesinin engellenmesi.
* Mevcut soru index'inin takip edilmesi.
* Sonraki soruya geçiş sisteminin oluşturulması.
* 10. sorudan sonra oyunun tamamlanması.
* Sonuç ekranına skor bilgilerinin aktarılması.
* Play Again işleminde eski oyun state'inin temizlenmesi.
* Yeni oyunda soruların ve A/B konumlarının yeniden oluşturulması.

---

## 🖼️ Görev 3 — Dataset & İçerik

Oyunda kullanılacak gerçek ve yapay zekâ görsellerinin hazırlanması ve soru havuzunun oluşturulması.

### Görev Açıklaması

* Oyunda kullanılacak görsel kategorilerinin belirlenmesi.
* Gerçek fotoğrafların seçilmesi.
* Gerçek fotoğraflara benzer AI görsellerinin hazırlanması.
* Gerçek ve AI görsellerinin birbirinden çok kolay ayırt edilememesine dikkat edilmesi.
* Her gerçek/AI görsel çiftinin bir soru olarak hazırlanması.
* Her soruya benzersiz bir ID verilmesi.
* Soruların kategori bilgilerinin belirlenmesi.
* Soruların Easy, Medium veya Hard olarak sınıflandırılması.
* Cevap sonrası gösterilebilecek kısa açıklamaların hazırlanması.
* Görsellerin web kullanımı için optimize edilmesi.
* Görsellerin standart boyut ve formatta hazırlanması.
* Görsellerin `public/images/questions/` altında düzenli şekilde saklanması.
* Tüm soru bilgilerinin `questions.json` içerisine eklenmesi.
* İlk geliştirme aşaması için 5 test sorusunun hazırlanması.
* Final sürüm için yaklaşık 30 soruluk soru havuzunun oluşturulması.

Örnek:

```text id="zzywsb"
Q001/
├── real.webp
└── ai.webp

Q002/
├── real.webp
└── ai.webp
```

---

## 🧪 Görev 4 — Integration, Testing & Finalization

UI, Game Engine ve Dataset bölümlerinin birleştirilmesi ve oyunun stabil şekilde çalışmasının sağlanması.

Bu görev geliştirme sürecinin son aşamasında **ekip tarafından ortak olarak** yürütülebilir.

### Görev Açıklaması

* UI'ın Game Engine ile bağlanması.
* `questions.json` verilerinin Game Engine'e bağlanması.
* Gerçek görsellerin oyun ekranında doğru şekilde gösterildiğinin kontrol edilmesi.
* Kullanıcının görsel seçiminin Game Engine'e doğru aktarıldığının kontrol edilmesi.
* Doğru/yanlış sonucunun UI'da doğru gösterilmesi.
* Skor sisteminin kontrol edilmesi.
* Soru ilerleme sisteminin test edilmesi.
* Aynı sorunun aynı oyun içerisinde iki kez gelmediğinin kontrol edilmesi.
* A/B randomization sisteminin test edilmesi.
* Bir soruya birden fazla cevap verilmesinin engellendiğinin kontrol edilmesi.
* 10. sorudan sonra oyunun doğru şekilde tamamlandığının kontrol edilmesi.
* Result ekranındaki skor ve doğru/yanlış bilgilerinin doğrulanması.
* Play Again sisteminin test edilmesi.
* Yeni oyunda farklı soru ve A/B sıralamalarının oluşturulduğunun kontrol edilmesi.
* Mobil görünümün test edilmesi.
* Farklı ekran boyutlarında responsive yapının kontrol edilmesi.
* Görsel yükleme sürelerinin kontrol edilmesi.
* Bulunan bugların düzeltilmesi.
* Kullanıcı testlerinin yapılması.
* Soruların zorluk seviyelerinin kullanıcı sonuçlarına göre düzenlenmesi.
* Final UI düzenlemelerinin yapılması.
* Uygulamanın etkinlik kullanımına hazır hale getirilmesi.

---

## 🧠 Oyun Mantığı

İlk sürümde oyun 10 sorudan oluşacaktır.

Örnek zorluk dağılımı:

```text id="0ebihq"
Easy   → 3 soru
Medium → 4 soru
Hard   → 3 soru
```

Oyun başladığında soru havuzundan uygun sorular seçilir.

Her soru için gerçek ve AI görsellerinin ekrandaki konumu ayrıca rastgele belirlenir:

```text id="a5frzf"
Soru Verisi
│
├── realImage
└── aiImage
        ↓
   Randomization
        ↓
┌───────────────┐
│ A → Real      │
│ B → AI        │
└───────────────┘
```

Başka bir oyun oturumunda aynı soru:

```text id="hr8pnd"
┌───────────────┐
│ A → AI        │
│ B → Real      │
└───────────────┘
```

şeklinde gösterilebilir.

Bu sayede kullanıcıların cevap konumlarını ezberlemesi veya belirli bir A/B düzenini takip etmesi engellenir.

---

## 📊 Skor Sistemi

İlk sürümde basit bir skor sistemi kullanılacaktır.

```text id="evc67e"
Doğru Cevap  → +10 Puan
Yanlış Cevap →  0 Puan
```

10 soru üzerinden maksimum skor:

```text id="yutye2"
10 × 10 = 100 Puan
```

Oyun sonunda:

* Toplam puan
* Doğru cevap sayısı
* Yanlış cevap sayısı
* Başarı seviyesi

kullanıcıya gösterilir.

---

## 🚀 Gelecek Geliştirmeler

İlk sürüm tek oyunculu olarak geliştirilecektir. Teknik yapı ilerleyen sürümlerde etkinliklerde toplu olarak kullanılabilecek bir oyun sistemine genişletilebilir.

Planlanan geliştirmeler:

* Oda kodu ile oyuna katılma
* QR kod ile hızlı katılım
* Host / Player yapısı
* Gerçek zamanlı soru yönetimi
* WebSocket tabanlı iletişim
* Süreli sorular
* Hız bonusu
* Canlı skor tablosu
* Leaderboard
* Takım modu

Bu yapıda mevcut soru sistemi, Game Engine ve UI component'lerinin mümkün olduğunca korunması; multiplayer özelliklerinin mevcut mimarinin üzerine eklenmesi hedeflenmektedir.

---

## 💻 Kurulum ve Çalıştırma

```bash id="sw1mfc"
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Üretim derlemesini oluşturun
npm run build

# Üretim sürümünü çalıştırın
npm run start
```

---

## 🏆 Backend & Leaderboard

Backend ayrı bir sunucu değildir: Next.js **route handler**'ları (`app/api/**/route.ts`) API görevi görür, veriler **SQLite** (`better-sqlite3`) ile tek bir dosyada (`data/game.db`) tutulur. Her şey tek laptopta, internetsiz çalışır.

```text
LAPTOP (localhost:3000)
┌──────────────────────── Next.js (tek süreç) ────────────────────────┐
│  /  /game  /result     → oyun                                       │
│  /leaderboard          → TV / büyük ekran (3 sn'de bir yenilenir)   │
│  /admin                → gizle, günü sıfırla, CSV, soru istatistiği │
│                                                                     │
│  /api/runs  /api/leaderboard  /api/stats  /api/health  /api/admin/* │
│                 │                                                   │
│        lib/server/*  ──►  data/game.db (SQLite)                     │
└─────────────────────────────────────────────────────────────────────┘
```

### İlk kurulum

```bash
npm install                 # better-sqlite3 dahil tüm paketler
copy .env.example .env.local   # (macOS/Linux: cp) — ADMIN_TOKEN'ı değiştirin
npm run dev                 # http://localhost:3000
```

`data/game.db` ilk API isteğinde otomatik oluşur. Node.js **20 veya 22 LTS** önerilir.

### Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` + `npm run start` | Stant için hızlı (production) sürüm |
| `npm run seed` | 200 sahte oyun ekler (`npm run seed -- 50` → 50 tane) |
| `npm run seed -- --clear` | Sadece sahte kayıtları siler |
| `npm run backup` | `data/backups/` altına anlık yedek (`npm run backup -- E:\yedek` → USB) |

### Dosyalar

```text
types/api.ts                  ← API sözleşmesi (istemci + sunucu ortak tipler)
lib/server/
  schema.sql                  ← tablolar: run, answer
  db.ts                       ← tek SQLite bağlantısı (lazy, WAL modu)
  validate.ts                 ← gelen isteği doğrulama, nick normalize
  blocklist.ts                ← uygunsuz isim filtresi (kelime + kök kontrolü)
  runs.ts                     ← skor hesaplama, kayıt, sıralama, istatistik, admin
  http.ts                     ← hata cevapları, admin token kontrolü
lib/net/
  api.ts                      ← fetch sarmalayıcıları (5 sn timeout)
  submitRun.ts                ← offline kuyruk (localStorage) + yeniden gönderim
  uuid.ts                     ← oyun kimliği üretimi
components/net/QueueFlusher.tsx      ← layout'ta; bekleyen skorları 10 sn'de bir gönderir
components/leaderboard/NameEntry.tsx ← sonuç ekranında isim girişi + sıralama kartı
app/api/…                     ← endpoint'ler
app/leaderboard/page.tsx      ← TV tablosu (?scope=alltime&limit=15&tv=1)
app/admin/page.tsx            ← admin paneli
scripts/seed.mjs, backup.mjs
```

### API sözleşmesi

```text
POST /api/runs
  { id: "<uuid>", nick: "Ali Y.", mode: "solo", device: "stand-1", createdAt: "<ISO>",
    answers: [ { questionId: "Q001", choice: "ai", reactionMs: 1840, foul: null }, … ] }
  → 201 { score, correct, total, avgMs, rankToday, percentile, beatenToday, totalToday, … }
  → 200 aynı id tekrar gelirse (yeni kayıt açılmaz)
  → 400 { ok:false, error } geçersiz istek

GET /api/leaderboard?scope=today|alltime&limit=10&mode=solo
  → { rows: [ { rank, nick, score, correct, total, avgMs, … } ], totalPlayers }

GET /api/stats?scope=today&score=1450
  → { total, percentile, median, best, avgAccuracy, questions: [ { questionId, attempts, correctRate, avgMs } ] }

GET  /api/health                       → { ok, runs }
GET  /api/admin/runs        [X-Admin-Token]
POST /api/admin/hide        [X-Admin-Token]  { id, hidden?: boolean }
POST /api/admin/reset-day   [X-Admin-Token]  bugünkü kayıtları gizler (silmez)
GET  /api/admin/export?token=…              CSV
```

### Kurallar

- **Skoru sunucu hesaplar.** İstemci sadece cevapları gönderir; sunucu `questions.json` + `lib/game/checkAnswer.ts` ile puanı yeniden hesaplar. Puan formülü tek yerde (`lib/game/calculateScore.ts`) durur — değiştirince hem oyun hem tablo güncellenir.
- **Sıralama:** `score DESC`, eşitlikte doğru cevapların ortalama süresi (`avg_ms ASC`). Aynı isim (büyük/küçük harf fark etmez, `nick_key`) tabloda en iyi skoruyla **bir kez** görünür; `???` (isimsiz) oyuncular ayrı sayılır ve tabloda "İsimsiz" yazar.
- **"Bugün"** sunucu bilgisayarının yerel saatine göre gece yarısından itibaren.
- **Offline dayanıklılık:** skor önce `localStorage`'a yazılır, sonra gönderilir. Sunucu kapalıysa oyuncu "bağlantı gelince eklenecek" mesajı görür; `QueueFlusher` arka planda tekrar dener. Aynı `id` sayesinde mükerrer kayıt oluşmaz.
- **İsim:** uzunluk sınırı yok (sadece 40 karakterlik teknik üst sınır); harf, rakam, boşluk ve `. _ - '` kullanılabilir, yazıldığı gibi saklanır. Uygunsuz isimde oyuncuya "Bu isim kullanılamaz" denir (`lib/server/blocklist.ts`); filtreden kaçanlar `/admin`'den gizlenir. 30 sn içinde isim girilmezse `???` olarak kaydedilir (`NameEntry.tsx` → `AUTO_SUBMIT_MS`).
- `answer` tablosundaki `foul` alanı ve `reactionMs` refleks modu için hazır; o aşamada şema değişmez.
