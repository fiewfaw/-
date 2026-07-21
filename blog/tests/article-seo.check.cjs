const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const template = fs.readFileSync(path.join(root, 'blog', 'post.html'), 'utf8');
const article = fs.readFileSync(
  path.join(root, 'content', 'posts', 'neuroplasticity-stroke-recovery.md'),
  'utf8',
);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

function count(text, pattern) {
  return (text.match(pattern) || []).length;
}

assert.match(article, /^seo_title:\s*"[^"]+"/m, 'article has a concise SEO title');
assert.match(
  article,
  /href="\/blog\/post\.html\?slug=stroke-ep1"/,
  'the Stroke term links to the existing foundational article',
);

for (const marker of [
  'og:title',
  'og:description',
  'og:image',
  'og:url',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
]) {
  assert.ok(template.includes(marker), `template exposes ${marker}`);
}

assert.match(template, /function applyArticleMetadata/, 'metadata is populated from frontmatter');
assert.match(template, /setAttribute\(['"]rel['"],\s*['"]canonical['"]\)/, 'JavaScript creates one article-specific canonical URL');
assert.match(template, /mainEntityOfPage/, 'Article schema identifies the canonical page');
assert.match(template, /dateModified/, 'Article schema includes its modification date');
assert.match(template, /"image"/, 'Article schema includes the article image');
assert.match(template, /class="article-author-box"/, 'article shows a visible author and reviewer box');
assert.match(template, /นักกายภาพบำบัด บ้านกายภาพ ชลบุรี/, 'author role is explicit and accurate');

assert.equal(
  count(sitemap, /slug=neuroplasticity-stroke-recovery/g),
  1,
  'sitemap includes the Neuroplasticity article once',
);
assert.equal(count(sitemap, /slug=stroke-ep2/g), 1, 'sitemap does not duplicate stroke-ep2');

console.log('PASS article SEO metadata, trust signals, internal links, and sitemap');
