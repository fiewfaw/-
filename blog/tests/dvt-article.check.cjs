const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'dvt-after-surgery';
const articlePath = path.join(root, 'content', 'posts', `${slug}.md`);
const coverPath = path.join(
  root,
  'blog',
  'images',
  'glossary',
  'dvt-after-surgery-cover.webp',
);
const articles = JSON.parse(
  fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'),
);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

assert.ok(fs.existsSync(articlePath), 'DVT article exists');
assert.ok(fs.existsSync(coverPath), 'dedicated DVT cover exists');

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

for (const term of ['DVT', 'PE', 'ลิ่มเลือด', 'หลอดเลือดดำส่วนลึก']) {
  assert.match(article, new RegExp(term, 'i'), `article explains ${term}`);
}

assert.match(
  article,
  /บวม[\s\S]{0,500}(?:พบได้|เกิดขึ้นได้|ปกติ)[\s\S]{0,700}(?:บวมเพิ่ม|บวมใหม่|ปวดน่อง|ร้อน|แดง)/,
  'distinguishes expected postoperative swelling from warning changes',
);
assert.match(
  article,
  /หายใจลำบาก|หอบ|หายใจไม่ออก/,
  'includes breathing-related PE warning signs',
);
assert.match(
  article,
  /เจ็บหน้าอก|แน่นหน้าอก/,
  'includes chest pain as an emergency warning sign',
);
assert.match(
  article,
  /ฉุกเฉิน|โรงพยาบาลทันที|โทรเรียกรถพยาบาล/,
  'routes possible PE symptoms to emergency care',
);
assert.match(
  article,
  /ไม่สามารถ(?:ยืนยัน|วินิจฉัย|ตัด).*(?:DVT|ลิ่มเลือด)|(?:DVT|ลิ่มเลือด).*ไม่สามารถ(?:ยืนยัน|วินิจฉัย|ตัด)/s,
  'does not encourage self-diagnosis',
);
assert.match(
  article,
  /Ankle Pump[\s\S]{0,500}(?:ไม่สามารถ|ไม่ใช่)[\s\S]{0,250}(?:ยืนยัน|ตัด|รักษา).*DVT/is,
  'clarifies that ankle pumps cannot rule out or treat DVT',
);
assert.match(
  article,
  /ยาละลายลิ่มเลือด|ยาต้านการแข็งตัวของเลือด|ยาป้องกันลิ่มเลือด/,
  'mentions prescribed anticoagulant therapy',
);
assert.match(
  article,
  /อย่า(?:หยุด|เพิ่ม|ลด|ปรับ).*ยา|ไม่ควร(?:หยุด|เพิ่ม|ลด|ปรับ).*ยา/s,
  'warns against changing prescribed medication independently',
);
assert.match(
  article,
  /weight-bearing-after-surgery/,
  'links to the related weight-bearing guide',
);
assert.doesNotMatch(
  article,
  /ใช้แอพติดตามอะไรได้บ้าง|แอพสามารถช่วยบันทึกข้อมูล/,
  'keeps the DVT guide focused on patient safety instead of app promotion',
);

assert.ok(
  articles.some(
    (item) => item.slug === slug
      && item.image === '/blog/images/glossary/dvt-after-surgery-cover.webp',
  ),
  'DVT article is listed on the blog index',
);
assert.equal(
  (sitemap.match(/slug=dvt-after-surgery/g) || []).length,
  1,
  'sitemap contains the DVT article exactly once',
);

console.log('PASS DVT/PE article safety copy, index, and sitemap');
