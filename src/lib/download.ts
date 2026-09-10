import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export async function clearExportCache(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  // Check existence separately so a deletion failure is not silently ignored.
  const entries = await Filesystem.readdir({ directory: Directory.Cache, path: '' });
  if (entries.files.some(file => file.name === 'wakestate-exports')) {
    await Filesystem.rmdir({ directory: Directory.Cache, path: 'wakestate-exports', recursive: true });
  }
}

export async function downloadFile(content: string, filename: string, mimeType: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await clearExportCache();
    const file = await Filesystem.writeFile({
      directory: Directory.Cache,
      path: `wakestate-exports/${filename}`,
      data: content,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    await Share.share({ title: 'WakeState export', files: [file.uri], dialogTitle: 'Save or share your export' });
    // Keep the file available for receiving apps. The next export or Clear Data removes it.
    return;
  }
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
