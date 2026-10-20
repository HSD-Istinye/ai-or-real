/** Poll only while visible; canceled/background requests must not display errors. */
export function startAccessPolling(options: {
  check: (signal: AbortSignal) => Promise<boolean>;
  onUnlocked: () => void;
  onError: (failed: boolean) => void;
  visible: () => boolean;
  schedule?: (callback: () => void, ms: number) => ReturnType<typeof setTimeout>;
  cancel?: (timer: ReturnType<typeof setTimeout>) => void;
}) {
  const schedule = options.schedule ?? setTimeout;
  const cancel = options.cancel ?? clearTimeout;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let request: AbortController | undefined;
  let generation = 0;
  let failures = 0;
  let stopped = false;
  const interrupt = () => {
    generation++;
    if (timer !== undefined) cancel(timer);
    timer = undefined;
    request?.abort();
    request = undefined;
  };
  const poll = async () => {
    if (stopped || !options.visible()) return;
    const current = generation;
    const controller = new AbortController();
    request = controller;
    const timeout = schedule(() => controller.abort(), 10000);
    try {
      const unlocked = await options.check(controller.signal);
      if (stopped || current !== generation || !options.visible()) return;
      failures = 0;
      options.onError(false);
      if (unlocked) {
        stopped = true;
        options.onUnlocked();
        return;
      }
    } catch {
      if (stopped || current !== generation || !options.visible()) return;
      failures++;
      options.onError(failures >= 3);
    } finally {
      cancel(timeout);
      if (current === generation) request = undefined;
      if (!stopped && current === generation && options.visible()) timer = schedule(() => { void poll(); }, 2500);
    }
  };
  const resume = () => {
    if (stopped) return;
    interrupt();
    failures = 0;
    options.onError(false);
    void poll();
  };
  resume();
  return {
    resume,
    pause: () => { interrupt(); failures = 0; options.onError(false); },
    stop: () => { stopped = true; interrupt(); },
  };
}
