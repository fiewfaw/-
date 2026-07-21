const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const slug = 'neuroplasticity-stroke-recovery';
const articles = JSON.parse(fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'));
const entry = articles.find((article) => article.slug === slug);

assert.ok(entry, 'registers the Neuroplasticity article in articles.json');
assert.match(entry.title, /Neuroplasticity/);
assert.match(entry.description, /สมอง|ระบบประสาท/);
assert.ok(entry.tags.includes('คลังคำศัพท์ Stroke'));
assert.ok(fs.existsSync(path.join(root, entry.image.replace(/^\//, ''))), 'article cover image exists');

const postPath = path.join(root, 'content', 'posts', `${slug}.md`);
assert.ok(fs.existsSync(postPath), 'creates the Neuroplasticity markdown article');
const post = fs.readFileSync(postPath, 'utf8');

for (const required of [
  'Neuroplasticity คืออะไร',
  'เกี่ยวข้องกับการฟื้นฟูหลัง Stroke อย่างไร',
  'หลักการฝึกที่ช่วยให้สมองเรียนรู้',
  'สิ่งที่ Neuroplasticity ไม่ได้รับประกัน',
  'เริ่มทำอะไรได้ด้วยตัวเอง',
  'นักกายภาพบำบัดจะช่วยประเมินอะไร',
  'เมื่อไรควรหยุดและพบแพทย์',
  'แหล่งข้อมูล',
]) {
  assert.match(post, new RegExp(required), `contains section: ${required}`);
}

assert.match(post, /task-specific|จำเพาะต่อกิจกรรม/i);
assert.match(post, /ทำซ้ำ|repetition/i);
assert.match(post, /มีความหมาย|เป้าหมาย/);
assert.match(post, /พัก|ความล้า/);
assert.match(post, /pubmed\.ncbi\.nlm\.nih\.gov\/18230848/);
assert.match(post, /strokeguideline\.org/);
assert.match(post, /\/blog\/post\.html\?slug=stroke-ep1/);
assert.doesNotMatch(post, /สมองส่วนอื่น[^\n]{0,80}ทำหน้าที่ทดแทนทั้งหมด/);
assert.doesNotMatch(post, /รับรองว่า[^\n]{0,40}หาย/);

console.log('PASS Neuroplasticity article structure and safety copy');
