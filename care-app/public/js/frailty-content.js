(function attachFrailtyContent(global) {
  'use strict'

  const baseUrl = 'https://baankaiyaphap-chonburi.com/blog/post.html?slug='
  const articles = Object.freeze({
    definition: Object.freeze({
      slug: 'frailty-in-older-adults',
      titleTh: 'ภาวะเปราะบางในผู้สูงอายุคืออะไร',
      url: `${baseUrl}frailty-in-older-adults`,
      linkLabelTh: 'อ่านว่าภาวะเปราะบางต่างจากความแก่ทั่วไปอย่างไร',
    }),
    assessment: Object.freeze({
      slug: 'frailty-assessment',
      titleTh: 'ประเมินภาวะเปราะบางอย่างไร',
      url: `${baseUrl}frailty-assessment`,
      linkLabelTh: 'เข้าใจว่าแบบประเมินแต่ละอย่างช่วยวางแผนอย่างไร',
    }),
    recovery: Object.freeze({
      slug: 'frailty-recovery-potential',
      titleTh: 'ผู้สูงอายุเปราะบางยังฟื้นตัวได้ไหม',
      url: `${baseUrl}frailty-recovery-potential`,
      linkLabelTh: 'อ่านปัจจัยที่ใช้พิจารณาโอกาสฟื้นตัว',
    }),
    care: Object.freeze({
      slug: 'frailty-care-and-physical-therapy',
      titleTh: 'ดูแลและฟื้นฟูผู้สูงอายุเปราะบางอย่างไร',
      url: `${baseUrl}frailty-care-and-physical-therapy`,
      linkLabelTh: 'ดูว่าอะไรทำเองได้และเมื่อไรควรใช้กายภาพ',
    }),
  })

  global.FrailtyContent = Object.freeze({
    articles,
    getArticle(key) {
      const article = articles[key]
      if (!article) {
        throw new Error(`Unknown frailty article: ${key}`)
      }
      return article
    },
  })
})(window)
