import { SubmitRunRequest, SubmitRunResponse } from '@/types/api';
import { ApiRequestError, postRun } from './api';

/**
 * Offline kuyruk: skor ÖNCE localStorage'a yazılır, SONRA gönderilir.
 * Sunucu kapalıysa / Wi-Fi koptuysa oyuncu bir şey fark etmez; QueueFlusher
 * arka planda tekrar dener. Aynı id ile tekrar gönderim güvenlidir (sunucu idempotent).
 */

const KEY = 'hsd_pending_runs_v1';

function read(): SubmitRunRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(list: SubmitRunRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* gizli sekme / depolama kapalı — sadece bellek içi gönderim yapılır */
  }
}

function enqueue(run: SubmitRunRequest) {
  const list = read().filter((r) => r.id !== run.id);
  list.push(run);
  write(list);
}

function remove(id: string) {
  write(read().filter((r) => r.id !== id));
}

export function pendingCount(): number {
  return read().length;
}

/**
 * Bir oyunu kaydeder. Sunucu cevap verirse sonucu döner, veremezse null döner
 * (kayıt kuyrukta kalır, sonra gönderilir).
 */
export async function submitRun(run: SubmitRunRequest): Promise<SubmitRunResponse | null> {
  enqueue(run);
  try {
    const res = await postRun(run);
    remove(run.id);
    return res;
  } catch (err) {
    // 4xx = kayıt hatalı, tekrar denemenin anlamı yok → kuyruktan at
    if (err instanceof ApiRequestError && err.status >= 400 && err.status < 500) {
      remove(run.id);
      throw err;
    }
    return null;
  }
}

let flushing = false;

/** Kuyruktaki tüm kayıtları göndermeyi dener. Ağ yoksa ilk hatada durur. */
export async function flushQueue(): Promise<number> {
  if (flushing) return 0;
  flushing = true;
  let sent = 0;
  try {
    for (const run of read()) {
      try {
        await postRun(run);
        remove(run.id);
        sent++;
      } catch (err) {
        if (err instanceof ApiRequestError && err.status >= 400 && err.status < 500) {
          remove(run.id); // bozuk kayıt, kuyruğu tıkamasın
          continue;
        }
        break; // ağ/sunucu yok → sonra tekrar
      }
    }
  } finally {
    flushing = false;
  }
  return sent;
}
