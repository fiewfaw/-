const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'low-moca-safe-home-physio';
const articlePath = path.join(root, 'content', 'posts', `${slug}.md`);

assert.ok(fs.existsSync(articlePath), 'MoCA caregiver article exists');

const article = fs.readFileSync(articlePath, 'utf8');
const articles = JSON.parse(fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

assert.match(article, /^title:\s*"[^"]+"/m, 'article has a title');
assert.match(article, /^seo_title:\s*"[^"]+"/m, 'article has an SEO title');
assert.match(article, /^description:\s*"[^"]+"/m, 'article has a description');
assert.match(
  article,
  /^image:\s*"\.\.\/blog\/images\/glossary\/low-moca-safe-home-physio-cover\.webp"/m,
  'article uses the final cover image',
);
assert.match(article, /คัดกรอง[^\n]{0,100}ไม่ใช่[^\n]{0,100}วินิจฉัย/, 'article distinguishes screening from diagnosis');
assert.match(article, /คำสั่งทีละขั้น|คำสั่งสั้น/, 'article includes simplified cueing');
assert.match(article, /ทำเองได้/, 'article separates independent activity');
assert.match(article, /ต้องมีคนเฝ้า|ต้องมีคนช่วย/, 'article identifies guarded activity');
assert.match(article, /ไม่มีผู้ดูแลประจำ/, 'article covers living without a regular caregiver');
assert.match(article, /สับสนเฉียบพลัน|ซึมลง/, 'article includes acute cognitive red flags');
assert.match(article, /แหล่งอ้างอิง/, 'article includes references');

const entry = articles.find((item) => item.slug === slug);
assert.ok(entry, 'articles.json contains the article');
assert.equal(entry.image, '/blog/images/glossary/low-moca-safe-home-physio-cover.webp');

assert.equal(
  (sitemap.match(new RegExp(`slug=${slug}`, 'g')) || []).length,
  1,
  'sitemap includes the article once',
);

console.log('PASS MoCA caregiver article metadata, safety content, and discovery');
