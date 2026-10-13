import { describe, expect, it } from 'vitest';
import { WEB_VERSION, getAppVersionLabel } from './appVersion';

describe('getAppVersionLabel', () => {
  it('uses the bundle version on web without calling the native plugin', async () => {
    let called = false;
    const label = await getAppVersionLabel(() => false, async () => { called = true; return { version: '9.9.9' }; });
    expect(label).toBe(WEB_VERSION);
    expect(called).toBe(false);
  });

  it('shows the installed binary version and build on native', async () => {
    const label = await getAppVersionLabel(() => true, async () => ({ version: '1.0.2', build: '3' }));
    expect(label).toBe('1.0.2 (3)');
  });

  it('shows the version alone when the build is missing', async () => {
    const label = await getAppVersionLabel(() => true, async () => ({ version: '1.0.2' }));
    expect(label).toBe('1.0.2');
  });

  it('falls back to the bundle version when the plugin fails or returns nothing', async () => {
    expect(await getAppVersionLabel(() => true, async () => { throw new Error('unavailable'); })).toBe(WEB_VERSION);
    expect(await getAppVersionLabel(() => true, async () => ({}))).toBe(WEB_VERSION);
  });
});
