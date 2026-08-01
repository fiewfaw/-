const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'osteoporosis-falls-safe-exercise';
const articlePath = path.join(root, 'content', 'posts', `${slug}.md`);
const coverPath = path.join(root, 'blog', 'images', 'glossary', `${slug}-cover.webp`);

assert.ok(fs.existsSync(articlePath), 'osteoporosis article exists');
assert.ok(fs.existsSync(coverPath), 'dedicated osteoporosis cover exists');

const article = fs.readFileSync(articlePath, 'utf8');
const articles = JSON.parse(fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const postTemplate = fs.readFileSync(path.join(root, 'blog', 'post.html'), 'utf8');

for (const field of ['title', 'seo_title', 'description', 'date', 'updated', 'image', 'tags']) {
  assert.match(article, new RegExp(`^${field}:`, 'm'), `frontmatter includes ${field}`);
}

for (const term of ['กระดูกพรุน', 'กระดูกหักจากแรงกระแทกต่ำ', 'การทรงตัว', 'แรงกล้ามเนื้อ']) {
  assert.match(article, new RegExp(term), `article explains ${term}`);
}

assert.match(article, /โรคเงียบ|ไม่มีอาการ/, 'explains that osteoporosis may be silent');
assert.match(article, /ไม่สามารถวินิจฉัย|ไม่ใช่การวินิจฉัย/, 'does not imply self-diagnosis');
assert.match(article, /ปวดหลังรุนแรง|ลงน้ำหนักไม่ได้|ผิดรูป/, 'includes suspected-fracture warning signs');
assert.match(article, /พบแพทย์|ประเมินโดยแพทย์/, 'routes suspected fracture to medical assessment');
assert.match(article, /ไม่ควรหยุดยา|อย่าหยุดยา|ไม่เปลี่ยนยา/, 'does not advise changing osteoporosis medication');
assert.match(article, /ไม่ได้แทนยา|ไม่สามารถแทนยา|ไม่ใช่การรักษาแทนยา/, 'does not present exercise as a medication replacement');
assert.match(article, /niams\.nih\.gov/, 'cites NIAMS osteoporosis guidance');
assert.match(article, /who\.int\/news-room\/fact-sheets\/detail\/fragility-fractures/, 'cites WHO fragility fracture guidance');
assert.match(article, /nogg\.org\.uk/, 'cites NOGG guidance');
assert.match(article, /theros\.org\.uk/, 'cites Royal Osteoporosis Society guidance');

assert.equal(articles.filter((item) => item.slug === slug).length, 1, 'article is indexed once');
assert.equal(
  articles.find((item) => item.slug === slug)?.image,
  `/blog/images/glossary/${slug}-cover.webp`,
  'article index uses its dedicated cover',
);
assert.equal((sitemap.match(new RegExp(`slug=${slug}`, 'g')) || []).length, 1, 'sitemap includes the article once');
assert.doesNotMatch(postTemplate, /มีคำถามเกี่ยวกับ Stroke/, 'article contact prompt is not stroke-specific');
assert.match(postTemplate, /มีคำถามเกี่ยวกับการฟื้นฟูหรือกายภาพบำบัด/, 'article contact prompt works across conditions');

console.log('PASS osteoporosis article safety, evidence, cover, index, and sitemap');
