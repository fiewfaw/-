const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const article = fs.readFileSync(
  path.join(root, 'content', 'posts', 'spasticity-after-stroke.md'),
  'utf8',
);
const articleList = JSON.parse(fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

for (const field of ['title', 'seo_title', 'description', 'date', 'updated', 'image', 'tags']) {
  assert.match(article, new RegExp(`^${field}:`, 'm'), `article frontmatter includes ${field}`);
}

for (const heading of [
  'Spasticity คืออะไร',
  'สังเกตอาการอย่างไร',
  'อะไรทำให้อาการเกร็งเพิ่มขึ้น',
  'เริ่มจัดการอย่างปลอดภัย',
  'นักกายภาพและแพทย์จะประเมินอะไร',
  'ควรรีบพบแพทย์เมื่อไร',
  'แหล่งอ้างอิง',
]) {
  assert.ok(article.includes(heading), `article includes section: ${heading}`);
}

assert.match(article, /href="\/blog\/post\.html\?slug=stroke-ep1"/);
assert.match(article, /href="\/blog\/post\.html\?slug=neuroplasticity-stroke-recovery"/);
assert.doesNotMatch(article, /ยืดแรง|ดัดแรง|ฝืนสุด|หายขาดจากอาการเกร็ง/);
assert.equal(
  articleList.filter((item) => item.slug === 'spasticity-after-stroke').length,
  1,
  'blog index contains the new article once',
);
assert.equal(
  (sitemap.match(/slug=spasticity-after-stroke/g) || []).length,
  1,
  'sitemap contains the new article once',
);

console.log('PASS Spasticity article structure, safety copy, index, and sitemap');
