/**
 * Oyuncunun ismi — oyuna başlamadan önce /start sayfasında alınır,
 * oyun boyunca sessionStorage'da tutulur (sekme kapanınca silinir).
 */
const KEY = 'hsd_player_nick';

/** Sunucudaki NICK_MAX ile aynı (lib/server/validate.ts). */
export const NICK_INPUT_MAX = 40;

/** Yazarken izin verilmeyen karakterleri ayıklar (sunucu da aynı kuralı uygular). */
export function sanitizeNickInput(v: string): string {
  return v.replace(/[^\p{L}\p{N} ._'\-]/gu, '').slice(0, NICK_INPUT_MAX);
}

export function getPlayerNick(): string | null {
  try {
    const v = sessionStorage.getItem(KEY);
    return v && v.trim() ? v : null;
  } catch {
    return null;
  }
}

export function setPlayerNick(nick: string) {
  try {
    sessionStorage.setItem(KEY, nick);
  } catch {
    /* depolama kapalı — oyun yine de çalışır, isim "???" olarak kaydedilir */
  }
}

export function clearPlayerNick() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* yoksay */
  }
}
