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
