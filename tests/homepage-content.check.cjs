const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const aboutPath = path.join(root, 'about.html');

assert.match(homepage, /href="about\.html"[^>]*>เกี่ยวกับเรา</, 'homepage navigation links to the About page');
assert.match(homepage, /class="app-preview-banner"/, 'homepage has the Care Navigator preview banner');
assert.match(homepage, /รูปประกอบ\/care-app-coming-soon-preview\.png/, 'app banner uses a real product preview');
assert.match(homepage, /class="app-coming-soon"[^>]*disabled/, 'app CTA is visibly disabled before launch');
assert.match(homepage, />เร็ว ๆ นี้</, 'disabled app CTA explains the launch status');
assert.doesNotMatch(homepage, /href="[^"]*care-app/, 'unfinished app has no public link');
assert.doesNotMatch(homepage, /AI ช่วยฟื้น stroke ได้ใน/, 'old AI course advertisement is removed');

assert.match(homepage, /กายภาพบำบัดถึงบ้าน/, 'single home visit service is listed');
assert.match(homepage, /1,500 <span class="unit">บาท \/ ครั้ง<\/span>/, 'single home visit costs 1,500 baht per visit');
assert.doesNotMatch(homepage, /คอร์ส 5 ครั้ง/, 'five-visit course is removed');
assert.doesNotMatch(homepage, />7,500 /, '7,500 baht course price is removed');
assert.match(homepage, /คอร์ส 10 ครั้ง/, 'ten-visit course remains');
assert.match(homepage, /12,000 <span class="unit">บาท<\/span>/, 'ten-visit course price remains 12,000 baht');

assert.ok(fs.existsSync(aboutPath), 'dedicated About page exists');
const about = fs.readFileSync(aboutPath, 'utf8');
assert.match(about, /กภ\.รัชธรรม เชื้อแถว/, 'About page identifies the physiotherapist');
assert.match(about, /ก\.13360/, 'About page includes the professional license');
assert.match(about, /จุฬาลงกรณ์มหาวิทยาลัย/, 'About page includes undergraduate education');
assert.match(about, /มหาวิทยาลัยศรีนครินทรวิโรฒ/, 'About page accurately states current graduate study');
assert.match(about, /มุ่งเน้นการฟื้นฟูระบบประสาท/, 'About page uses accurate professional positioning');
assert.match(about, /ไม่ใช่ทำให้คนไข้ต้องพึ่งนักกายภาพตลอดไป/, 'About page states the care philosophy');
assert.match(about, /"@type": "ProfilePage"/, 'About page exposes ProfilePage structured data');
assert.doesNotMatch(about, /มีเว็บแอป|เปิดใช้แอป/, 'About page does not claim the unfinished app is available');

assert.doesNotMatch(homepage, /เฉพาะทาง Stroke/, 'homepage avoids an unverified specialist claim');

console.log('PASS homepage profile, app preview, and pricing content');
