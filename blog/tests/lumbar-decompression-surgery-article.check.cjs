const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'lumbar-decompression-surgery';
const articlePath = path.join(root, 'content', 'posts', `${slug}.md`);
const imageDir = path.join(root, 'blog', 'images', 'glossary');
const imageFiles = [
  'lumbar-decompression-surgery-cover.webp',
  'lumbar-decompression-surgery-steps.webp',
  'lumbar-decompression-imaging.webp',
];
const articles = JSON.parse(
  fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'),
);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

assert.ok(fs.existsSync(articlePath), 'lumbar decompression article exists');
for (const imageFile of imageFiles) {
  assert.ok(fs.existsSync(path.join(imageDir, imageFile)), `${imageFile} exists`);
}

const article = fs.readFileSync(articlePath, 'utf8');

for (const field of [
  'title',
  'seo_title',
  'description',
  'date',
  'updated',
  'image',
  'tags',
]) {
  assert.match(article, new RegExp(`^${field}:`, 'm'), `frontmatter includes ${field}`);
}

for (const term of [
  'Lumbar decompression',
  'laminectomy',
  'discectomy',
  'ปวดร้าวลงขา',
  'การฝึกหายใจ',
  'กล้ามเนื้อลำตัว',
  'สะโพก',
  'ลุกยืน',
  'เดิน',
]) {
  assert.match(article, new RegExp(term, 'i'), `article explains ${term}`);
}

assert.match(
  article,
  /X-ray.{0,220}(?:เส้นประสาท|การกดทับ).{0,160}(?:ไม่ชัด|มองไม่เห็น)|(?:เส้นประสาท|การกดทับ).{0,220}X-ray/is,
  'explains the limitation of plain X-ray for nerve compression',
);
assert.match(
  article,
  /(?:สกรู|เชื่อมกระดูก).{0,220}(?:ไม่ใช่ทุกคน|ไม่ได้ทำทุกคน|เฉพาะบางราย)/is,
  'states that fusion hardware is not used for every decompression patient',
);
assert.match(
  article,
  /ภาพจำลองเพื่อการศึกษา.{0,180}ไม่ใช่ภาพของผู้ป่วยจริง/is,
  'labels the educational medical illustrations clearly',
);

for (const warning of [
  'ปวดรุนแรงขึ้นมาก',
  'ชา',
  'อ่อนแรง',
  'ปัสสาวะ',
  'อุจจาระ',
  'ไข้',
  'แผล',
  'หายใจเหนื่อย',
  'เจ็บหน้าอก',
]) {
  assert.match(article, new RegExp(warning), `includes red flag: ${warning}`);
}

assert.match(
  article,
  /คำสั่ง.{0,100}(?:ศัลยแพทย์|แพทย์ผู้ผ่าตัด).{0,180}นักกายภาพ|นักกายภาพ.{0,180}คำสั่ง.{0,100}(?:ศัลยแพทย์|แพทย์ผู้ผ่าตัด)/is,
  'requires tailoring to surgeon and physiotherapist guidance',
);
assert.match(
  article,
  /ไม่.{0,80}แทน.{0,80}(?:การติดตาม|การนัด|การตรวจ).{0,100}(?:ศัลยแพทย์|แพทย์ผู้ผ่าตัด)/is,
  'does not position physiotherapy as a replacement for surgical follow-up',
);

for (const imageFile of imageFiles) {
  assert.match(article, new RegExp(imageFile), `article embeds ${imageFile}`);
}

for (const reference of ['nhs.uk', 'orthoinfo.aaos.org']) {
  assert.match(article, new RegExp(reference, 'i'), `includes evidence source ${reference}`);
}

assert.ok(
  articles.some(
    (item) => item.slug === slug
      && item.image === '/blog/images/glossary/lumbar-decompression-surgery-cover.webp',
  ),
  'article is listed on the blog index with its cover',
);
assert.equal(
  (sitemap.match(new RegExp(`slug=${slug}`, 'g')) || []).length,
  1,
  'sitemap contains the article exactly once',
);

console.log('PASS lumbar decompression article, illustrations, safety, evidence, and discovery');
