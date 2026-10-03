/**
 * Tarayıcıda doğru süre ölçümü (sadece istemci).
 *
 * Neden Date.now() değil?
 *  - Görselin yüklenme süresi oyuncunun süresine eklenmesin → önce preload + decode.
 *  - Sayaç, görseller gerçekten ekrana çizildiği karede başlasın → çift requestAnimationFrame.
 *  - Tıklama/tuş anı, olay kuyruğunda bekleme süresinden etkilenmesin → event.timeStamp.
 *
 * performance.now(), rAF zaman damgası ve event.timeStamp aynı saat kaynağını kullanır,
 * bu yüzden birbirinden çıkarılabilirler.
 */

/** Görselleri indirip çözer; bitince ekranda anında (aynı karede) gösterilebilirler. */
export async function preloadImages(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          // decode() desteklenmiyorsa ya da hata verirse yine de devam et (oyun kilitlenmesin)
          if (typeof img.decode === 'function') {
            img.decode().then(() => resolve(), () => resolve());
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        }),
    ),
  );
}

/**
 * Elemanı bir sonraki karede görünür yapar ve görünür olduğu karenin zamanını (t0) döner.
 * 1. rAF: stil değişikliği bu karede boyanır
 * 2. rAF: bir sonraki karenin zamanı ≈ görselin ekrana çıktığı an
 */
export function revealOnNextFrame(el: HTMLElement | null, onShown: (t0: number) => void): () => void {
  let id2 = 0;
  const id1 = requestAnimationFrame(() => {
    if (el) el.style.visibility = 'visible';
    id2 = requestAnimationFrame((ts) => onShown(ts));
  });
  return () => {
    cancelAnimationFrame(id1);
    cancelAnimationFrame(id2);
  };
}

/** Olayın gerçekleştiği an ile t0 arasındaki süre (ms). */
export function reactionMs(eventTimeStamp: number, t0: number): number {
  return Math.max(0, Math.round(eventTimeStamp - t0));
}

/** Klavye eşlemesi: sol görsel = ← veya A, sağ görsel = → veya L (D de çalışır). */
export function sideFromKey(e: KeyboardEvent): 0 | 1 | null {
  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      return 0;
    case 'ArrowRight':
    case 'KeyL':
    case 'KeyD':
      return 1;
    default:
      return null;
  }
}
