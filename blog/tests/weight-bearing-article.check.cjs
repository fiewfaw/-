const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'weight-bearing-after-surgery';
const articlePath = path.join(root, 'content', 'posts', `${slug}.md`);
const coverPath = path.join(
  root,
  'blog',
  'images',
  'glossary',
  'weight-bearing-status-cover.webp',
);
const articles = JSON.parse(
  fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'),
);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

assert.ok(fs.existsSync(articlePath), 'weight-bearing article exists');
assert.ok(fs.existsSync(coverPath), 'dedicated weight-bearing cover exists');

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

for (const term of ['NWB', 'TTWB', 'PWB', 'WBAT', 'FWB']) {
  assert.match(article, new RegExp(`\\b${term}\\b`), `article explains ${term}`);
}

assert.match(
  article,
  /ใบ(?:สรุปการรักษา|จำหน่าย)|คำสั่ง(?:แพทย์|ทีมรักษา)/,
  'tells the patient where to confirm the prescribed status',
);
assert.match(
  article,
  /ไม่ควร(?:เดา|เพิ่ม|เปลี่ยน).*ลงน้ำหนัก|ห้าม(?:เดา|เพิ่ม|เปลี่ยน).*ลงน้ำหนัก/s,
  'warns against changing weight-bearing status independently',
);
assert.match(
  article,
  /WBAT[\s\S]{0,700}(?:อาการ|ทนได้)[\s\S]{0,700}(?:walker|ไม้ค้ำ|อุปกรณ์ช่วยเดิน)/i,
  'explains WBAT together with symptoms and the prescribed walking aid',
);
assert.doesNotMatch(
  article,
  /WBAT\s*(?:เท่ากับ|หมายถึง)\s*(?:FWB|ลงน้ำหนักเต็ม)/i,
  'does not equate WBAT with full weight bearing',
);
assert.match(
  article,
  /weight-bearing-status-cover\.webp/,
  'article uses its dedicated cover',
);

assert.ok(
  articles.some(
    (item) => item.slug === slug
      && item.image === '/blog/images/glossary/weight-bearing-status-cover.webp',
  ),
  'article is listed on the blog index',
);
assert.equal(
  (sitemap.match(/slug=weight-bearing-after-surgery/g) || []).length,
  1,
  'sitemap contains the article exactly once',
);

console.log('PASS weight-bearing article, safety copy, index, and sitemap');
