/* Read-only recovery helper for the OLD WakeState origin. No network, imports or writes.
 * Review this file, then paste its contents in that origin's browser developer console.
 * Downloads unencrypted private data. Do not paste its output into support chats.
 * This does not run automatically and is not shipped in the web/native runtime.
 */
(async () => {
  const keys = ['wakestate_checkins', 'wakestate_events', 'wakestate_settings', 'wakestate_medications', 'wakestate_med_config', 'wakestate_med_administrations', 'wakestate_sleep_entries'];
  const legacy = keys.map(key => {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  });
  let db;
  try {
    db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('keyval-store');
      request.onupgradeneeded = () => { request.transaction.abort(); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    // An absent DB triggers our intentional aborted creation. All other errors fail closed.
    if (error?.name !== 'AbortError' || !legacy.some(value => value !== undefined)) throw error;
  }
  let values = legacy;
  try {
    if (db) {
      values = await new Promise((resolve, reject) => {
        const transaction = db.transaction('keyval', 'readonly');
        const requests = keys.map(key => transaction.objectStore('keyval').get(key));
        transaction.oncomplete = () => resolve(requests.map((request, index) => request.result === undefined ? legacy[index] : request.result));
        transaction.onerror = transaction.onabort = () => reject(transaction.error || new Error('Read failed'));
      });
    }
  } finally { db?.close(); }
  const defaults = [[], [], {showContextByDefault:false,theme:'midnight'}, {}, null, [], []];
  const names = ['checkIns','events','settings','medications','medicationConfig','medicationAdministrations','sleepEntries'];
  const backup = {version:2, exportedAt:new Date().toISOString()};
  names.forEach((name,index) => {backup[name] = values[index] === undefined ? defaults[index] : values[index];});
  const content = JSON.stringify(backup,null,2);
  if (new Blob([content]).size > 10 * 1024 * 1024) throw new Error('Backup exceeds the supported 10 MB import limit. Keep the source data and seek a local recovery plan.');
  const url = URL.createObjectURL(new Blob([content],{type:'application/json'}));
  const anchor = document.createElement('a');anchor.href=url;anchor.download='wakestate-recovery.json';document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  return 'Recovery file downloaded. Verify it in a clean destination before retiring the old origin. Unsaved drafts are not included.';
})();
