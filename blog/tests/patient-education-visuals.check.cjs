const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const imageDir = path.join(root, 'blog', 'images', 'glossary');
const articles = JSON.parse(
  fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'),
);

const cases = [
  {
    slug: 'lumbar-decompression-surgery',
    images: [
      'lumbar-decompression-breathing.webp',
      'lumbar-decompression-bed-mobility.webp',
      'lumbar-decompression-sit-stand-walk.webp',
      'lumbar-decompression-strength-basics.webp',
      'lumbar-decompression-daily-activity.webp',
    ],
    terms: [
      'ไม่กำหนดจำนวนครั้ง',
      'หยุดฝึก',
      'คำสั่งของศัลยแพทย์',
    ],
    captionCount: 7,
  },
  {
    slug: 'stroke-คืออะไร',
    cover: 'stroke-basics-cover.webp',
    images: [
      'stroke-basics-cover.webp',
      'stroke-types.webp',
      'stroke-fast.webp',
      'stroke-ct-mri.webp',
      'stroke-rehabilitation.webp',
    ],
    terms: [
      'Ischemic Stroke',
      'Hemorrhagic Stroke',
      'FAST',
      '1669',
      'CT',
      'MRI',
      'ทีมสหวิชาชีพ',
      'cdc.gov',
      'nhs.uk',
    ],
  },
];

for (const item of cases) {
  const articlePath = path.join(root, 'content', 'posts', `${item.slug}.md`);
  assert.ok(fs.existsSync(articlePath), `${item.slug} article exists`);
  const article = fs.readFileSync(articlePath, 'utf8');

  for (const imageFile of item.images) {
    assert.ok(fs.existsSync(path.join(imageDir, imageFile)), `${imageFile} exists`);
    assert.match(article, new RegExp(imageFile), `${item.slug} embeds ${imageFile}`);
  }

  for (const term of item.terms) {
    assert.match(article, new RegExp(term, 'i'), `${item.slug} includes ${term}`);
  }

  assert.equal(
    (article.match(/ภาพจำลองเพื่อการศึกษา ไม่ใช่ภาพของผู้ป่วยจริง/g) || []).length,
    item.captionCount || item.images.length,
    `${item.slug} labels every new image as an educational simulation`,
  );

  if (item.cover) {
    assert.match(article, new RegExp(`^image:.*${item.cover}`, 'm'), 'Stroke frontmatter uses dedicated cover');
    assert.ok(
      articles.some(
        (entry) => entry.slug === item.slug
          && entry.image === `/blog/images/glossary/${item.cover}`,
      ),
      'Stroke blog card uses its dedicated cover',
    );
  }
}

console.log('PASS lumbar exercise visuals and Stroke patient-education visuals');
