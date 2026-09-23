import { createDemoBackup } from './demo-backup.mjs';
if (!process.argv[2]) throw new Error('Usage: node scripts/store/generate-demo.mjs YYYY-MM-DD > demo-backup.json');
process.stdout.write(JSON.stringify(createDemoBackup(process.argv[2]), null, 2) + '\n');
