const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (...segments) => fs.readFileSync(path.join(root, ...segments), 'utf8');

const pages = {
    home: read('index.html'),
    about: read('about.html'),
    blog: read('blog', 'index.html'),
    post: read('blog', 'post.html'),
    videos: read('videos', 'index.html'),
};

const expectedPrimaryLabels = ['หน้าหลัก', 'ความรู้', 'เกี่ยวกับเรา', 'ปรึกษาฟรี'];

function primaryLabels(html) {
    const linksBlock = html.match(/<div class="nav-links">([\s\S]*?)<\/div>/);
    assert.ok(linksBlock, 'page has a primary nav-links block');
    return [...linksBlock[1].matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)]
        .map((match) => match[1].replace(/<[^>]+>/g, '').trim());
}

for (const [name, html] of Object.entries(pages)) {
    assert.deepStrictEqual(
        primaryLabels(html),
        expectedPrimaryLabels,
        `${name} uses the shared primary navigation order`,
    );
    assert.match(html, /class="nav-link nav-link-home(?: active)?"/, `${name} exposes the desktop home link`);
    assert.match(html, /class="nav-cta"[^>]*>ปรึกษาฟรี<\/a>/, `${name} keeps free consultation as the primary CTA`);
}

for (const name of ['home', 'about']) {
    assert.doesNotMatch(pages[name], /class="knowledge-subnav"/, `${name} has no knowledge subnavigation`);
}

for (const name of ['blog', 'post', 'videos']) {
    assert.match(pages[name], /<body class="has-knowledge-subnav">/, `${name} reserves space for the knowledge subnavigation`);
    assert.match(pages[name], /class="knowledge-subnav"/, `${name} contains the knowledge subnavigation`);
    assert.match(pages[name], />บทความ<\/a>[\s\S]*>วิดีโอ<\/a>/, `${name} orders article and video tabs consistently`);
}

assert.match(pages.blog, /class="knowledge-subnav-link active"[^>]*aria-current="page"[^>]*>บทความ<\/a>/, 'blog index marks articles active');
assert.match(pages.post, /class="knowledge-subnav-link active"[^>]*aria-current="page"[^>]*>บทความ<\/a>/, 'article page marks articles active');
assert.match(pages.videos, /class="knowledge-subnav-link active"[^>]*aria-current="page"[^>]*>วิดีโอ<\/a>/, 'videos page marks videos active');

const heroProfileLinks = pages.home.match(/class="hero-profile-link" href="about\.html"/g) || [];
assert.strictEqual(heroProfileLinks.length, 8, 'all eight homepage carousel images link to the About page');
assert.match(pages.home, /aria-label="รู้จักนักกายภาพเฟี้ยวและแนวทางการดูแล"/, 'homepage portrait link is accessible');

assert.match(pages.about, /ผมคือ กภ\.รัชธรรม เชื้อแถว/, 'About page introduces the owner in first person');
assert.match(pages.about, /จากประสบการณ์ทำงาน ผมพบว่า/, 'About story is told in first person');
assert.doesNotMatch(pages.about, /เขาพบว่า/, 'About story does not describe the owner in third person');
assert.doesNotMatch(pages.about, /ช่วยให้เขากลับไปใช้ชีวิต/, 'care philosophy addresses the patient without an impersonal pronoun');

console.log('PASS unified public navigation and first-person About voice');
