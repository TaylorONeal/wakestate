import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const mark = await fs.readFile('branding/mark.svg', 'utf8');
const inner = mark.replace(/<svg[^>]*>/, '').replace('</svg>', '');
const icon = (size, transparent = false) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 108 108">${transparent ? '' : '<rect width="108" height="108" fill="#111b1e"/>'}${inner}</svg>`);
for (const [file, size] of [['pwa-192.png',192],['pwa-512.png',512],['pwa-maskable-512.png',512]]) await sharp(icon(size)).png().toFile(`public/${file}`);
await fs.writeFile('public/favicon.svg', icon(108));
const png = await sharp(icon(32)).png().toBuffer();
const header = Buffer.alloc(22); header.writeUInt16LE(1,2); header.writeUInt16LE(1,4); header[6]=32;header[7]=32;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
await fs.writeFile('public/favicon.ico',Buffer.concat([header,png]));
await sharp(icon(1024)).png().toFile('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
async function splash(file, width, height) {
 const size = Math.round(Math.min(width,height)*0.3);
 const image = await sharp(icon(size,true)).png().toBuffer();
 await sharp({create:{width,height,channels:3,background:'#111b1e'}}).composite([{input:image,gravity:'centre'}]).png().toFile(file);
}
for(const f of await fs.readdir('ios/App/App/Assets.xcassets/Splash.imageset')) if(f.endsWith('.png')) await splash(`ios/App/App/Assets.xcassets/Splash.imageset/${f}`,2732,2732);
const res='android/app/src/main/res';
for(const dir of await fs.readdir(res)) {
 if(!/^(drawable|mipmap)/.test(dir))continue;
 for(const file of await fs.readdir(path.join(res,dir))) {
  if(!file.endsWith('.png'))continue;
  const target=path.join(res,dir,file);const {width,height}=await sharp(target).metadata();
  if(file==='splash.png')await splash(target,width,height);
  else if(file.startsWith('ic_launcher')) {const bytes=await sharp(icon(width,file.includes('foreground'))).png().toBuffer();await fs.writeFile(target,bytes);}
 }
}
const social=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#111b1e"/><svg x="75" y="155" width="270" height="270" viewBox="0 0 108 108">${inner}</svg><text x="400" y="300" font-family="sans-serif" font-size="76" fill="#eef3f2">WakeState</text><text x="405" y="362" font-family="sans-serif" font-size="30" fill="#a6d5c8">Your sleep and wake journal.</text></svg>`);
await sharp(social).png().toFile('public/og-image.png');
console.log('Generated local web, social, iOS and Android branding.');
