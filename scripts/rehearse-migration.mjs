// Uses temporary browser contexts and loopback-only servers. Never uses a personal profile.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
const fixture = JSON.parse(await fs.readFile('tests/migration/fixture.json','utf8'));
const output = 'artifacts/migration';
await fs.mkdir(output,{recursive:true});
await fs.writeFile(`${output}/result.json`,JSON.stringify({passed:false,status:'running',syntheticOnly:true,startedAt:new Date().toISOString()},null,2)+'\n');
const servers=[]; let browser;
const passed=[];
const canonical = data => { const {exportedAt, ...records}=JSON.parse(typeof data==='string'?data:JSON.stringify(data));return records; };
const snapshot = page => page.evaluate(async()=> (await import('/src/lib/storage.ts')).exportAllData());
const restore = (page,json) => page.evaluate(async json=> (await import('/src/lib/storage.ts')).importData(json),json);
async function reports(page) {
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.getByRole('button',{name:/Export & Reports/}).click();
 await page.getByRole('button',{name:'Export JSON',exact:true}).waitFor();
}
try {
 for(let i=0;i<2;i++){const server=await createServer({server:{host:'127.0.0.1',port:0,open:false},logLevel:'error'});await server.listen();servers.push(server);}
 const origins=servers.map(s=>`http://127.0.0.1:${s.httpServer.address().port}`);
 assert.notEqual(origins[0],origins[1]);
 browser=await chromium.launch();
 const contexts=await Promise.all(origins.map(()=>browser.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Makassar'})));
 for(const context of contexts){await context.route('**/*',route=>origins.some(o=>route.request().url().startsWith(o+'/'))?route.continue():route.abort());await context.addInitScript(()=>localStorage.setItem('wakestate_onboarded','true'));}
 const [source,target]=await Promise.all(contexts.map(c=>c.newPage()));
 const errors=[];for(const page of [source,target])page.on('pageerror',e=>errors.push(e.message));
 await Promise.all([source.goto(origins[0]),target.goto(origins[1])]);
 // Seed through real save functions, independently of the importer under test.
 await source.evaluate(async f=>{
  const s=await import('/src/lib/storage.ts');
  for(const c of f.checkIns)await s.saveCheckIn(c);
  for(const e of [...f.events].reverse())await s.saveEvent(e);
  await s.saveSettings(f.settings);
  for(const m of Object.values(f.medications))await s.saveMedicationEntry(m);
  await s.saveMedicationConfig(f.medicationConfig);
  for(const a of f.medicationAdministrations)await s.saveMedicationAdministration(a);
  for(const e of f.sleepEntries)await s.saveSleepEntry(e);
 },fixture);
 assert.equal(JSON.parse(await snapshot(target)).checkIns.length,0);passed.push('destination origin initially empty');
 // The read-only old-origin helper must preserve the same complete snapshot.
 const bridgeDownload=source.waitForEvent('download');
 await source.evaluate(await fs.readFile('scripts/legacy-origin-backup.js','utf8'));
 await (await bridgeDownload).saveAs(`${output}/synthetic-legacy-recovery.json`);
 const recovery=await fs.readFile(`${output}/synthetic-legacy-recovery.json`,'utf8');
 assert.deepEqual(canonical(recovery),fixture);
 passed.push('old-origin recovery helper downloads every category without network or writes');
 const legacyContext=await browser.newContext();
 await legacyContext.route('**/*',route=>origins.some(o=>route.request().url().startsWith(o+'/'))?route.continue():route.abort());
 const legacyPage=await legacyContext.newPage();await legacyPage.goto(origins[0]+'/privacy.html');
 await legacyPage.evaluate(f=>{
  const fields={checkIns:'checkins',events:'events',settings:'settings',medications:'medications',medicationConfig:'med_config',medicationAdministrations:'med_administrations',sleepEntries:'sleep_entries'};
  for(const [field,key] of Object.entries(fields))localStorage.setItem('wakestate_'+key,JSON.stringify(f[field]));
 },fixture);
 const legacyDownload=legacyPage.waitForEvent('download');await legacyPage.evaluate(await fs.readFile('scripts/legacy-origin-backup.js','utf8'));
 await(await legacyDownload).saveAs(`${output}/synthetic-localstorage-recovery.json`);
 assert.deepEqual(canonical(await fs.readFile(`${output}/synthetic-localstorage-recovery.json`,'utf8')),fixture);
 assert.deepEqual(await legacyPage.evaluate(()=>indexedDB.databases()),[]);
 await legacyContext.close();passed.push('legacy-only localStorage recovered without creating an IndexedDB database');
 await reports(source);
 const downloaded=source.waitForEvent('download');await source.getByRole('button',{name:'Export JSON',exact:true}).click();
 const download=await downloaded;await download.saveAs(`${output}/synthetic-backup.json`);
 const backup=await fs.readFile(`${output}/synthetic-backup.json`,'utf8');assert.deepEqual(canonical(backup),fixture);passed.push('UI download preserves every category and field');
 await reports(target);await target.getByRole('button',{name:'Import File',exact:true}).click();
 const choosing=target.waitForEvent('filechooser');await target.getByRole('button',{name:'Select File',exact:true}).click();
 await (await choosing).setFiles({name:'synthetic-backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});
 await target.getByText('Import complete',{exact:true}).waitFor();
 assert.deepEqual(canonical(await snapshot(target)),fixture);await target.reload();assert.deepEqual(canonical(await snapshot(target)),fixture);passed.push('UI upload and reload preserve every field across origins');
 await restore(target,backup);assert.deepEqual(canonical(await snapshot(target)),fixture);passed.push('reimport replaces without duplicates');
 for(const invalid of ['{',JSON.stringify({...fixture,version:99}),JSON.stringify({...fixture,sleepEntries:[{totalSleepMinutes:-1}]}),JSON.stringify({events:[],padding:'x'.repeat(10*1024*1024)})]){
  await assert.rejects(()=>restore(target,invalid));assert.deepEqual(canonical(await snapshot(target)),fixture);
 }passed.push('malformed, future-version, corrupt and oversized backups rejected without writes');
 await restore(target,JSON.stringify({version:1,events:[]}));const partial=canonical(await snapshot(target));assert.deepEqual(partial,{...fixture,events:[]});passed.push('V1 partial import preserves omitted medication, sleep, settings and check-ins');
 await restore(target,backup);
 const failure=await target.evaluate(async json=>{const put=IDBObjectStore.prototype.put;try{IDBObjectStore.prototype.put=function(value,key){if(key==='wakestate_sleep_entries'){this.transaction.abort();throw new DOMException('Synthetic quota','QuotaExceededError');}return put.call(this,value,key);};await (await import('/src/lib/storage.ts')).importData(json);return false;}catch{return true;}finally{IDBObjectStore.prototype.put=put;}},JSON.stringify({version:2,checkIns:[],events:[],sleepEntries:[]}));
 assert.equal(failure,true);assert.deepEqual(canonical(await snapshot(target)),fixture);passed.push('mid-import quota failure rolls back all categories');
 const exportFailure=await target.evaluate(async()=>{const get=IDBObjectStore.prototype.get;try{IDBObjectStore.prototype.get=function(){throw new DOMException('Synthetic read failure','UnknownError');};await(await import('/src/lib/storage.ts')).exportAllData();return false;}catch{return true;}finally{IDBObjectStore.prototype.get=get;}});
 assert.equal(exportFailure,true);passed.push('export read failure rejects instead of producing an empty backup');
 assert.deepEqual(canonical(await snapshot(source)),fixture);assert.deepEqual(canonical(await snapshot(target)),fixture);assert.deepEqual(errors,[]);
 passed.push('source untouched; destination recovered; no browser runtime errors');
 await fs.writeFile(`${output}/result.json`,JSON.stringify({passed:true,syntheticOnly:true,checkedAt:new Date().toISOString(),origins,checks:passed,scope:'Chromium browser migration; not physical-device or live legacy-host QA'},null,2)+'\n');
 console.log(JSON.stringify({passed:true,checks:passed},null,2));
} catch (error) {
 await fs.writeFile(`${output}/result.json`,JSON.stringify({passed:false,status:'failed',syntheticOnly:true,checkedAt:new Date().toISOString(),checks:passed,error:String(error)},null,2)+'\n');
 throw error;
} finally {await browser?.close();await Promise.all(servers.map(s=>s.close()));}
