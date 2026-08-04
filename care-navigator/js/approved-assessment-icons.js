(function attachApprovedAssessmentIcons(root, factory) {
  const api = factory()
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  if (root) root.ApprovedAssessmentIcons = api
  if (root && root.document) {
    const start = () => api.applyApprovedIcons(root.document, root.location?.pathname || '')
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, { once: true })
    else start()
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function createApi() {
  const PLAN_ICON_MAP = {
    'team4-walk-confidence-mockup.html': [
      { id: 'P01-I01', label: 'อ่านเรื่องการประเมินภาวะเปราะบาง', icon: 'plan12 b1', mode: 'knowledge' },
      { id: 'P01-I02', label: 'ล้มหรือเกือบล้มในช่วง 30 วัน', icon: 'plan12 b2', mode: 'self' },
      { id: 'P01-I03', label: 'รูปแบบการเดินและการถ่ายน้ำหนัก', icon: 'plan12 b3', mode: 'pt' },
      { id: 'P01-I04', label: 'นับจำนวนลุกนั่งใน 30 วินาที', icon: 'movement m2', mode: 'self' },
      { id: 'P01-I05', label: 'อุปกรณ์ช่วยเดินและจุดเสี่ยงในบ้าน', icon: 'plan12 b4', mode: 'pt' },
    ],
    'team4-return-strength-mockup.html': [
      { id: 'P02-I01', label: 'เดินต่อเนื่อง 2 นาที', icon: 'movement m1', mode: 'self' },
      { id: 'P02-I02', label: 'การตอบสนองของร่างกายขณะออกแรง', icon: 'plan12 b5', mode: 'pt' },
      { id: 'P02-I03', label: 'ลุกยืนจากเก้าอี้ใน 30 วินาที', icon: 'movement m2', mode: 'self' },
      { id: 'P02-I04', label: 'แรงเชิงหน้าที่และรูปแบบการชดเชย', icon: 'plan12 b6', mode: 'pt' },
      { id: 'P02-I05', label: 'โรคประจำตัว ยา และระดับการเพิ่มกิจกรรม', icon: 'plan12 b7', mode: 'pt' },
    ],
    'team4-stroke-arm-leg-mockup.html': [
      { id: 'P03-I01', label: 'อ่านเรื่องโรคหลอดเลือดสมองฉบับเต็ม', icon: 'stroke s1', mode: 'knowledge' },
      { id: 'P03-I02', label: 'Barthel Index ฉบับ 0–20', icon: 'stroke s2', mode: 'self' },
      { id: 'P03-I03', label: 'ระดับการช่วยเดิน FAC 0–5', icon: 'stroke s3', mode: 'self' },
      { id: 'P03-I04', label: 'ระดับการใช้แขนข้างอ่อนแรง 0–5', icon: 'anatomy a1', mode: 'self' },
    ],
    'team4-hip-recovery-mockup.html': [
      { id: 'P04-I01', label: 'ตรวจข้อมูลการรักษาด้วยตัวเอง', icon: 'plan45 c1', mode: 'self' },
      { id: 'P04-I02', label: 'ตรวจความสอดคล้องของแผล อาการ และการเคลื่อนไหวกับคำสั่งแพทย์', icon: 'plan45 c2', mode: 'pt' },
      { id: 'P04-I03', label: 'ประเมินความช่วยเหลือที่ต้องใช้', icon: 'plan45 c3', mode: 'self' },
      { id: 'P04-I04', label: 'เทคนิคย้ายตัว กำลังขา และคุณภาพการรับน้ำหนักจริง', icon: 'movement m3', mode: 'pt' },
      { id: 'P04-I05', label: 'บันทึกการเดินที่ทำได้จริง', icon: 'plan45 c4', mode: 'self' },
      { id: 'P04-I06', label: 'ความสูง walker ลำดับก้าว การเลี้ยว และทางเดินในบ้าน', icon: 'movement m4', mode: 'pt' },
    ],
    'team4-knee-recovery-mockup.html': [
      { id: 'P05-I01', label: 'บันทึกอาการด้วยตัวเอง', icon: 'anatomy a2', mode: 'self' },
      { id: 'P05-I02', label: 'แยกอาการบวมตามระยะฟื้นตัวจากภาวะแทรกซ้อน', icon: 'anatomy a3', mode: 'pt' },
      { id: 'P05-I03', label: 'บันทึกช่วงการเคลื่อนไหว', icon: 'plan45 c5', mode: 'self' },
      { id: 'P05-I04', label: 'วัดมุมด้วยเครื่องมือ ตรวจคุณภาพการเคลื่อนไหว', icon: 'anatomy a4', mode: 'pt' },
      { id: 'P05-I05', label: 'บันทึกการลุกและเดิน', icon: 'movement m5', mode: 'self' },
      { id: 'P05-I06', label: 'แรงขา เทคนิคการลุกยืน การลงน้ำหนักจริง', icon: 'movement m6', mode: 'pt' },
    ],
    'team4-parkinson-mobility-mockup.html': [
      { id: 'P06-I01', label: 'ช่วงที่ยาออกฤทธิ์และเคลื่อนไหวได้ดี', icon: 'parkinson p1', mode: 'self' },
      { id: 'P06-I02', label: 'ขนาดและความเร็วของการเคลื่อนไหว', icon: 'parkinson p2', mode: 'pt' },
      { id: 'P06-I03', label: 'จำนวนครั้งและสถานการณ์ที่เท้าติด', icon: 'parkinson p3', mode: 'self' },
      { id: 'P06-I04', label: 'cue แบบใดช่วยได้จริง', icon: 'parkinson p4', mode: 'pt' },
      { id: 'P06-I05', label: 'การลุกยืน การเดิน และเหตุเกือบล้ม', icon: 'parkinson p5', mode: 'self' },
      { id: 'P06-I06', label: 'การทรงตัว ความดัน และสภาพแวดล้อม', icon: 'finals f1', mode: 'pt' },
    ],
    'team4-bedbound-transfer-mockup.html': [
      { id: 'P07-I01', label: 'บันทึกระดับการพลิกตัว', icon: 'finals f2', mode: 'self' },
      { id: 'P07-I02', label: 'แรงลำตัว ข้อยึดติด การจัดท่า จุดรับแรงกด', icon: 'finals f3', mode: 'pt' },
      { id: 'P07-I03', label: 'จับเวลานั่งขอบเตียง', icon: 'movement m7', mode: 'self' },
      { id: 'P07-I04', label: 'การทรงตัวในท่านั่ง ความดันเมื่อลุกเปลี่ยนท่า', icon: 'finals f4', mode: 'pt' },
      { id: 'P07-I05', label: 'บันทึกระดับการย้ายตัว', icon: 'movement m3', mode: 'self' },
      { id: 'P07-I06', label: 'เทคนิคย้ายตัว อุปกรณ์ ความสูงเตียงและเก้าอี้', icon: 'finals f5', mode: 'pt' },
    ],
  }

  const LABEL_SELECTORS = [
    'strong',
    'b',
    'a',
    'h3',
    'h4',
    '.pt-block > span:last-child',
    '.pt-strip > span:last-child',
    '.locked-card > span:nth-child(2)',
  ].join(', ')
  const CONTAINER_SELECTORS = [
    '.summary',
    '.condition-article-link',
    'button',
    'a',
    '.locked-card',
    '.pt-block',
    '.pt-strip',
    '.assessment-toggle',
    '.self-card',
    '.knowledge-article-link',
  ].join(', ')
  const OLD_ICON_SELECTORS = [
    ':scope > .icon',
    ':scope > .ico',
    ':scope > [data-assessment-icon]',
    ':scope > .condition-article-icon',
    ':scope > .assess-icon',
    ':scope > .assessment-icon',
    ':scope > .warning-icon',
    ':scope > .warn-icon',
  ].join(', ')

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('th')
  }

  function fileNameFromPath(pathname) {
    return String(pathname || '').split(/[\\/]/).filter(Boolean).pop() || ''
  }

  function findLabelElement(doc, label) {
    const needle = normalizeText(label)
    const elements = Array.from(doc.querySelectorAll(LABEL_SELECTORS))
    return elements.find((element) => normalizeText(element.textContent) === needle)
      || elements.find((element) => normalizeText(element.textContent).includes(needle))
      || null
  }

  function buildIcon(doc, item) {
    const icon = doc.createElement('span')
    icon.className = `approved-assessment-icon ${item.icon}`
    icon.dataset.approvedIconId = item.id
    icon.setAttribute('aria-hidden', 'true')
    return icon
  }

  function attachIcon(doc, item) {
    const labelElement = findLabelElement(doc, item.label)
    if (!labelElement) return false

    const container = labelElement.closest(CONTAINER_SELECTORS) || labelElement.parentElement
    if (!container) return false
    if (container.querySelector(`[data-approved-icon-id="${item.id}"]`)) return true

    const icon = buildIcon(doc, item)
    const oldIcon = container.querySelector(OLD_ICON_SELECTORS)
    if (oldIcon) oldIcon.replaceWith(icon)
    else container.prepend(icon)

    container.classList.add('approved-icon-card', `approved-icon-card--${item.mode}`)
    container.dataset.approvedIconId = item.id
    return true
  }

  function applyApprovedIcons(doc, pathname) {
    const fileName = fileNameFromPath(pathname) || fileNameFromPath(doc?.location?.pathname)
    const items = PLAN_ICON_MAP[fileName] || []
    const attached = items.filter((item) => attachIcon(doc, item)).map((item) => item.id)
    doc?.documentElement?.setAttribute?.('data-approved-icons', `${attached.length}/${items.length}`)
    return { fileName, attached, missing: items.filter((item) => !attached.includes(item.id)).map((item) => item.id) }
  }

  return { PLAN_ICON_MAP, applyApprovedIcons, normalizeText, fileNameFromPath }
})
