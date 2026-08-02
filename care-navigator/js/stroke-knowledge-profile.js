(function attachStrokeKnowledgeProfile(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.StrokeKnowledgeProfile = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createStrokeKnowledgeProfile() {
  const TYPES = ['ischemic', 'hemorrhagic', 'unknown'];
  const HEMISPHERES = ['left', 'right', 'bilateral', 'unknown'];
  const LESIONS = ['mca', 'aca', 'pca', 'brainstem', 'other', 'unknown'];

  const TYPE_COPY = {
    ischemic: {
      title: 'เส้นเลือดสมองตีบหรืออุดตัน',
      body: 'เลือดไปเลี้ยงสมองลดลงหรือหยุดชะงัก ทำให้สมองบางส่วนทำงานผิดปกติ การฟื้นฟูยังต้องยึดความสามารถและข้อควรระวังของแต่ละคนเป็นหลัก',
    },
    hemorrhagic: {
      title: 'เส้นเลือดสมองแตก',
      body: 'มีเลือดออกในหรือรอบสมอง การวางแผนฟื้นฟูต้องคำนึงถึงอาการปัจจุบัน ความคงที่ทางการแพทย์ และคำแนะนำจากทีมรักษา',
    },
    unknown: {
      title: 'ยังไม่ทราบประเภทของโรคหลอดเลือดสมอง',
      body: 'ยังเริ่มประเมินความสามารถและวางแผนเบื้องต้นได้ โดยไม่คาดเดาชนิดของโรคแทนข้อมูลจากโรงพยาบาล',
    },
  };

  const HEMISPHERE_COPY = {
    left: 'สมองซีกซ้าย',
    right: 'สมองซีกขวา',
    bilateral: 'สมองทั้งสองซีก',
    unknown: 'ยังไม่ทราบซีกสมอง',
  };

  const LESION_COPY = {
    mca: {
      title: 'บริเวณหลอดเลือดสมองส่วนกลาง (MCA)',
      body: 'อาจสัมพันธ์กับการควบคุมใบหน้า แขน ขา การรับรู้ หรือการสื่อสารแตกต่างกันตามขนาดและตำแหน่งรอยโรค',
    },
    aca: {
      title: 'บริเวณหลอดเลือดสมองส่วนหน้า (ACA)',
      body: 'อาจมีผลต่อการควบคุมขา การเริ่มเคลื่อนไหว และกิจกรรมที่ต้องใช้การวางแผนร่วมกัน',
    },
    pca: {
      title: 'บริเวณหลอดเลือดสมองส่วนหลัง (PCA)',
      body: 'อาจมีผลต่อการมองเห็น การรับรู้ หรือการประมวลผลข้อมูล แม้แรงแขนขาจะไม่ได้ลดลงเด่นทุกคน',
    },
    brainstem: {
      title: 'บริเวณก้านสมอง',
      body: 'อาจเกี่ยวข้องกับการทรงตัว การกลืน การเคลื่อนไหวตา การควบคุมแขนขา หรือการหายใจ จึงควรยึดคำแนะนำจากทีมรักษาอย่างใกล้ชิด',
    },
    other: {
      title: 'ตำแหน่งอื่นตามที่แพทย์แจ้ง',
      body: 'ใช้ตำแหน่งจากใบสรุปการรักษาเพื่ออธิบายโรค แต่เลือกโปรแกรมจากความสามารถที่ทำได้จริงและความปลอดภัย',
    },
    unknown: {
      title: 'ยังไม่ทราบตำแหน่งรอยโรค',
      body: 'สามารถตรวจสอบได้จากใบสรุปการรักษาหรือสอบถามทีมโรงพยาบาล ระบบจะไม่คาดเดาตำแหน่งจากอาการเพียงอย่างเดียว',
    },
  };

  function assertAllowed(value, allowed, field) {
    if (!allowed.includes(value)) {
      throw new Error(`ข้อมูล Stroke ไม่ถูกต้อง: ${field}`);
    }
  }

  function lesionSprite(hemisphere, lesion) {
    if (lesion === 'unknown') return 'lesion-unknown';
    if (lesion === 'brainstem') return 'lesion-brainstem';
    if (hemisphere === 'unknown') return 'lesion-unknown';
    if (hemisphere === 'bilateral' || lesion === 'other') return 'lesion-bilateral-other';
    return `lesion-${hemisphere}-${lesion}`;
  }

  function buildStrokeKnowledgeProfile(input = {}) {
    const type = input.type || 'unknown';
    const hemisphere = input.hemisphere || 'unknown';
    const lesion = input.lesion || 'unknown';

    assertAllowed(type, TYPES, 'type');
    assertAllowed(hemisphere, HEMISPHERES, 'hemisphere');
    assertAllowed(lesion, LESIONS, 'lesion');

    const typeCopy = TYPE_COPY[type];
    const lesionCopy = LESION_COPY[lesion];
    const lesionTitleTh = lesion === 'brainstem'
      ? lesionCopy.title
      : `${HEMISPHERE_COPY[hemisphere]} · ${lesionCopy.title}`;

    return {
      type,
      hemisphere,
      lesion,
      typeTitleTh: typeCopy.title,
      typeBodyTh: typeCopy.body,
      lesionTitleTh,
      lesionBodyTh: lesionCopy.body,
      typeSprite: `type-${type}`,
      lesionSprite: lesionSprite(hemisphere, lesion),
      isComplete: type !== 'unknown' && hemisphere !== 'unknown' && lesion !== 'unknown',
    };
  }

  return {
    TYPES,
    HEMISPHERES,
    LESIONS,
    buildStrokeKnowledgeProfile,
  };
}));
