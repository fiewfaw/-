const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const postHtml = fs.readFileSync(path.join(root, 'blog', 'post.html'), 'utf8');
const sharedCss = fs.readFileSync(path.join(root, 'css', 'shared.css'), 'utf8');

assert.match(
  postHtml,
  /<figure[^>]+id="articleCover"[^>]+hidden/,
  'article detail includes a cover container that starts hidden',
);
assert.match(postHtml, /<img[^>]+id="articleCoverImage"/, 'article detail includes a dedicated cover image');
assert.match(postHtml, /function applyArticleCover\(meta, title\)/, 'cover rendering is handled from frontmatter');
assert.match(
  postHtml,
  /new URL\(meta\.image, window\.location\.href\)\.href/,
  'cover image resolves correctly on local and public article pages',
);
assert.match(postHtml, /coverImage\.alt = `ภาพปกบทความ \$\{title\}`/, 'cover has a useful article-specific alt');
assert.match(postHtml, /cover\.hidden = false/, 'cover becomes visible when frontmatter has an image');
assert.match(postHtml, /cover\.hidden = true/, 'cover stays hidden when an article has no image');
assert.match(postHtml, /applyArticleCover\(meta, meta\.title \|\| slug\)/, 'loaded article metadata drives the cover');
assert.match(
  postHtml,
  /const normalized = md\.replace\(\/\\r\\n\/g, '\\n'\)/,
  'frontmatter parsing normalizes Windows line endings before reading the image field',
);
assert.match(postHtml, /const match = normalized\.match/, 'frontmatter is parsed from normalized markdown');

const coverRule = sharedCss.match(/\.article-cover\s*\{([\s\S]*?)\}/);
assert.ok(coverRule, 'article cover CSS rule exists');
assert.match(coverRule[1], /max-width\s*:\s*900px/, 'cover aligns with the article column');
assert.match(coverRule[1], /aspect-ratio\s*:\s*16\s*\/\s*9/, 'cover keeps a stable layout while loading');

const imageRule = sharedCss.match(/\.article-cover img\s*\{([\s\S]*?)\}/);
assert.ok(imageRule, 'article cover image CSS rule exists');
assert.match(imageRule[1], /object-fit\s*:\s*contain/, 'detail cover shows the complete image without cropping');

console.log('PASS article detail renders an uncropped frontmatter cover image');
