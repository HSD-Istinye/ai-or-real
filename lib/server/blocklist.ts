/**
 * Liderlik tablosunda görünmesini istemediğimiz isimler.
 * Engellenen isimde oyuncuya "Bu isim kullanılamaz" denir, başka isim girer.
 * Filtreden kaçanları /admin sayfasından gizleyebilirsiniz.
 *
 * - EXACT: ismin içindeki bir KELİME tam olarak bu ise engellenir ("amk", "aq"…).
 *   Kelime içinde aranmaz; böylece "Işık" → "isik" gibi masum isimler takılmaz.
 * - ROOTS: bir kelime bununla BAŞLIYORSA veya isim (boşluksuz hâli) bunu İÇERİYORSA engellenir.
 *   Sadece başka anlama gelmeyen uzun kökleri buraya ekleyin.
 */
const EXACT = new Set<string>([
  'amk', 'amq', 'aq', 'mk', 'mq', 'sik', 'sık', 'skm', 'skt', 'sg', 'oç', 'oc', 'piç', 'pic',
  'göt', 'got', 'yrk', 'yrm', 'amc', 'amcik', 'amcık', 'gavat', 'kahpe', 'pezevenk', 'ibne',
  'bok', 'boku', 'boktan', 'kaltak', 'yavşak', 'yavsak', 'şerefsiz', 'serefsiz',
]);

// Not: harf tekrarları sadeleştirildiği için kökleri tek harfle yazın ("yarrak" → "yarak").
const ROOTS = [
  'orospu', 'siktir', 'sikerim', 'sikeyim', 'sikik', 'amına', 'amcık', 'amcik',
  'yarak', 'pezeven', 'kahpe', 'ibne', 'gavat', 'götveren', 'gotveren',
  'kaltak', 'yavşak', 'yavsak', 'şerefsiz', 'serefsiz',
];

// Harf yerine rakam/sembol hilelerini sadeleştir: 4→a, 3→e, 1→i, 0→o, 5→s, $→s, @→a
const LEET: Record<string, string> = { '4': 'a', '3': 'e', '1': 'i', '0': 'o', '5': 's', '$': 's', '@': 'a' };

function clean(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/[43105$@]/g, (c) => LEET[c] ?? c)
    .replace(/(.)\1+/g, '$1'); // "amkkkk" → "amk"
}

export function isBlockedNick(nick: string): boolean {
  const norm = clean(nick);
  const words = norm.split(/[^\p{L}]+/u).filter(Boolean);
  const joined = words.join('');
  if (words.some((w) => EXACT.has(w))) return true;
  return ROOTS.some((r) => joined.includes(r) || words.some((w) => w.startsWith(r)));
}
