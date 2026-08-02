(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BedboundTransferPersonalization = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const ROLLING = new Set(['independent', 'supervision', 'one_person_help', 'two_person_help', 'unable']);
  const SITTING = new Set(['independent', 'supervision', 'supported', 'unable']);
  const TRANSFER = new Set(['independent', 'supervision', 'one_person_help', 'two_person_help', 'unable']);
  const SKIN = new Set(['none', 'persistent_redness', 'open_or_infected']);
  const CAREGIVER = new Set(['available', 'limited', 'none']);

  function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, Math.round(number)));
  }

  function normalize(raw = {}) {
    return {
      redFlags: Array.isArray(raw.redFlags)
        ? raw.redFlags.filter((item) => typeof item === 'string').slice(0, 10)
        : [],
      barthelComplete: raw.barthelComplete === true,
      barthelTotal: clampNumber(raw.barthelTotal, 0, 20),
      rolling: ROLLING.has(raw.rolling) ? raw.rolling : 'one_person_help',
      edgeSitting: SITTING.has(raw.edgeSitting) ? raw.edgeSitting : 'supported',
      transfer: TRANSFER.has(raw.transfer) ? raw.transfer : 'one_person_help',
      sittingSeconds: clampNumber(raw.sittingSeconds, 0, 600),
      skinConcern: SKIN.has(raw.skinConcern) ? raw.skinConcern : 'none',
      caregiver: CAREGIVER.has(raw.caregiver) ? raw.caregiver : 'limited',
    };
  }

  const demoKeys = {
    assisted_limb_movement: 'assisted-limb-movement',
    ankle_pump: 'ankle-pump',
    rolling_sequence: 'rolling-sequence',
    bridge_preparation: 'bridge-preparation',
    supported_edge_sitting: 'supported-edge-sitting',
    sitting_weight_shift: 'sitting-weight-shift',
    sit_to_stand_preparation: 'sit-to-stand-preparation',
    bed_to_chair_transfer: 'bed-to-chair-transfer',
  };

  function activity(id, titleTh, purposeTh, fitt) {
    return { id, titleTh, purposeTh, fitt, demoKey: demoKeys[id] };
  }

  function foundationActivities(input) {
    const limbActivity = input.rolling === 'unable' || input.rolling === 'two_person_help'
      ? activity('assisted_limb_movement', 'ขยับแขนขาโดยมีผู้ดูแลช่วย', 'คงช่วงการเคลื่อนไหวและกระตุ้นให้ผู้ป่วยมีส่วนร่วมเท่าที่ทำได้', {
        frequencyTh: 'วันละ 2–3 รอบ', intensityTh: 'ช่วยเฉพาะส่วนที่ขยับเองไม่ได้', timeTh: 'ข้อละ 5–8 ครั้ง', typeTh: 'ท่านอน จังหวะช้า ไม่ฝืนเจ็บ',
      })
      : activity('ankle_pump', 'กระดกข้อเท้าสลับขึ้นลง', 'กระตุ้นการเคลื่อนไหวระหว่างช่วงที่ยังอยู่บนเตียงมาก', {
        frequencyTh: 'ทุก 2–3 ชั่วโมงขณะตื่น', intensityTh: 'ขยับเต็มช่วงที่ไม่เจ็บ', timeTh: '10–20 ครั้ง', typeTh: 'ท่านอนหรือนั่งพิง',
      });
    const rolling = activity('rolling_sequence', 'ฝึกพลิกตัวแบบแบ่งเป็นจังหวะ', 'ใช้สายตา แขน ขา และลำตัวช่วยกัน เพื่อลดแรงที่ผู้ดูแลต้องยก', {
      frequencyTh: 'วันละ 2 รอบ', intensityTh: 'ผู้ดูแลช่วยเท่าที่จำเป็น', timeTh: 'ข้างละ 3–5 ครั้ง', typeTh: 'เตียงมั่นคงและมีพื้นที่ปลอดภัย',
    });
    const list = [limbActivity, rolling];
    if (input.rolling !== 'unable') {
      list.push(activity('bridge_preparation', 'เตรียมยกสะโพกบนเตียง', 'ฝึกแรงขาและลำตัวเพื่อช่วยจัดเสื้อผ้า พลิกตัว และเตรียมย้ายตัว', {
        frequencyTh: 'วันละ 1 รอบ', intensityTh: 'ยกเพียงเล็กน้อยและไม่กลั้นหายใจ', timeTh: '3–5 ครั้ง', typeTh: 'งอเข่า เท้าวางมั่นคง มีผู้ดูแลใกล้ ๆ',
      }));
    }
    return list.slice(0, 4);
  }

  function sittingActivities(input) {
    return [
      activity('rolling_sequence', 'พลิกตะแคงเพื่อเตรียมลุกนั่ง', 'เปลี่ยนจากท่านอนเป็นท่าตะแคงก่อนดันตัวขึ้น ลดการดึงแขนผู้ดูแล', {
        frequencyTh: 'ก่อนลุกนั่งทุกครั้ง', intensityTh: 'ทำช้าและหยุดหากเวียนหัว', timeTh: 'ข้างละ 3 ครั้ง', typeTh: 'ผู้ดูแลคุมลำตัวและขา',
      }),
      activity('supported_edge_sitting', 'ฝึกนั่งขอบเตียงโดยมีจุดพยุง', 'เพิ่มความทนทานของลำตัวและเตรียมระบบไหลเวียนก่อนย้ายตัว', {
        frequencyTh: 'วันละ 1–2 รอบ', intensityTh: 'นั่งในระดับที่ยังคุมศีรษะและลำตัวได้', timeTh: input.sittingSeconds < 60 ? '20–40 วินาที x 2 รอบ' : '1–3 นาที x 2 รอบ', typeTh: 'เท้าแตะพื้น ผู้ดูแลอยู่ด้านที่เอน',
      }),
      activity('sitting_weight_shift', 'ถ่ายน้ำหนักซ้ายขวาในท่านั่ง', 'เตรียมการขยับก้นและควบคุมลำตัวก่อนย้ายไปเก้าอี้', {
        frequencyTh: 'วันละ 1 รอบ', intensityTh: 'ช่วงสั้นและมีมือพยุง', timeTh: 'ข้างละ 5 ครั้ง', typeTh: 'นั่งขอบเตียงหรือเก้าอี้ที่มั่นคง',
      }),
    ];
  }

  function transferActivities(input) {
    const repetitions = input.barthelTotal >= 12 ? '5–8 ครั้ง' : '3–5 ครั้ง';
    return [
      activity('rolling_sequence', 'พลิกตะแคงและลุกขึ้นนั่งเป็นลำดับ', 'ทำให้การลุกจากเตียงใช้แรงผู้ดูแลน้อยลงและคาดเดาได้', {
        frequencyTh: 'ก่อนลุกจากเตียงทุกครั้ง', intensityTh: 'ช่วยเฉพาะช่วงที่ติดขัด', timeTh: '2–4 เที่ยว', typeTh: 'ใช้เตียงและจุดจับเดิมทุกครั้ง',
      }),
      activity('sitting_weight_shift', 'ขยับน้ำหนักและก้นในท่านั่ง', 'ฝึกการเตรียมเท้าและลำตัวก่อนยืนหรือย้ายไปเก้าอี้', {
        frequencyTh: 'วันละ 1–2 รอบ', intensityTh: 'คุมลำตัวได้ ไม่เกือบล้ม', timeTh: 'ข้างละ 5–8 ครั้ง', typeTh: 'ผู้ดูแลเฝ้าด้านที่อ่อนแรง',
      }),
      activity('sit_to_stand_preparation', 'ฝึกเตรียมลุกยืนจากขอบเตียงหรือเก้าอี้', 'เพิ่มแรงขาและลำดับการโน้มตัวก่อนย้ายตัว', {
        frequencyTh: 'วันละ 1 รอบ', intensityTh: 'มีคนช่วยหนึ่งคนและมีจุดจับมั่นคง', timeTh: repetitions, typeTh: 'ปรับความสูงที่นั่งให้เหมาะ',
      }),
      activity('bed_to_chair_transfer', 'ฝึกย้ายจากเตียงไปเก้าอี้', 'นำแรงและการทรงตัวไปใช้กับกิจกรรมจริง ลดเวลาที่อยู่บนเตียงต่อเนื่อง', {
        frequencyTh: 'วันละ 1–2 เที่ยว', intensityTh: 'ใช้ระดับช่วยเดิมจนทำได้ปลอดภัยสม่ำเสมอ', timeTh: '1–3 ครั้งต่อเที่ยว', typeTh: 'เก้าอี้ล็อกมั่นคงและทางย้ายโล่ง',
      }),
    ];
  }

  function blocked(input, route, summaryTh) {
    return {
      input, eligible: false, route, levelLabelTh: '', summaryTh, activities: [], schedule: [],
      progressionTh: [], warningsTh: [], ptAssessmentTh: [], ptPriority: 'medical_first',
    };
  }

  function scheduleFor(route) {
    const main = route === 'bed_foundation'
      ? 'ขยับแขนขา + พลิกตัว'
      : route === 'sitting_foundation'
        ? 'พลิกตะแคง + ฝึกนั่งขอบเตียง'
        : 'ลุกนั่ง + ฝึกย้ายเตียงไปเก้าอี้';
    const light = route === 'bed_foundation' ? 'จัดท่าและตรวจผิวหนัง' : 'ทบทวนท่านั่งและพัก';
    return ['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์','อาทิตย์'].map((dayTh, index) => ({
      dayTh,
      activityTh: index === 2 || index === 5 ? light : index === 6 ? 'พักและสรุปความเปลี่ยนแปลง' : main,
    }));
  }

  function buildBedboundTransferPlan(raw) {
    const input = normalize(raw);
    if (input.redFlags.length || input.skinConcern === 'open_or_infected') {
      return blocked(input, 'medical_review_first', 'มีข้อมูลที่ควรให้แพทย์หรือทีมสุขภาพประเมินก่อน จึงยังไม่สร้างโปรแกรมฝึกจากข้อมูลชุดนี้');
    }
    if (!input.barthelComplete) {
      return blocked(input, 'assessment_incomplete', 'ตอบ Barthel Index ให้ครบก่อน เพื่อให้ระบบเห็นระดับการช่วยเหลือตัวเองโดยรวม');
    }

    const bedFoundation = input.edgeSitting === 'unable'
      || input.transfer === 'unable'
      || input.rolling === 'two_person_help'
      || input.rolling === 'unable';
    const sittingFoundation = !bedFoundation && (
      input.edgeSitting === 'supported'
      || input.transfer === 'two_person_help'
      || input.sittingSeconds < 60
    );
    const route = bedFoundation ? 'bed_foundation' : sittingFoundation ? 'sitting_foundation' : 'transfer_rebuild';
    const activities = route === 'bed_foundation'
      ? foundationActivities(input)
      : route === 'sitting_foundation'
        ? sittingActivities(input)
        : transferActivities(input);
    const levelLabels = {
      bed_foundation: 'เริ่มจากการขยับบนเตียงและป้องกันการถดถอย',
      sitting_foundation: 'สร้างพื้นฐานการนั่งก่อนย้ายตัว',
      transfer_rebuild: 'ฝึกย้ายตัวเพื่อกลับไปทำกิจวัตรนอกเตียง',
    };
    const warningsTh = ['หยุดฝึกหากเจ็บหน้าอก หอบมาก หน้ามืดจะเป็นลม มีอาการทางระบบประสาทใหม่ หรืออาการทรุดลงเร็ว'];
    if (input.skinConcern === 'persistent_redness') warningsTh.unshift('มีรอยแดงกดแล้วไม่จาง ควรลดแรงกดบริเวณนั้นและให้บุคลากรสุขภาพประเมินผิวหนัง');
    if (input.caregiver !== 'available') warningsTh.unshift('ผู้ดูแลมีจำกัด ไม่ควรทดลองย้ายตัวที่ต้องออกแรงมากหรือทำคนเดียว');
    const ptPriority = input.caregiver !== 'available'
      || input.transfer === 'two_person_help'
      || input.rolling === 'two_person_help'
      || input.skinConcern !== 'none'
      ? 'strongly_recommended'
      : route === 'transfer_rebuild' ? 'recommended' : 'strongly_recommended';

    return {
      input,
      eligible: true,
      route,
      levelLabelTh: levelLabels[route],
      summaryTh: route === 'bed_foundation'
        ? 'เริ่มจากสิ่งที่ทำบนเตียงได้จริง ก่อนเร่งไปท่านั่งหรือยืนที่ยังไม่ปลอดภัย'
        : route === 'sitting_foundation'
          ? 'เพิ่มเวลานั่งและการควบคุมลำตัวก่อนฝึกย้ายตัวเต็มรูปแบบ'
          : 'ใช้ท่าหลักเดิม แล้วปรับระดับช่วย จำนวนครั้ง และสภาพแวดล้อมให้ย้ายตัวได้ปลอดภัยขึ้น',
      activities: activities.slice(0, 4),
      schedule: scheduleFor(route),
      progressionTh: [
        'เพิ่มครั้งละหนึ่งอย่าง เช่น เพิ่มเวลานั่ง 15–30 วินาที หรือลดแรงช่วยเพียงเล็กน้อย',
        'เพิ่มเมื่อทำได้สองรอบติดต่อกันโดยไม่เวียนหัว ไม่เกือบล้ม และอาการปวดหรือรอยแดงไม่เพิ่ม',
      ],
      warningsTh,
      ptAssessmentTh: [
        'แรงและการควบคุมลำตัว การพลิกตัว การนั่งขอบเตียง และความพร้อมในการย้ายตัว',
        'ข้อยึดติด ตำแหน่งรับแรงกด อุปกรณ์ เตียง เก้าอี้ และพื้นที่ย้ายตัวจริงในบ้าน',
        'วิธีช่วยของผู้ดูแลเพื่อลดการดึงแขน ยกผิดท่า และภาระที่เกินกำลัง',
      ],
      ptPriority,
    };
  }

  return { buildBedboundTransferPlan };
});
