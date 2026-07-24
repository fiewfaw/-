const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const indexHtml = fs.readFileSync(path.join(root, 'blog', 'index.html'), 'utf8');
const postHtml = fs.readFileSync(path.join(root, 'blog', 'post.html'), 'utf8');
const sharedCss = fs.readFileSync(path.join(root, 'css', 'shared.css'), 'utf8');

for (const [name, html] of [
  ['blog index', indexHtml],
  ['related article cards', postHtml],
]) {
  assert.doesNotMatch(
    html,
    /background-size\s*:\s*cover/,
    `${name} must not crop article cover images`,
  );
  assert.match(
    html,
    /background-image\s*:\s*url\(/,
    `${name} still renders article cover images`,
  );
}

const cardImageRule = sharedCss.match(/\.blog-card-img\s*\{([\s\S]*?)\}/);
assert.ok(cardImageRule, 'blog card image CSS rule exists');
assert.match(
  cardImageRule[1],
  /background-size\s*:\s*contain/,
  'article cards show the complete cover image',
);
assert.match(
  cardImageRule[1],
  /background-repeat\s*:\s*no-repeat/,
  'article cover images do not tile',
);
assert.match(
  cardImageRule[1],
  /background-position\s*:\s*center/,
  'article cover images stay centered',
);
assert.match(
  cardImageRule[1],
  /background-color\s*:/,
  'unused image space has a deliberate background color',
);

console.log('PASS article card covers use uncropped contain presentation');
