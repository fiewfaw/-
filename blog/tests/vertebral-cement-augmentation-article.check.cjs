const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'vertebral-cement-augmentation-home-rehab';
const articlePath = path.join(root, 'content', 'posts', `${slug}.md`);
const imageDir = path.join(root, 'blog', 'images', 'glossary');
const imageFiles = [
  'vertebral-cement-augmentation-cover.webp',
  'vertebroplasty-kyphoplasty-steps.webp',
  'vertebral-cement-safe-movement.webp',
];
const articles = JSON.parse(fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

assert.ok(fs.existsSync(articlePath), 'vertebral cement augmentation article exists');
for (const imageFile of imageFiles) {
  assert.ok(fs.existsSync(path.join(imageDir, imageFile)), `${imageFile} exists`);
}

const article = fs.readFileSync(articlePath, 'utf8');
for (const field of ['title', 'seo_title', 'description', 'date', 'updated', 'image', 'tags']) {
  assert.match(article, new RegExp(`^${field}:`, 'm'), `frontmatter includes ${field}`);
}

for (const term of [
  'Vertebroplasty',
  'Kyphoplasty',
  'กระดูกสันหลังยุบ',
  'กระดูกพรุน',
  'พับที่สะโพก',
  'หมุนด้วยเท้า',
  'log-roll',
  'sit-to-stand',
  'ยืนพยุง',
  'เดินระยะสั้น',
  'ab wheel',
]) {
  assert.match(article, new RegExp(term, 'i'), `article explains ${term}`);
}

for (const warning of [
  'ปวดหลังรุนแรงขึ้นทันที',
  'ปวดร้าวลงขาใหม่',
  'ชา',
  'อ่อนแรง',
  'เดินแย่ลง',
  'ปัสสาวะ',
  'อุจจาระ',
  'ไข้',
  'แผล',
]) {
  assert.match(article, new RegExp(warning), `includes red flag: ${warning}`);
}

assert.match(
  article,
  /ข้อ(?:ห้าม|จำกัด).{0,120}(?:แพทย์|ผู้ทำหัตถการ).{0,120}(?:มาก่อน|สำคัญที่สุด)/s,
  'prioritizes procedure-specific restrictions',
);
assert.match(article, /เพิ่ม.{0,40}(?:ทีละน้อย|อย่างค่อยเป็นค่อยไป)/s, 'uses gradual progression');
assert.match(
  article,
  /ไม่ได้หมายความว่า.{0,20}ห้าม(?:ก้ม|หมุน|บิด).{0,30}ตลอดชีวิต/s,
  'explicitly rejects permanent blanket movement bans',
);
assert.doesNotMatch(article, /วันที่\s*\d+.{0,80}(?:ทำ|ฝึก)|สัปดาห์ที่\s*\d+.{0,80}(?:ทำ|ฝึก)/s, 'does not prescribe a fixed timeline');

for (const imageFile of imageFiles) {
  assert.match(article, new RegExp(imageFile), `article embeds ${imageFile}`);
}
for (const reference of ['10.1002/jor.25631', '10.1136/bjsports-2021-104634', 'radiologyinfo.org']) {
  assert.match(article, new RegExp(reference, 'i'), `includes evidence source ${reference}`);
}
assert.match(article, /slug=osteoporosis-falls-safe-exercise/, 'links to the osteoporosis article');

assert.ok(
  articles.some(
    item => item.slug === slug
      && item.image === '/blog/images/glossary/vertebral-cement-augmentation-cover.webp',
  ),
  'article is listed on the blog index with its cover',
);
assert.equal((sitemap.match(new RegExp(`slug=${slug}`, 'g')) || []).length, 1, 'sitemap contains article exactly once');

console.log('PASS vertebral cement augmentation article, safety, evidence, images, and discovery');
