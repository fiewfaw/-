const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'post-stroke-upper-limb-task-specific-training';
const articlePath = path.join(root, 'content', 'posts', `${slug}.md`);
const imageDir = path.join(root, 'blog', 'images', 'glossary');
const imageFiles = [
  'post-stroke-upper-limb-task-specific-training-cover.webp',
  'post-stroke-upper-limb-progression.webp',
  'post-stroke-upper-limb-quality-safety.webp',
];
const articles = JSON.parse(fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

assert.ok(fs.existsSync(articlePath), 'post-stroke upper-limb article exists');
for (const imageFile of imageFiles) {
  assert.ok(fs.existsSync(path.join(imageDir, imageFile)), `${imageFile} exists`);
}

const article = fs.readFileSync(articlePath, 'utf8');
for (const field of ['title', 'seo_title', 'description', 'date', 'updated', 'image', 'tags']) {
  assert.match(article, new RegExp(`^${field}:`, 'm'), `frontmatter includes ${field}`);
}

for (const term of [
  'task-specific',
  'goal-oriented',
  'Meaningful task',
  'Repetition',
  'Progressive challenge',
  'Quality of movement',
  'ADL carryover',
  'เอื้อม',
  'หยิบ',
  'จับ',
  'ปล่อย',
  '8 ใน 10',
]) {
  assert.match(article, new RegExp(term, 'i'), `article explains ${term}`);
}

assert.match(
  article,
  /(?:ultrasound|อัลตราซาวด์|เครื่องมือ).{0,260}(?:ไม่แทน|ไม่ใช่ตัวแทน|ต้องต่อด้วย).{0,160}(?:กิจกรรมจริง|การฝึกใช้งานจริง)/is,
  'positions passive modalities as preparation rather than the endpoint',
);
assert.match(
  article,
  /8 ใน 10.{0,220}(?:ไม่ใช่|ไม่ใช่เกณฑ์ตายตัว|แนวสังเกต)/s,
  'frames 8 in 10 as a practical observation rather than a universal cutoff',
);

for (const warning of [
  'ห้ามดึงแขน',
  'ปวดไหล่',
  'มือบวม',
  'แดง',
  'ร้อน',
  'ชาร้าว',
  'หน้าเบี้ยว',
  'พูดไม่ชัด',
  'ซึม',
]) {
  assert.match(article, new RegExp(warning), `includes safety guidance: ${warning}`);
}

for (const link of [
  'slug=shoulder-pain-after-stroke',
  'slug=spasticity-after-stroke',
  'slug=neuroplasticity-stroke-recovery',
  'slug=stroke-%E0%B8%84%E0%B8%B7%E0%B8%AD%E0%B8%AD%E0%B8%B0%E0%B9%84%E0%B8%A3',
]) {
  assert.match(article, new RegExp(link), `includes internal link ${link}`);
}

for (const imageFile of imageFiles) {
  assert.match(article, new RegExp(imageFile), `article embeds ${imageFile}`);
}
for (const reference of [
  'nice.org.uk/guidance/ng236',
  'strokebestpractices.ca',
  'professional.heart.org',
  '37293804',
]) {
  assert.match(article, new RegExp(reference, 'i'), `includes evidence source ${reference}`);
}

assert.ok(
  articles.some(
    item => item.slug === slug
      && item.image === '/blog/images/glossary/post-stroke-upper-limb-task-specific-training-cover.webp',
  ),
  'article is listed on the blog index with its cover',
);
assert.equal((sitemap.match(new RegExp(`slug=${slug}`, 'g')) || []).length, 1, 'sitemap contains article exactly once');

console.log('PASS post-stroke upper-limb task-specific article, safety, evidence, images, and discovery');
