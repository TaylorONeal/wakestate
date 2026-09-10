import { expect, it } from 'vitest';
import { readJsonObject } from '../../supabase/functions/_shared/request-body';

function request(body: string) { return new Request('https://example.test', { method: 'POST', body }); }
it('accepts a JSON object within the byte limit', async () => {
  expect(await readJsonObject(request('{"message":"hello"}'))).toEqual({ message: 'hello' });
});
it('rejects invalid JSON and non-object bodies with 400', async () => {
  for (const body of ['null', '[]', '"hello"', '{']) {
    await expect(readJsonObject(request(body))).rejects.toMatchObject({ status: 400 });
  }
});
it('counts UTF-8 bytes, not characters', async () => {
  await expect(readJsonObject(request('{"a":"🌙🌙"}'), 12)).rejects.toMatchObject({ status: 413 });
});
it('cancels an oversized chunked stream without reading the rest', async () => {
  let cancelled = false;
  let reads = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) { reads++; controller.enqueue(new Uint8Array(16)); },
    cancel() { cancelled = true; },
  });
  const streamed = new Request('https://example.test', { method: 'POST', body, duplex: 'half' } as RequestInit);
  await expect(readJsonObject(streamed, 20)).rejects.toMatchObject({ status: 413 });
  expect(cancelled).toBe(true);
  expect(reads).toBeLessThanOrEqual(3);
});
