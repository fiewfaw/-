const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'trunk-control-older-adults';
const articlePath = path.join(root, 'content', 'posts', `${slug}.md`);

assert.ok(fs.existsSync(articlePath), 'trunk control article exists');

const article = fs.readFileSync(articlePath, 'utf8');
const articles = JSON.parse(fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const pneumoniaArticle = fs.readFileSync(
  path.join(root, 'content', 'posts', 'post-pneumonia-deconditioning-rehab.md'),
  'utf8',
);

assert.match(article, /^title:\s*"[^"]+"/m, 'article has a title');
assert.match(article, /^seo_title:\s*"[^"]+"/m, 'article has an SEO title');
assert.match(article, /^description:\s*"[^"]+"/m, 'article has a description');
assert.match(article, /^image:\s*"\.\.\/blog\/images\/glossary\/trunk-control-older-adults-cover\.webp"/m, 'article uses the final cover image');
assert.match(article, /trunk control/i, 'article explains the clinical keyword');
assert.match(article, /ไม่ควรสรุป|ไม่ได้แปลว่า/, 'article avoids diagnosing trunk weakness from one symptom');
assert.match(article, /แหล่งอ้างอิง/, 'article includes references');

const entry = articles.find((item) => item.slug === slug);
assert.ok(entry, 'articles.json contains the article');
assert.equal(entry.image, '/blog/images/glossary/trunk-control-older-adults-cover.webp');

assert.equal(
  (sitemap.match(new RegExp(`slug=${slug}`, 'g')) || []).length,
  1,
  'sitemap includes the article once',
);
assert.match(
  pneumoniaArticle,
  /href="\/blog\/post\.html\?slug=trunk-control-older-adults"/,
  'the post-hospital article links to the trunk control article',
);

console.log('PASS trunk control article metadata, discovery, and internal link');
