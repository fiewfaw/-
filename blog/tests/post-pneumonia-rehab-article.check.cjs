const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'post-pneumonia-deconditioning-rehab';
const articlePath = path.join(root, 'content', 'posts', `${slug}.md`);
const coverPath = path.join(
  root,
  'blog',
  'images',
  'glossary',
  'post-pneumonia-deconditioning-rehab-cover.webp',
);
const articles = JSON.parse(
  fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'),
);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

assert.ok(fs.existsSync(articlePath), 'post-pneumonia rehabilitation article exists');
assert.ok(fs.existsSync(coverPath), 'dedicated post-pneumonia cover exists');

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
  'ปอดติดเชื้อ',
  'pneumonia',
  'deconditioning',
  'หลังนอนโรงพยาบาล',
  'ความทนทาน',
  'ลุกจากเก้าอี้',
  'เดินช่วงสั้น',
  'SpO2',
  'ความดันตกเมื่อเปลี่ยนท่า',
]) {
  assert.match(article, new RegExp(term, 'i'), `article explains ${term}`);
}

assert.match(
  article,
  /ไม่ควร.{0,60}(?:ขี้เกียจ|ไม่ยอมเดิน)|ไม่ได้แปลว่า.{0,30}(?:ขี้เกียจ|ไม่ยอมเดิน)/s,
  'does not frame reduced mobility as laziness',
);
assert.match(
  article,
  /หอบ.{0,80}(?:ขณะพัก|มากขึ้น)|เจ็บหน้าอก|ริมฝีปาก.{0,20}(?:เขียว|คล้ำ)|ซึมลง|สับสน|ไข้.{0,30}(?:กลับ|ใหม่)/s,
  'includes medical warning signs before rehabilitation',
);
assert.match(
  article,
  /เพิ่ม.{0,30}(?:ทีละน้อย|อย่างค่อยเป็นค่อยไป)|ไม่ฝืน.{0,30}(?:เดิน|ออกกำลัง)/s,
  'recommends gradual progression instead of forcing activity',
);
assert.match(article, /interval|สลับพัก/i, 'explains short interval walking');
assert.match(article, /นักกายภาพบำบัด.{0,200}ประเมิน/s, 'explains the physiotherapy assessment role');

assert.doesNotMatch(article, /DVT|ลิ่มเลือดอุดตันในหลอดเลือดดำส่วนลึก|ปวดน่อง|หนักน่อง/i, 'keeps DVT and calf-pain content in the separate DVT article');
assert.doesNotMatch(article, /อรรถเดช|เฉลิมผจง|Centrum|แป๊ะก๊วย/i, 'does not expose case-identifying details');

assert.ok(
  articles.some(
    (item) => item.slug === slug
      && item.image === '/blog/images/glossary/post-pneumonia-deconditioning-rehab-cover.webp',
  ),
  'post-pneumonia article is listed on the blog index',
);
assert.equal(
  (sitemap.match(/slug=post-pneumonia-deconditioning-rehab/g) || []).length,
  1,
  'sitemap contains the post-pneumonia article exactly once',
);

console.log('PASS post-pneumonia rehabilitation article, privacy, index, and sitemap');
