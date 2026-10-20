# Vercel + Supabase kurulumu

Oyun ve API Vercel üzerinde, skorlar Supabase PostgreSQL üzerinde çalışır.
Uygulama Postgres.js ile doğrudan veritabanına bağlanır; Supabase API anahtarı,
Auth veya Storage kurulumu gerekmez. Görseller `public/` klasöründen sunulur.

## 1. Supabase

1. Bir proje oluşturun; kullanıcılarınıza yakın bir Avrupa bölgesi seçin.
2. **SQL Editor** içinde `lib/server/schema.sql` dosyasının tamamını çalıştırın.
   Bu dosya `game.run` ve `game.answer` tablolarını, indeksleri ve erişim
   kısıtlamalarını oluşturur. Mevcut tabloları silmez.
3. **Connect → Transaction pooler** bölümündeki PostgreSQL bağlantı adresini
   alın (port **6543**). Veritabanı şifrenizi yer tutucunun yerine yazın;
   şifredeki özel karakterleri URL-encode edin.
4. Bağlantı adresinin kullanıcı adı genellikle `postgres.PROJECT_REF` biçimindedir.
   Panelde gösterilen adresi kullanın; host adını tahmin etmeyin.

`game` şeması public Data API dışında tutulur; `anon` ve `authenticated`
rollerine erişim verilmez. RLS açıktır. Sunucu bağlantısı `postgres` rolüyle
çalıştığından API doğrulaması ve admin kontrolleri erişim sınırını oluşturur.
Bu bağlantı adresini tarayıcıya göndermeyin.

## 2. Yerel ayarlar

Mevcut `.env.local` dosyanızı koruyarak aşağıdaki değerleri ekleyin/güncelleyin:

```dotenv
DATABASE_URL=postgresql://postgres.PROJECT_REF:URL_ENCODED_PASSWORD@POOLER_HOST:6543/postgres
ADMIN_TOKEN=uzun-rastgele-bir-sifre
NEXT_PUBLIC_DEVICE_ID=web
```

`DB_PATH` artık kullanılmaz. `SUPABASE_URL` ve `SUPABASE_SECRET_KEY` gerekmez.
`DATABASE_URL` ve `ADMIN_TOKEN` isimlerine `NEXT_PUBLIC_` eklemeyin.

```sh
npm install
npm test
npm run build
npm run dev
```

`/api/health` adresinde `ok: true` görmelisiniz. Bağlantı tanımlanmadan build
alınabilir, ancak veritabanı kullanan API istekleri çalışmaz.

## 3. Eski skorları aktarma (isteğe bağlı)

Python 3 kurulu olmalı (`python --version`). Önce Supabase şemasını oluşturun ve
`DATABASE_URL` değerini ayarlayın. Aktarım sırasında eski oyundan yeni kayıt
alımını durdurun; komut başladığındaki tutarlı görüntü aktarılır.

```sh
npm run migrate:sqlite
# Başka dosya:
npm run migrate:sqlite -- "D:\yedek\game.db"
```

Komut SQLite dosyasını **salt okunur** açar; oyunları ve cevapları tek
PostgreSQL transaction içinde aktarır. Hata olursa aktarım geri alınır.
Aynı ID zaten varsa atlanır; yeniden çalıştırmak çift kayıt oluşturmaz.
Kaynak SQLite dosyası ve WAL dosyaları silinmez. Eski kayıtları arayüzde
görmek için "Tüm zamanlar" filtresini kullanabilirsiniz.

## 4. Vercel

1. Değişiklikleri GitHub deponuza gönderin. `.env.local`, `.db` dosyaları ve
   `data/backups/` Git'e eklenmemelidir.
2. Vercel'de **Add New → Project** ile depoyu içeri alın.
3. Framework: **Next.js**, Root Directory: proje kökü, Build Command:
   `npm run build`. Output Directory varsayılan kalsın. Node.js 22.x seçin.
4. **Environment Variables** bölümüne `DATABASE_URL`, `ADMIN_TOKEN` ve
   isteğe bağlı `NEXT_PUBLIC_DEVICE_ID` ekleyin.
5. Production için canlı veritabanını kullanın. Preview denemeleri için ayrı
   Supabase projesi kullanın ve aynı şemayı o projede de kurun.
6. Deploy edin. Ortam değişkenlerini sonradan değiştirirseniz yeniden deploy edin.

Bağlantı TLS kullanır, prepared statements kapalıdır ve her uygulama örneği
en fazla 3 bağlantı açar. Böylece Supabase transaction pooler ile çalışır.
Vercel ve Supabase bölgelerini mümkünse birbirine yakın seçin.

## 5. Yayın kontrolü

- `/api/health` başarılı mı?
- Oyun bitince skor kaydediliyor, başka cihazdaki sıralamada görünüyor mu?
- Sayfa yenilemek aynı oyunu tekrar kaydetmiyor mu?
- `/admin` içinde gizleme, geri getirme ve CSV indirme çalışıyor mu?
- Yetkisiz admin isteği reddediliyor mu?

Günlük sıralama ve isim kontrolü **Europe/Istanbul** gün başlangıcını kullanır.
Skor ve cevaplar birlikte kaydedilir. Skor hesabı sunucuda yapılmaya devam eder.
Oyun internetsiz bir yerel veritabanına yazmaz; tarayıcıdaki mevcut tekrar
gönderim kuyruğu bağlantı geri geldiğinde sonuçları iletir.

## Yedek ve test verisi

`npm run backup` tüm oyunları ve cevapları tutarlı bir JSON görüntüsü olarak
`data/backups/` içine kaydeder. Bu, uygulama verisi dışa aktarımıdır; Supabase'in
tam veritabanı yedeği yerine geçmez.

`npm run seed -- 50` sadece sıralama denemeleri için 50 sahte kayıt ekler;
cevap istatistiği üretmez. Yalnızca test projesinde çalıştırın.
`npm run seed -- --clear` sadece `device = 'seed'` kayıtlarını kaldırır.

`npm test` gömülü PostgreSQL motoruyla kayıt, tekrar gönderim, işlem geri alma,
Türkçe isim gruplama, anonim oyuncular, istatistik, yönetim işlemleri ve
anonim rolün erişim engelini kontrol eder. Gerçek Supabase ağ bağlantısı ayrıca
`/api/health` ve bir oyun gönderimiyle doğrulanmalıdır.

Kaynaklar:
- https://supabase.com/docs/guides/database/postgres-js
- https://supabase.com/docs/guides/database/connecting-to-postgres
- https://vercel.com/docs/environment-variables

## QR ile giriş

Ana sayfa, isim girişi, oyun ve sonuç ekranları QR erişim kontrolüyle korunur.
Kurulumda `lib/server/schema.sql` ardından `lib/server/access-schema.sql`
Supabase SQL Editor içinde çalıştırılmalıdır. Mevcut veriler silinmez.

- Her tarayıcı için ayrı, HttpOnly çerezli oturum oluşturulur.
- QR bağlantısı 15 dakika geçerlidir; yenileme önceki QR'ı geçersiz kılar.
- QR bağlantısı açıldığında yalnızca onu oluşturan tarayıcının kilidi açılır.
- Okutan kişi `https://linktr.ee/hsdistinye` adresine yönlendirilir.
- Telefonda aynı bağlantı düğmeyle yeni sekmede açılır; oyuncu oyun sekmesine döner.
- Erişim 24 saat geçerlidir. QR açılması doğrulanır; Linktree'de takip/kayıt yapılması doğrulanmaz.
- Admin, sağlık kontrolü ve TV sıralama ekranı QR zorunluluğundan muaftır.
- Gerçek telefonla denemek için canlı HTTPS adresini kullanın; localhost QR'ı başka telefondan bilgisayarınıza ulaşmaz.

Hedef adres `lib/server/access.ts` içindeki `QR_TARGET` ile değiştirilir.
Yeni bir ortam değişkeni gerekmez. Bekleyen skorlar QR erişimi sona erdiğinde
silinmez, erişim tekrar açılınca gönderilir.

## İsim rezervasyonu

`lib/server/nickname-schema.sql` dosyasını Supabase SQL Editor içinde çalıştırın.
İsim, oyun başlarken gün/isim için benzersiz kayıtla ayrılır; sahiplik HttpOnly
QR oturumuna bağlanır. İstemcinin `mine` iddiası yetki sağlamaz. Skor gönderimi
de sahipliği kontrol eder. Aynı tarayıcı oturumundaki sekmeler aynı sahibi
paylaşır. Yarım bırakılan oyunun ismi de Türkiye saatiyle gün sonuna kadar
ayrılmış kalır. Skor gizleme veya günü sıfırlama rezervasyonu kaldırmaz.
