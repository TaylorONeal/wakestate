export class RequestBodyError extends Error {
  constructor(public status: 400 | 413, message: string) { super(message); }
}

/** Bound actual bytes, including chunked requests without a Content-Length header. */
export async function readJsonObject(request: Request, maxBytes = 8192): Promise<Record<string, unknown>> {
  const contentLength = request.headers.get('content-length');
  if (contentLength !== null && Number(contentLength) > maxBytes) {
    throw new RequestBodyError(413, 'Request too large');
  }
  if (!request.body) throw new RequestBodyError(400, 'Missing request body');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError(413, 'Request too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected an object');
    return value as Record<string, unknown>;
  } catch {
    throw new RequestBodyError(400, 'Invalid JSON object');
  }
}
