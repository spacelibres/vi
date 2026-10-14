import fs from 'node:fs';
import { build, locales } from './i18n-merge.mjs';

fs.writeFileSync('i18n-data.js', build());
console.log('i18n-data.js:', locales().length, 'locales,', fs.statSync('i18n-data.js').size, 'bytes');
