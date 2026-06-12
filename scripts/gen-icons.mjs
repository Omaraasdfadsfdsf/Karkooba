// One-off: renders the app icon SVG to the PNG sizes the PWA manifest needs.
// Run with: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const svg = (padding) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b57bf7"/>
      <stop offset="1" stop-color="#f175b5"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="${padding ? 0 : 14}" fill="#ffffff"/>
  <text x="32" y="${padding ? 42 : 44}" font-family="Arial Black, Arial, sans-serif" font-weight="900"
        font-size="${padding ? 26 : 34}" text-anchor="middle" fill="url(#g)">K</text>
</svg>`);

mkdirSync('public/icons', { recursive: true });

for (const size of [192, 512]) {
  await sharp(svg(false)).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
  // maskable: extra safe-zone padding, square full-bleed background
  await sharp(svg(true)).resize(size, size).png().toFile(`public/icons/maskable-${size}.png`);
}
console.log('icons written to public/icons/');
