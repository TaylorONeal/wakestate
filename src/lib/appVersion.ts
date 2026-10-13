import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/** Version of the web bundle, taken from package.json at build time. */
export const WEB_VERSION: string =
  typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';

type NativeInfo = { version?: string; build?: string };

/**
 * Label for the Settings footer. Native builds report the installed binary's own
 * version and build, so the label cannot drift from the store version (1.0.1 shipped
 * showing "1.0.0" because the text was hard-coded). Web shows the bundle version.
 */
export async function getAppVersionLabel(
  isNative: () => boolean = () => Capacitor.isNativePlatform(),
  getInfo: () => Promise<NativeInfo> = () => App.getInfo(),
): Promise<string> {
  if (!isNative()) return WEB_VERSION;
  try {
    const info = await getInfo();
    if (!info.version) return WEB_VERSION;
    return info.build ? `${info.version} (${info.build})` : info.version;
  } catch {
    return WEB_VERSION;
  }
}
