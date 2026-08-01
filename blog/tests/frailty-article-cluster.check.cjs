const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const records = [
  ['frailty-in-older-adults', 'frailty-in-older-adults-cover.webp'],
  ['frailty-assessment', 'frailty-assessment-cover.webp'],
  ['frailty-recovery-potential', 'frailty-recovery-potential-cover.webp'],
  ['frailty-care-and-physical-therapy', 'frailty-care-cover.webp'],
];

const articles = JSON.parse(
  fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'),
);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

for (const [slug, cover] of records) {
  const postPath = path.join(root, 'content', 'posts', `${slug}.md`);
  const coverPath = path.join(root, 'blog', 'images', 'glossary', cover);

  assert.ok(fs.existsSync(postPath), `${slug} post exists`);
  assert.ok(fs.existsSync(coverPath), `${slug} cover exists`);

  const post = fs.readFileSync(postPath, 'utf8');
  for (const field of [
    'title',
    'seo_title',
    'description',
    'date',
    'updated',
    'image',
    'tags',
  ]) {
    assert.match(post, new RegExp(`^${field}:`, 'm'), `${slug} includes ${field}`);
  }

  const indexed = articles.filter((item) => item.slug === slug);
  assert.equal(indexed.length, 1, `${slug} is indexed once`);
  assert.equal(
    indexed[0].image,
    `/blog/images/glossary/${cover}`,
    `${slug} uses its dedicated cover`,
  );
  assert.equal(
    (sitemap.match(new RegExp(`slug=${slug}`, 'g')) || []).length,
    1,
    `${slug} is in sitemap once`,
  );
}

console.log('PASS frailty article cluster, covers, index, and sitemap');
