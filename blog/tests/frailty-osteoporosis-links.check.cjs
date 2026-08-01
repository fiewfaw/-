const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const frailty = fs.readFileSync(
  path.join(root, 'content', 'posts', 'frailty-in-older-adults.md'),
  'utf8',
);
const osteoporosis = fs.readFileSync(
  path.join(root, 'content', 'posts', 'osteoporosis-falls-safe-exercise.md'),
  'utf8',
);

assert.match(
  frailty,
  /href="\/blog\/post\.html\?slug=osteoporosis-falls-safe-exercise"[^>]*>กระดูกพรุน<\/a>/,
  'frailty article links to osteoporosis in context',
);
assert.match(
  osteoporosis,
  /href="\/blog\/post\.html\?slug=frailty-in-older-adults"[^>]*>ภาวะเปราะบางในผู้สูงอายุ<\/a>/,
  'osteoporosis article links back to frailty in context',
);

console.log('PASS frailty and osteoporosis articles link to each other');
