const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'verbal-self-instruction-stroke-rehab';
const articlePath = path.join(root, 'content', 'posts', `${slug}.md`);
const coverPath = path.join(
  root,
  'blog',
  'images',
  'glossary',
  'verbal-self-instruction-stroke-cover.webp',
);
const articles = JSON.parse(
  fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'),
);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

assert.ok(fs.existsSync(articlePath), 'verbal self-instruction Stroke article exists');
assert.ok(fs.existsSync(coverPath), 'dedicated verbal self-instruction cover exists');

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
  'verbal self-instruction',
  'self-verbalization',
  'สมาธิ',
  'ลำดับ',
  'ท่ายกก้น',
  'การทรงตัวในท่านั่ง',
  'ลุกจากเก้าอี้',
  'aphasia',
  'apraxia',
]) {
  assert.match(article, new RegExp(term, 'i'), `article explains ${term}`);
}

assert.match(
  article,
  /ไม่ใช่.{0,120}(?:dual-task|ทำสองอย่าง)|ต่างจาก.{0,120}(?:dual-task|ทำสองอย่าง)/is,
  'distinguishes task-integrated self-instruction from unrelated dual-task practice',
);
assert.match(
  article,
  /หลักฐาน.{0,160}(?:ยังจำกัด|ยังไม่มาก|ไม่สม่ำเสมอ)|ไม่ใช่.{0,100}(?:วิธีที่เหมาะกับทุกคน|ใช้ได้กับทุกคน)/is,
  'states the limits of current evidence and avoids universal claims',
);
assert.match(
  article,
  /ลดสิ่งรบกวน.{0,220}(?:คำสั้น|ทีละคำสั่ง).{0,220}(?:รอ|เวลา).*ประมวลผล/is,
  'teaches caregivers to reduce distractions, use short cues, and allow processing time',
);
assert.match(
  article,
  /หน้าเบี้ยว|พูดไม่ชัด|อ่อนแรง.{0,30}(?:ใหม่|เฉียบพลัน)|ปวดศีรษะรุนแรง/is,
  'includes new Stroke warning signs',
);

for (const relatedSlug of [
  'stroke-ep1',
  'spasticity-after-stroke',
  'shoulder-pain-after-stroke',
  'trunk-control-older-adults',
]) {
  assert.match(
    article,
    new RegExp(`href="/blog/post\\.html\\?slug=${relatedSlug}"`),
    `links to related article: ${relatedSlug}`,
  );
}

for (const reference of ['ng236', '39462260', '36524387', '30910568', '37295704']) {
  assert.match(article, new RegExp(reference, 'i'), `includes evidence source ${reference}`);
}

assert.ok(
  articles.some(
    (item) => item.slug === slug
      && item.image === '/blog/images/glossary/verbal-self-instruction-stroke-cover.webp',
  ),
  'article is listed on the blog index with its cover',
);
assert.equal(
  (sitemap.match(new RegExp(`slug=${slug}`, 'g')) || []).length,
  1,
  'sitemap contains the article exactly once',
);

console.log('PASS verbal self-instruction Stroke article, safety, evidence, and discovery');
