const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..', '..')
const records = [
  ['frailty-in-older-adults', 'frailty-in-older-adults-cover.webp'],
  ['frailty-assessment', 'frailty-assessment-cover.webp'],
  ['frailty-recovery-potential', 'frailty-recovery-potential-cover.webp'],
  ['frailty-care-and-physical-therapy', 'frailty-care-cover.webp'],
]

const articles = JSON.parse(
  fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'),
)
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8')

for (const [slug, cover] of records) {
  const postPath = path.join(root, 'content', 'posts', `${slug}.md`)
  const coverPath = path.join(root, 'blog', 'images', 'glossary', cover)

  assert.ok(fs.existsSync(postPath), `${slug} post exists`)
  assert.ok(fs.existsSync(coverPath), `${slug} cover exists`)

  const post = fs.readFileSync(postPath, 'utf8')
  for (const field of [
    'title',
    'seo_title',
    'description',
    'date',
    'updated',
    'image',
    'tags',
  ]) {
    assert.match(post, new RegExp(`^${field}:`, 'm'), `${slug} includes ${field}`)
  }

  assert.ok(articles.some((item) => item.slug === slug), `${slug} is indexed`)
  assert.equal(
    (sitemap.match(new RegExp(`slug=${slug}`, 'g')) || []).length,
    1,
    `${slug} is in sitemap once`,
  )
}

const definition = fs.readFileSync(
  path.join(root, 'content', 'posts', 'frailty-in-older-adults.md'),
  'utf8',
)
const assessment = fs.readFileSync(
  path.join(root, 'content', 'posts', 'frailty-assessment.md'),
  'utf8',
)
const recovery = fs.readFileSync(
  path.join(root, 'content', 'posts', 'frailty-recovery-potential.md'),
  'utf8',
)
const care = fs.readFileSync(
  path.join(root, 'content', 'posts', 'frailty-care-and-physical-therapy.md'),
  'utf8',
)

assert.match(definition, /ไม่ใช่(?:ส่วนหนึ่ง|ผลลัพธ์).*ความแก่|ไม่ใช่.*แก่ตามวัย/s)
assert.match(assessment, /คัดกรอง[\s\S]+ไม่ใช่การวินิจฉัย/)
assert.match(recovery, /ไม่(?:สามารถ|ควร).*รับประกัน.*ฟื้น|ไม่รับประกัน.*ฟื้น/s)
assert.match(care, /ไม่จำเป็นต้องจ้าง|ลด.*การจ้าง|ยุติ.*การจ้าง/s)

console.log('PASS frailty article cluster, index, safety copy, and sitemap')
