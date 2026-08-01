(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.WalkConfidencePersonalization = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function normalize(raw) {
    const source = raw || {};
    return {
      fallEvents: clamp(Math.floor(Number(source.fallEvents) || 0), 0, 99),
      chairReps: clamp(Math.floor(Number(source.chairReps) || 0), 0, 30),
      assistance: ['independent', 'supervision', 'physical_assist'].includes(source.assistance)
        ? source.assistance
        : 'supervision',
      canStand: source.canStand !== false,
      dizziness: Boolean(source.dizziness),
      kneePain: clamp(Number(source.kneePain) || 0, 0, 10),
      redFlag: Boolean(source.redFlag),
      modifiers: Array.isArray(source.modifiers) ? [...new Set(source.modifiers)] : [],
    };
  }

  function makeMedicalReview(input) {
    return {
      input,
      eligible: false,
      route: 'medical_review',
      level: 'medical_review_first',
      levelLabelTh: 'ควรให้แพทย์ประเมินก่อนเริ่มโปรแกรม',
      summaryTh: 'คำตอบมีสัญญาณที่ควรหยุดแผนฝึกและให้แพทย์ประเมินก่อน',
      sitToStand: null,
      weightShift: null,
      schedule: [],
      progressionTh: [],
      regressionTh: ['งดการฝึกและติดต่อทีมรักษาตามความเร่งด่วนของอาการ'],
      warningsTh: ['อย่าฝืนทดลองท่ายืนหรือเดินเพื่อเก็บคะแนนเพิ่ม'],
      ptAssessmentTh: [],
      ptPriority: 'medical_first',
    };
  }

  function makeAssistedRoute(input) {
    return {
      input,
      eligible: false,
      route: 'assisted_transfer_plan',
      level: 'assisted_care',
      levelLabelTh: 'ควรใช้แผนย้ายตัวและฝึกโดยมีผู้ช่วย',
      summaryTh: 'ระดับการช่วยเหลือตอนนี้ยังไม่เหมาะกับโปรแกรมยืนฝึกด้วยตัวเอง',
      sitToStand: null,
      weightShift: null,
      schedule: [],
      progressionTh: [],
      regressionTh: ['ไม่ควรทดลองยืนหรือเดินโดยไม่มีผู้ช่วยออกแรงที่ได้รับคำแนะนำ'],
      warningsTh: ['ให้ประเมินวิธีย้ายตัว อุปกรณ์ และกำลังของผู้ดูแลก่อน'],
      ptAssessmentTh: ['วิธีย้ายตัว', 'แรงที่ผู้ดูแลต้องใช้', 'อุปกรณ์และพื้นที่รอบเตียงหรือเก้าอี้'],
      ptPriority: 'recommended',
    };
  }

  function buildSitToStand(input) {
    if (input.dizziness) {
      return {
        frequency: 'รอประเมินอาการก่อน',
        intensity: 'งดท่ายืนชั่วคราว',
        time: 'ไม่กำหนด',
        type: 'งดท่าลุกยืนชั่วคราว',
        reps: 0,
        sets: 0,
        restSeconds: 'ไม่กำหนด',
        support: 'อยู่ในท่านั่งและมีผู้ดูแลใกล้ ๆ',
        substitutionReasonTh: 'มีอาการเวียนหัวเมื่อลุกยืน จึงไม่ควรใช้ท่ายืนเป็นแบบฝึกจนกว่าจะประเมินสาเหตุ',
      };
    }

    if (input.kneePain > 5) {
      return {
        frequency: '2-3 วัน/สัปดาห์',
        intensity: 'เบา ไม่ให้ปวดเพิ่ม',
        time: '5-8 ครั้ง 1-2 รอบ',
        type: 'เหยียดเข่าในท่านั่งชั่วคราว',
        reps: '5-8',
        sets: 1,
        restSeconds: '60-90',
        support: 'นั่งพิงพนัก เท้าวางมั่นคง',
        substitutionReasonTh: 'ปวดเข่ามากกว่า 5/10 จึงเปลี่ยนเป็นท่านั่งเพื่อลดแรงกดก่อนกลับไปฝึกลุกนั่ง',
      };
    }

    if (input.chairReps === 0) {
      return {
        frequency: '2 วัน/สัปดาห์',
        intensity: 'เบามาก 2-3/10',
        time: '1-3 ครั้ง 1 รอบ',
        type: 'ลุกนั่งจากเก้าอี้สูงโดยใช้มือช่วย',
        reps: '1-3',
        sets: 1,
        restSeconds: '90-120',
        support: 'ใช้มือช่วยและมีผู้ดูแลใกล้ ๆ',
        substitutionReasonTh: 'ผลทดสอบเป็น 0 จึงเริ่มจากเก้าอี้สูงและอนุญาตให้ใช้มือช่วยในแบบฝึก',
      };
    }

    const reps = clamp(Math.floor(input.chairReps * 0.5), 1, 8);
    const lowBand = input.chairReps <= 4;
    const midBand = input.chairReps <= 9;
    const sets = lowBand ? 1 : 2;
    const restSeconds = lowBand ? '90-120' : midBand ? '60-90' : '45-60';
    const support = input.assistance === 'independent'
      ? 'ใช้มือช่วยเฉพาะเมื่อจำเป็น'
      : 'มีผู้ดูแลใกล้ ๆ และใช้มือช่วยได้';

    return {
      frequency: '2-3 วัน/สัปดาห์',
      intensity: 'เบาถึงปานกลาง 3-5/10',
      time: `${reps} ครั้ง ${sets} รอบ`,
      type: 'ลุกนั่งจากเก้าอี้',
      reps,
      sets,
      restSeconds,
      support,
      substitutionReasonTh: '',
    };
  }

  function buildWeightShift(input) {
    if (input.dizziness) {
      return {
        frequency: 'รอประเมินอาการก่อน',
        intensity: 'เบาในท่านั่ง',
        time: '10 วินาที 1-2 รอบ',
        type: 'ถ่ายน้ำหนักลำตัวในท่านั่ง',
        seconds: '10',
        sets: 1,
        support: 'นั่งพิงพนักและมีผู้ดูแลใกล้ ๆ',
        canReduceSupport: false,
        substitutionReasonTh: 'มีอาการเวียนหัวเมื่อลุกยืน จึงเปลี่ยนเป็นการควบคุมลำตัวในท่านั่ง',
      };
    }

    if (input.fallEvents >= 2) {
      return {
        frequency: '3 วัน/สัปดาห์',
        intensity: 'เบา เน้นควบคุม ไม่เพิ่มความเร็ว',
        time: '10 วินาที 1-2 รอบ',
        type: 'ถ่ายน้ำหนักซ้าย-ขวาใกล้จุดจับ',
        seconds: '10',
        sets: 2,
        support: 'จับสองมือและมีผู้ดูแลใกล้ ๆ',
        canReduceSupport: false,
        substitutionReasonTh: '',
      };
    }

    if (input.fallEvents === 1) {
      return {
        frequency: '3-5 วัน/สัปดาห์',
        intensity: 'เบาถึงปานกลาง โดยยังจับสองมือ',
        time: '10-20 วินาที 2 รอบ',
        type: 'ถ่ายน้ำหนักซ้าย-ขวาใกล้จุดจับ',
        seconds: '10-20',
        sets: 2,
        support: 'จับสองมือและมีผู้ดูแลใกล้ ๆ',
        canReduceSupport: false,
        substitutionReasonTh: '',
      };
    }

    return {
      frequency: '3-5 วัน/สัปดาห์',
      intensity: 'เบาถึงปานกลาง คุมลำตัวตรง',
      time: '20-30 วินาที 2 รอบ',
      type: 'ถ่ายน้ำหนักซ้าย-ขวาใกล้จุดจับ',
      seconds: '20-30',
      sets: 2,
      support: input.assistance === 'independent'
        ? 'จับหนึ่งหรือสองมือตามความมั่นใจ'
        : 'จับสองมือและมีผู้ดูแลใกล้ ๆ',
      canReduceSupport: input.assistance === 'independent',
      substitutionReasonTh: '',
    };
  }

  function buildWarnings(input) {
    const warnings = [];
    if (input.modifiers.includes('osteoporosis')) {
      warnings.push('มีกระดูกพรุน จึงต้องให้ความสำคัญกับการป้องกันล้มและไม่ลดจุดจับเร็ว');
    }
    if (input.modifiers.includes('stroke')) {
      warnings.push('หลังโรคหลอดเลือดสมอง ให้สังเกตเข่าทรุด เท้าลาก และการลงน้ำหนักข้างอ่อนแรง');
    }
    if (input.modifiers.includes('diabetes_foot')) {
      warnings.push('มีเบาหวานหรือชาเท้า ให้ตรวจผิวหนัง รองเท้า และพื้นก่อนฝึกทุกครั้ง');
    }
    if (input.modifiers.includes('cardiac_bp')) {
      warnings.push('มีโรคหัวใจหรือความดันแกว่ง ให้ใช้ช่วงฝึกสั้นและพักมากขึ้น');
    }
    if (input.fallEvents >= 2) {
      warnings.push('มีเหตุล้มหรือเกือบล้มซ้ำ ไม่ควรลดการจับหรือเพิ่มความเร็วด้วยตัวเอง');
    }
    warnings.push('หยุดทันทีหากเจ็บหน้าอก หอบผิดปกติ หน้ามืด เข่าทรุด หรือเกือบล้ม');
    return warnings;
  }

  function buildSchedule(input) {
    const sitLabel = input.dizziness
      ? ''
      : input.kneePain > 5
        ? 'เหยียดเข่าในท่านั่ง'
        : 'ลุกนั่ง';
    const balanceLabel = input.dizziness ? 'ฝึกควบคุมลำตัวในท่านั่ง' : 'ฝึกถ่ายน้ำหนัก';
    const combinedLabel = sitLabel ? `${sitLabel} + ${balanceLabel}` : balanceLabel;
    const recoveryLabel = input.dizziness
      ? 'พักและบันทึกอาการเวียนหัว'
      : 'พักหรือเดินในกิจวัตรตามปกติ';
    const lightDayLabel = input.dizziness
      ? 'พักและทบทวนความปลอดภัย'
      : input.fallEvents >= 2
        ? 'ทบทวนจุดเสี่ยงในบ้าน'
        : 'ฝึกเบาหรือพักตามอาการ';
    return [
      { dayTh: 'จันทร์', activityTh: combinedLabel },
      { dayTh: 'อังคาร', activityTh: balanceLabel },
      { dayTh: 'พุธ', activityTh: recoveryLabel },
      { dayTh: 'พฤหัสบดี', activityTh: combinedLabel },
      { dayTh: 'ศุกร์', activityTh: balanceLabel },
      { dayTh: 'เสาร์', activityTh: lightDayLabel },
      { dayTh: 'อาทิตย์', activityTh: 'พักและบันทึกอาการ' },
    ];
  }

  function buildWalkConfidencePlan(raw) {
    const input = normalize(raw);

    if (input.redFlag) return makeMedicalReview(input);
    if (!input.canStand || input.assistance === 'physical_assist') return makeAssistedRoute(input);

    const sitToStand = buildSitToStand(input);
    const weightShift = buildWeightShift(input);
    const ptPriority = input.dizziness || input.fallEvents >= 2 ? 'recommended' : 'optional';
    const level = input.dizziness || input.fallEvents >= 1 || input.assistance === 'supervision'
      ? 'safety_first'
      : input.chairReps < 10
        ? 'build_strength'
        : 'build_confidence';
    const levelLabels = {
      safety_first: 'เน้นความปลอดภัยก่อนเพิ่มความยาก',
      build_strength: 'สร้างฐานแรงก่อนเพิ่มการทรงตัว',
      build_confidence: 'เพิ่มความมั่นใจและนำไปใช้จริง',
    };

    return {
      input,
      eligible: true,
      route: input.dizziness ? 'seated_only_review' : 'self_training',
      level,
      levelLabelTh: levelLabels[level],
      summaryTh: input.dizziness
        ? 'เริ่มจากท่านั่งและประเมินอาการเวียนหัวก่อนกลับไปฝึกยืน'
        : 'คงสองท่าหลักไว้และปรับจำนวน ระยะเวลา จุดจับ และผู้ดูแลตามคำตอบของคุณ',
      sitToStand,
      weightShift,
      schedule: buildSchedule(input),
      progressionTh: [
        'เมื่อทำครบตามแผน 2 ครั้งติดต่อกันโดยเหนื่อยไม่เกิน 4/10 และไม่มีอาการผิดปกติ ให้เพิ่มเพียงหนึ่งอย่าง',
        'เลือกเพิ่ม 1-2 ครั้ง หรือเพิ่ม 5-10 วินาที หรือลดการใช้มือช่วยหนึ่งระดับ',
      ],
      regressionTh: [
        'ถ้าเหนื่อยตั้งแต่ 7/10 ปวดเพิ่ม หน้ามืด เข่าทรุด หรือเกือบล้ม ให้หยุดรอบนั้น',
        'ครั้งถัดไปให้ลดจำนวน เพิ่มเวลาพัก เพิ่มความสูงเก้าอี้ หรือกลับมาใช้สองมือจับ',
      ],
      warningsTh: buildWarnings(input),
      ptAssessmentTh: [
        'รูปแบบการเดิน การเลี้ยว และการถ่ายน้ำหนัก',
        'ความเหมาะสมของอุปกรณ์ช่วยเดินและจุดจับในบ้าน',
        'สาเหตุของการล้มหรือเกือบล้มที่เกิดซ้ำ',
      ],
      ptPriority,
    };
  }

  return { buildWalkConfidencePlan };
});
