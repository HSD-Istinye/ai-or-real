import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startAccessPolling } from '../lib/net/accessPolling';

const settle = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
function harness() {
  let visible = true;
  let unlocked = 0;
  const errors: boolean[] = [];
  const pending: { resolve: (value: boolean) => void; reject: (error: Error) => void; signal: AbortSignal }[] = [];
  const timers = new Map<number, { callback: () => void; ms: number }>();
  let id = 0;
  const polling = startAccessPolling({
    visible: () => visible,
    check: signal => new Promise<boolean>((resolve, reject) => { pending.push({ resolve, reject, signal }); }),
    onError: failed => { errors.push(failed); },
    onUnlocked: () => { unlocked++; },
    schedule: (callback, ms) => {
      timers.set(++id, { callback, ms });
      return id as unknown as ReturnType<typeof setTimeout>;
    },
    cancel: timer => { timers.delete(timer as unknown as number); },
  });
  return { polling, pending, errors, timers, unlocked: () => unlocked,
    visible: (value: boolean) => { visible = value; },
    next: () => {
      const entry = [...timers].find(([, timer]) => timer.ms === 2500);
      assert.ok(entry);
      timers.delete(entry[0]); entry[1].callback();
    },
  };
}

test('returning from QR ignores the interrupted request and checks immediately', async () => {
  const h = harness();
  h.visible(false); h.polling.pause();
  assert.equal(h.pending[0].signal.aborted, true);
  h.visible(true); h.polling.resume();
  assert.equal(h.pending.length, 2);
  h.pending[0].reject(new Error('network suspended'));
  await settle();
  assert.equal(h.errors.includes(true), false);
  h.pending[1].resolve(true);
  await settle();
  assert.equal(h.unlocked(), 1);
  assert.equal(h.timers.size, 0);
  h.polling.stop();
});

test('transient failure stays quiet; three failures show an error; recovery clears it', async () => {
  const h = harness();
  for (let i = 0; i < 3; i++) {
    h.pending[i].reject(new Error('offline'));
    await settle();
    assert.equal(h.errors.at(-1), i === 2);
    h.next();
  }
  h.pending[3].resolve(false);
  await settle();
  assert.equal(h.errors.at(-1), false);
  h.polling.stop();
  assert.equal(h.timers.size, 0);
});

test('unmount ignores late results and cannot redirect', async () => {
  const h = harness();
  h.polling.stop();
  h.pending[0].resolve(true);
  await settle();
  assert.equal(h.unlocked(), 0);
  assert.equal(h.timers.size, 0);
});
