const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const aboutPath = path.join(root, 'about.html');
const serviceArticle = fs.readFileSync(
  path.join(root, 'content', 'posts', 'กายภาพบำบัดถึงบ้าน-ชลบุรี.md'),
  'utf8',
);
const articleCatalog = JSON.parse(
  fs.readFileSync(path.join(root, 'blog', 'articles.json'), 'utf8'),
);

assert.match(homepage, /href="about\.html"[^>]*>เกี่ยวกับเรา</, 'homepage navigation links to the About page');
assert.match(homepage, /class="app-preview-banner"/, 'homepage has the Care Navigator preview banner');
assert.match(homepage, /class="app-preview-journey"/, 'app banner uses the approved Care Navigator journey artwork');
assert.match(homepage, /class="app-journey-route"/, 'app banner visual connects screening to the personal plan');
assert.match(homepage, /care-navigator\/brand-logo\.png/, 'app banner uses the formal Care Navigator brand');
assert.match(homepage, /@media \(hover: hover\) and \(pointer: fine\)/, 'app banner hover motion only runs on pointer devices');
assert.match(homepage, /\.app-preview-banner:hover/, 'app banner lifts when the pointer moves over it');
assert.match(homepage, /@media \(max-width: 340px\)/, 'app banner has a compact layout for narrow phones');
assert.match(homepage, /\.app-preview-journey\s*\{[^}]*min-height:\s*180px/s, 'mobile app journey has enough room for all visual steps');
assert.match(homepage, /class="app-coming-soon"[^>]*href="care-navigator\/"/, 'app CTA links to the public Care Navigator');
assert.match(homepage, />ทดลองใช้แอพฟรี</, 'app CTA clearly invites free Beta use');
assert.match(homepage, /เวอร์ชัน Beta/, 'homepage labels the app as a Beta');
assert.doesNotMatch(homepage, /AI ช่วยฟื้น stroke ได้ใน/, 'old AI course advertisement is removed');

assert.match(homepage, /วางแผนฟื้นฟูการเคลื่อนไหว/, 'homepage uses the approved inclusive rehabilitation headline');
assert.match(homepage, /ให้เหมาะกับแต่ละคน/, 'homepage positions care around each person');
assert.match(
  homepage,
  /สำหรับผู้สูงอายุ ผู้ป่วยระบบประสาท และผู้ที่กำลังฟื้นตัวหลังเจ็บป่วยหรือผ่าตัด/,
  'homepage describes the wider audience',
);
assert.doesNotMatch(homepage, /Stroke ดีขึ้นได้/, 'homepage avoids an outcome promise');

assert.match(homepage, />ปรึกษาเบื้องต้นฟรี</, 'free entry service is an initial conversation');
assert.match(homepage, /ไม่มีข้อผูกมัด/, 'free initial conversation has no purchase obligation');
assert.doesNotMatch(homepage, /แลก content \+ รีวิว|แลกคอนเทนต์ \+ รีวิว/, 'reviews are not a condition of service');
assert.doesNotMatch(homepage, />ประเมินฟรี</, 'free conversation is not presented as a clinical assessment');

assert.match(homepage, /กายภาพบำบัดถึงบ้าน/, 'single home visit service is listed');
assert.match(homepage, /1,500 <span class="unit">บาท \/ ครั้ง<\/span>/, 'single home visit costs 1,500 baht per visit');
assert.doesNotMatch(homepage, /คอร์ส 5 ครั้ง/, 'five-visit course is removed');
assert.doesNotMatch(homepage, />7,500 /, '7,500 baht course price is removed');
assert.match(homepage, /คอร์ส 10 ครั้ง/, 'ten-visit course remains');
assert.match(homepage, /12,000 <span class="unit">บาท<\/span>/, 'ten-visit course price remains 12,000 baht');
assert.match(homepage, /<span class="stamp-percent">20%<\/span>/, 'ten-visit saving is correctly shown as 20 percent');
assert.match(homepage, /ดูแลต่อเนื่อง 10 ครั้ง ภายใน 2 เดือน/, 'course duration is stated without promising results');
assert.match(homepage, /Manual Technique เมื่อเหมาะสม/, 'manual treatment is conditional on assessment');
assert.doesNotMatch(homepage, /52%/, 'incorrect 52 percent saving is removed');
assert.doesNotMatch(homepage, /ผลลัพธ์เร็วสุด/, 'fixed outcome claim is removed');
assert.doesNotMatch(homepage, /ลง Manual ทุกครั้ง/, 'manual treatment is not promised on every visit');

const careNavigatorIndex = serviceArticle.indexOf('Care Navigator');
const lineIndex = serviceArticle.indexOf('LINE OA');
assert.ok(careNavigatorIndex >= 0, 'service article introduces Care Navigator');
assert.ok(lineIndex > careNavigatorIndex, 'service article routes Care Navigator before LINE OA');
assert.match(serviceArticle, /ปรึกษาเบื้องต้นฟรี/, 'service article uses the same free entry service');
assert.match(serviceArticle, /1,500 บาท\/ครั้ง/, 'service article lists the single home visit price');
assert.match(serviceArticle, /12,000 บาท \(10 ครั้ง\)/, 'service article lists the current ten-visit price');
assert.doesNotMatch(serviceArticle, /แลกคอนเทนต์ \+ รีวิว/, 'service article does not exchange care for reviews');
assert.doesNotMatch(serviceArticle, /7,500 บาท|2,500 บาท/, 'service article removes retired service prices');

const serviceArticleCard = articleCatalog.find((article) => article.slug === 'กายภาพบำบัดถึงบ้าน-ชลบุรี');
assert.ok(serviceArticleCard, 'service article remains listed in the blog catalog');
assert.match(serviceArticleCard.title, /เหมาะกับใครและเริ่มอย่างไร/, 'blog card uses the inclusive service title');
assert.match(serviceArticleCard.description, /ผู้สูงอายุ/, 'blog card description reflects the wider audience');

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
