(function attachStrokeArmLegPersonalization(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.StrokeArmLegPersonalization = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStrokeArmLegPersonalization() {
  const LEVEL_LABELS = {
    level_bed: 'ระดับเตรียมพร้อม · ฟื้นการขยับบนเตียงก่อนยืน',
    level_a: 'ระดับ A · วางรากฐานโดยมีผู้ช่วย',
    level_b: 'ระดับ B · เชื่อมการเคลื่อนไหวให้ใช้ได้จริง',
    level_c: 'ระดับ C · เพิ่มคุณภาพและกลับสู่กิจวัตรจริง',
  };

  function toNumber(value) {
    if (value === '' || value === null || typeof value === 'undefined') return Number.NaN;
    return Number(value);
  }

  function normalize(rawInput) {
    const source = rawInput || {};
    const input = {
      barthelTotal: toNumber(source.barthelTotal),
      transferLevel: toNumber(source.transferLevel),
      facLevel: toNumber(source.facLevel),
      armUseLevel: toNumber(source.armUseLevel),
      redFlag: source.redFlag === true,
      modifiers: Array.isArray(source.modifiers)
        ? [...new Set(source.modifiers.filter((value) => typeof value === 'string'))]
        : [],
    };
    const errors = [];
    if (!Number.isInteger(input.barthelTotal) || input.barthelTotal < 0 || input.barthelTotal > 20) {
      errors.push('คะแนน Barthel Index ต้องเป็นจำนวนเต็มระหว่าง 0-20');
    }
    if (!Number.isInteger(input.transferLevel) || input.transferLevel < 0 || input.transferLevel > 3) {
      errors.push('คะแนนการย้ายตัวต้องเป็นจำนวนเต็มระหว่าง 0-3');
    }
    if (!Number.isInteger(input.facLevel) || input.facLevel < 0 || input.facLevel > 5) {
      errors.push('ระดับการเดิน FAC ต้องเป็นจำนวนเต็มระหว่าง 0-5');
    }
    if (!Number.isInteger(input.armUseLevel) || input.armUseLevel < 0 || input.armUseLevel > 5) {
      errors.push('ระดับการใช้แขนต้องเป็นจำนวนเต็มระหว่าง 0-5');
    }
    input.validationErrorsTh = errors;
    return input;
  }

  function routeFor(input) {
    if (input.redFlag) return 'medical_review';
    if (input.validationErrorsTh.length) return 'invalid_input';
    if (input.transferLevel === 0) return 'assisted_rehab';
    return 'personal_plan';
  }

  function rankBarthel(score) {
    if (score <= 8) return 1;
    if (score <= 14) return 2;
    return 3;
  }

  function rankFac(score) {
    if (score <= 1) return 1;
    if (score <= 3) return 2;
    return 3;
  }

  function rankArm(score) {
    if (score <= 1) return 1;
    if (score <= 3) return 2;
    return 3;
  }

  function chooseLevel(input) {
    if (input.facLevel === 0) return 'level_bed';
    const lowest = Math.min(
      rankBarthel(input.barthelTotal),
      rankFac(input.facLevel),
      rankArm(input.armUseLevel),
    );
    return lowest === 1 ? 'level_a' : lowest === 2 ? 'level_b' : 'level_c';
  }

  function activity(id, titleTh, purposeTh, frequency, intensity, time, type, safetyTh, demoKey) {
    return {
      id,
      titleTh,
      purposeTh,
      fitt: { frequency, intensity, time, type },
      safetyTh,
      demoKey,
    };
  }

  function buildActivities(levelId, input) {
    const deviceNote = input.modifiers.includes('walking_aid')
      ? ' ใช้อุปกรณ์เดิมต่อไปจนกว่านักกายภาพจะปรับให้'
      : '';

    if (levelId === 'level_bed') {
      return [
        activity(
          'partial_bridge_assisted',
          'ฝึกยกสะโพกเล็กน้อยบนเตียงแบบมีผู้ดูแล',
          'เตรียมแรงสะโพกและลำตัวสำหรับการพลิกตัว จัดเสื้อผ้า และขยับบนเตียงก่อนฝึกยืน',
          'วันละ 1-2 ช่วง 5-6 วันต่อสัปดาห์',
          'ยกเพียงเล็กน้อยในระดับที่หายใจปกติและไม่เจ็บ',
          '3-5 ครั้งต่อรอบ 1-2 รอบ พัก 60-90 วินาที',
          'นอนหงาย งอเข่า วางเท้ามั่นคง ผู้ดูแลช่วยประคองเข่าหรือเชิงกรานเท่าที่จำเป็น',
          'งดท่านี้หากมีข้อห้ามหลังผ่าตัดสะโพกหรือกระดูกสันหลัง ปวดหลังหรือสะโพกเพิ่ม หรือผู้ดูแลต้องยกตัวแทนมาก',
          'partial-bridge',
        ),
        activity(
          'arm_table_slide',
          'เลื่อนแขนข้างอ่อนแรงบนโต๊ะ',
          'ให้แขนร่วมกิจกรรมในท่านั่งที่มีพนักหรือผู้ดูแลประคอง โดยไม่ฝืนยกเหนือศีรษะ',
          'วันละ 1-2 ช่วง 5-7 วันต่อสัปดาห์',
          'เคลื่อนไหวสบาย ไม่ฝืนเจ็บและไม่ยกไหล่ชดเชย',
          '5-8 ครั้งต่อทิศทาง 1-2 รอบ',
          'วางแขนบนผ้าหรือพื้นลื่น ผสานมือได้เพื่อเลื่อนไปข้างหน้าในระดับต่ำกว่าไหล่',
          'ประคองข้อศอกและสะบัก ห้ามดึงแขนหรือฝืนยกสูง หยุดเมื่อปวดไหล่เพิ่ม',
          'arm-slide',
        ),
        activity(
          'supported_sitting_trunk',
          'ฝึกลำตัวในท่านั่งแบบมีคนเฝ้า',
          'เพิ่มความมั่นคงของลำตัวสำหรับการกินอาหาร แต่งตัว และเตรียมย้ายตัว',
          'วันละ 1-2 ช่วง 5-6 วันต่อสัปดาห์',
          'ขยับระยะสั้นและกลับกึ่งกลางได้โดยไม่เกือบล้ม',
          'เอื้อมหรือถ่ายน้ำหนัก 3-5 ครั้งต่อทิศทาง 1-2 รอบ',
          'นั่งบนเตียงหรือเก้าอี้ที่มั่นคง มีพนักหรือผู้ดูแลอยู่ด้านอ่อนแรง',
          'ไม่ฝึกคนเดียว หยุดเมื่อศีรษะหรือลำตัวตกมาก หน้ามืด หรือผู้ดูแลต้องยกพยุงต่อเนื่อง',
          'supported-sitting',
        ),
        activity(
          'assisted_bed_rolling',
          'ฝึกพลิกตัวบนเตียงเป็นลำดับ',
          'ลดภาระผู้ดูแลและเชื่อมการมอง หมุนลำตัว และดันตัวไปสู่การเปลี่ยนท่า',
          'วันละ 1-2 ช่วง 5-7 วันต่อสัปดาห์',
          'ช่วยเท่าที่จำเป็นและให้ผู้ป่วยออกแรงร่วมทุกครั้ง',
          'พลิกข้างละ 3-5 ครั้ง 1-2 รอบ',
          'หันหน้า เอื้อมแขน งอเข่า และหมุนลำตัวไปด้านข้างทีละขั้น',
          'จัดแขนข้างอ่อนแรงให้อยู่ด้านหน้า ไม่ทับหรือดึงข้อไหล่ และหยุดเมื่อเจ็บหรือเวียนหัว',
          'bed-rolling',
        ),
      ];
    }

    if (levelId === 'level_a') {
      return [
        activity(
          'trunk_transfer_supported',
          'จัดแนวลำตัวและลุกยืนแบบมีผู้ช่วย',
          'สร้างฐานลำตัวและลำดับการลุกให้ปลอดภัยก่อนเพิ่มจำนวน',
          'วันละ 1-2 ช่วง 5-6 วันต่อสัปดาห์',
          'เบาและควบคุมได้ หยุดก่อนลำตัวเอียงมาก',
          '3-5 ครั้งต่อรอบ 1-2 รอบ พัก 90-120 วินาที',
          'เก้าอี้สูงมั่นคง ใช้มือช่วยได้ ผู้ดูแลช่วยที่ลำตัวหรือเชิงกราน',
          'ต้องมีผู้ดูแลที่ได้รับคำแนะนำหรือจุดจับมั่นคง ห้ามดึงแขนข้างอ่อนแรง',
          'sit-stand',
        ),
        activity(
          'arm_table_slide',
          'เลื่อนแขนข้างอ่อนแรงบนโต๊ะ',
          'ให้แขนร่วมกิจกรรมโดยลดน้ำหนักของแขนและไม่ดึงข้อไหล่',
          'วันละ 1-2 ช่วง 5-7 วันต่อสัปดาห์',
          'เคลื่อนไหวสบาย ไม่ฝืนเจ็บและไม่ยกไหล่ชดเชย',
          '5-8 ครั้งต่อทิศทาง 1-2 รอบ',
          'วางแขนบนผ้าหรือพื้นลื่น เลื่อนไปด้านหน้าและกลับช้า ๆ',
          'ประคองข้อศอกและสะบักหากแขนยังควบคุมได้น้อย หยุดเมื่อปวดไหล่เพิ่ม',
          'arm-slide',
        ),
        activity(
          'supported_weight_shift',
          'ถ่ายน้ำหนักไปขาข้างอ่อนแรงแบบมีคนเฝ้า',
          'เตรียมการยืนและก้าวโดยไม่เร่งให้เดินเกินความสามารถ',
          '4-5 วันต่อสัปดาห์',
          'เบา ยังคงเข่าและลำตัวในแนวปลอดภัย',
          'ค้าง 3-5 วินาที 4-6 ครั้ง 1-2 รอบ',
          'ยืนที่ราวหรือโต๊ะมั่นคง ถ่ายน้ำหนักทีละน้อย',
          'ผู้ดูแลอยู่ด้านข้างขาอ่อนแรงและพร้อมช่วยที่ลำตัวหรือเชิงกราน',
          'weight-shift',
        ),
        activity(
          'guarded_steps',
          'ก้าวระยะสั้นโดยมีผู้ช่วย',
          'เชื่อมการลงน้ำหนักกับก้าวจริงในระยะที่ควบคุมได้',
          '3-5 วันต่อสัปดาห์',
          'หยุดก่อนเท้าลาก เข่าทรุด หรือลำตัวเสียแนว',
          '3-6 ก้าวต่อรอบ 2-3 รอบ พัก 1-2 นาที',
          `ก้าวบนทางราบใกล้จุดนั่งพักและมีผู้ช่วยตลอด${deviceNote}`,
          'ไม่ทำคนเดียว หากผู้ช่วยต้องยกน้ำหนักตัวมากควรให้นักกายภาพประเมินก่อน',
          'guarded-step',
        ),
      ];
    }

    if (levelId === 'level_b') {
      return [
        activity(
          'sit_to_stand_control',
          'ลุกยืนโดยเน้นลงน้ำหนักสองข้าง',
          'ลดการใช้ขาข้างแข็งแรงชดเชยและเพิ่มการควบคุมลำตัว',
          '3-5 วันต่อสัปดาห์',
          'เหนื่อยประมาณ 3-4/10 และยังนั่งลงได้อย่างควบคุม',
          '4-8 ครั้งต่อรอบ 2 รอบ พัก 60-90 วินาที',
          'ลุกจากเก้าอี้มั่นคง วางเท้าให้สมดุลและใช้มือเท่าที่จำเป็น',
          'มีผู้ดูแลใกล้ ๆ หากยังต้องเตือนหรือเสียสมดุลเป็นครั้งคราว',
          'sit-stand',
        ),
        activity(
          'weight_shift_step',
          'ถ่ายน้ำหนักและก้าวไปยังเป้าหมาย',
          'ฝึกการรับน้ำหนักข้างอ่อนแรงก่อนต่อเป็นการเดิน',
          '4-5 วันต่อสัปดาห์',
          'ก้าวช้า คุมเข่าและลำตัว ไม่เร่งจำนวน',
          'ก้าว 5-8 ครั้งต่อข้าง 1-2 รอบ',
          'แตะเป้าหมายด้านหน้าและด้านข้างใกล้ราวจับ',
          'หยุดเมื่อเข่าทรุด เท้าลากมากขึ้น หรือผู้ดูแลต้องออกแรงพยุงต่อเนื่อง',
          'weight-shift',
        ),
        activity(
          'interval_home_walk',
          'เดินเป็นช่วงในเส้นทางจริงของบ้าน',
          'เพิ่มระยะใช้งานโดยยังรักษาคุณภาพการก้าวและความปลอดภัย',
          '4-6 วันต่อสัปดาห์',
          'เหนื่อยประมาณ 3-4/10 และยังพูดเป็นประโยคได้',
          'เดิน 1-3 นาที สลับพัก 1-2 นาที 3-4 รอบ',
          `เดินทางราบไปยังจุดใช้งานจริง เช่น ห้องน้ำหรือโต๊ะอาหาร${deviceNote}`,
          'มีคนเฝ้าตามระดับ FAC เดิม ไม่ลดอุปกรณ์หรือความช่วยเหลือเอง',
          'guarded-step',
        ),
        activity(
          'functional_arm_assist',
          'ใช้แขนข้างอ่อนแรงช่วยงานสองมือ',
          'เปลี่ยนจากการขยับแยกส่วนไปสู่การช่วยจับ พยุง และเลื่อนของในกิจวัตร',
          'ทุกวัน วันละ 2-3 ช่วงสั้น',
          'ทำช้า ไม่กลั้นหายใจ และไม่ฝืนปวดไหล่',
          'เลือก 1-2 กิจกรรม ทำกิจกรรมละ 5-10 ครั้ง',
          'ใช้มือข้างอ่อนแรงช่วยจับผ้า กล่องเบา หรือพยุงภาชนะบนโต๊ะ',
          'วางของในระยะใกล้และมีผู้ดูแลช่วยจัดมือเมื่อจำเป็น',
          'arm-task',
        ),
      ];
    }

    return [
      activity(
        'sit_to_stand_symmetry',
        'ลุกยืนให้สมมาตรและควบคุมจังหวะ',
        'เพิ่มคุณภาพการออกแรงสองข้างก่อนเพิ่มความเร็วหรือจำนวน',
        '3 วันต่อสัปดาห์',
        'เหนื่อยประมาณ 3-5/10 รูปแบบยังคงดี',
        '6-10 ครั้งต่อรอบ 2-3 รอบ พัก 60 วินาที',
        'ลดการใช้มือทีละน้อยและนั่งลงช้า 2-3 วินาที',
        'ใช้เก้าอี้มั่นคงและหยุดหากเข่าทรุดหรือเสียสมดุล',
        'sit-stand',
      ),
      activity(
        'turning_path_walk',
        'เดิน เลี้ยว และเปลี่ยนทิศในบ้าน',
        'เตรียมการเดินในพื้นที่จริงที่มีประตู มุม และจุดเลี้ยว',
        '4-6 วันต่อสัปดาห์',
        'เหนื่อยประมาณ 3-5/10 โดยเท้าไม่ลากมากขึ้น',
        'เดิน 3-5 นาที 3-4 รอบ พักประมาณ 1 นาที',
        `เดินเส้นทางเดิมแล้วเพิ่มจุดเลี้ยวทีละจุด${deviceNote}`,
        'เพิ่มความซับซ้อนก่อนความเร็ว และคงอุปกรณ์เดิมจนได้รับการประเมิน',
        'guarded-step',
      ),
      activity(
        'reach_grasp_release',
        'เอื้อม จับ และวางของด้วยแขนข้างอ่อนแรง',
        'เพิ่มการควบคุมแขนและมือในระยะที่ใช้จริง',
        '5-7 วันต่อสัปดาห์',
        'ใช้ของเบา เคลื่อนไหวช้าและไม่ยกไหล่ชดเชย',
        '5-10 ครั้งต่อเป้าหมาย 2 รอบ',
        'ย้ายของชิ้นใหญ่และเบาระหว่างจุดใกล้ตัว 2-3 จุด',
        'หยุดเมื่อปวดไหล่ ชามากขึ้น หรือการเคลื่อนไหวเสียรูปแบบชัดเจน',
        'arm-task',
      ),
      activity(
        'bilateral_daily_task',
        'ฝึกงานจริงที่ต้องใช้สองมือ',
        'เชื่อมแขนข้างอ่อนแรงกลับสู่บทบาทในกิจวัตรที่ผู้ใช้ให้ความสำคัญ',
        'ทุกวัน วันละ 2-3 ช่วงสั้น',
        'เลือกงานที่สำเร็จได้โดยไม่เร่งและไม่เสี่ยงล้ม',
        '5-10 นาทีต่อกิจกรรม 1-2 กิจกรรม',
        'พับผ้า เปิดภาชนะเบา เช็ดโต๊ะ หรือจัดของบนโต๊ะ',
        'เริ่มจากท่านั่งหากงานนั้นดึงความสนใจจากการทรงตัว',
        'arm-slide',
      ),
    ];
  }

  function buildSchedule(levelId) {
    const schedules = {
      level_bed: [
        'ยกสะโพกเล็กน้อย + แขนบนโต๊ะ', 'พลิกตัว + ฝึกลำตัวนั่ง', 'พักและจัดท่าลดแรงกด',
        'ยกสะโพกเล็กน้อย + แขนบนโต๊ะ', 'พลิกตัว + ฝึกลำตัวนั่ง', 'ทบทวนวิธีช่วยกับผู้ดูแล', 'พักและสังเกตอาการ',
      ],
      level_a: [
        'ลำตัว + แขนบนโต๊ะ', 'ถ่ายน้ำหนัก + แขนบนโต๊ะ', 'พักและทำกิจวัตรเบา',
        'ลำตัว + ก้าวสั้น', 'แขนบนโต๊ะ + ถ่ายน้ำหนัก', 'ทบทวนกับผู้ดูแล', 'พักและสังเกตอาการ',
      ],
      level_b: [
        'ลุกยืน + แขนช่วยงาน', 'เดินเป็นช่วง', 'ถ่ายน้ำหนัก + แขนช่วยงาน',
        'พักหรือกิจวัตรเบา', 'ลุกยืน + เดินเป็นช่วง', 'แขนช่วยงานจริง', 'เดินเบาและทบทวนอาการ',
      ],
      level_c: [
        'ลุกยืน + เอื้อมจับ', 'เดินและเลี้ยว', 'งานสองมือ + เดินเบา',
        'ลุกยืน + เอื้อมจับ', 'เดินและเลี้ยว', 'กิจวัตรจริงที่เลือก', 'พักและทบทวนคุณภาพ',
      ],
    };
    return schedules[levelId].map((activityTh, index) => ({
      dayTh: `วันที่ ${index + 1}`,
      activityTh,
    }));
  }

  function buildModifierNotes(input) {
    const notes = [];
    if (input.modifiers.includes('shoulder_pain_or_subluxation')) {
      notes.push('ไหล่ข้างอ่อนแรง: ห้ามดึงแขน ประคองข้อศอก และหยุดเมื่อปวดหรือไหล่ตกมากขึ้น');
    }
    if (input.modifiers.includes('walking_aid')) {
      notes.push('อุปกรณ์ช่วยเดิน: ใช้อุปกรณ์เดิมต่อ และให้ผู้เชี่ยวชาญตรวจความสูงกับวิธีใช้ก่อนลดอุปกรณ์');
    }
    if (input.modifiers.includes('neglect_or_visual_field')) {
      notes.push('การรับรู้ด้านอ่อนแรงหรือการมองเห็น: จัดเป้าหมายให้อยู่ในระยะที่มองเห็นและเพิ่มการสแกนสิ่งแวดล้อม');
    }
    if (input.modifiers.includes('communication_or_cognition')) {
      notes.push('การสื่อสารหรือความเข้าใจ: ใช้คำสั่งสั้นทีละขั้น สาธิต และให้ผู้ดูแลยืนยันความเข้าใจ');
    }
    return notes;
  }

  function buildPtAssessments(input, levelId) {
    if (levelId === 'level_bed') {
      return [
        'การควบคุมศีรษะและลำตัว ความสามารถนั่งทรงตัว และความพร้อมก่อนฝึกยืน',
        'การพลิกตัว การยกสะโพก การจัดท่า และข้อจำกัดของสะโพกหรือกระดูกสันหลัง',
        'โทนกล้ามเนื้อ การจัดแนวสะบัก และความปลอดภัยของข้อไหล่',
        'วิธีช่วยของผู้ดูแล เตียง อุปกรณ์ และพื้นที่ย้ายตัวในบ้าน',
      ];
    }
    const items = [
      'การควบคุมลำตัว การถ่ายน้ำหนัก และคุณภาพการลุกยืน',
      'คุณภาพการเดิน การควบคุมเข่า เท้าลาก และความเหมาะสมของอุปกรณ์',
      'การควบคุมแขนและมือด้วย Fugl-Meyer หรือแบบประเมินเฉพาะที่เหมาะสม',
      'โทนกล้ามเนื้อ การจัดแนวสะบัก และความปลอดภัยของข้อไหล่',
    ];
    if (levelId === 'level_a') items.push('วิธีช่วยของผู้ดูแลและความปลอดภัยของการย้ายตัวในบ้าน');
    if (input.modifiers.includes('neglect_or_visual_field')) items.push('การละเลยด้านอ่อนแรงและการรับรู้สิ่งแวดล้อม');
    return items;
  }

  function buildProgressionRules(levelId) {
    const rules = [
      'ทำระดับเดิมได้อย่างปลอดภัยอย่างน้อย 2-3 ครั้งก่อนเพิ่ม',
      'เพิ่มเพียงอย่างเดียวต่อครั้ง ได้แก่ จำนวน เวลา ระยะ หรือความซับซ้อน',
      'เพิ่มเมื่อวันถัดไปไม่ล้ามากขึ้นและกิจวัตรเดิมไม่แย่ลง',
    ];
    if (levelId !== 'level_c') rules.push('ลดความช่วยเหลือเฉพาะเมื่อรูปแบบยังปลอดภัย ไม่ลดเพราะต้องการให้ยากขึ้นอย่างเดียว');
    if (levelId === 'level_bed') rules.push('เริ่มฝึกลุกยืนเมื่อผู้ป่วยนั่งทรงตัวได้และมีการยืนจริงที่ผู้ดูแลหรือนักกายภาพยืนยันว่าปลอดภัยแล้วเท่านั้น');
    return rules;
  }

  function buildRegressionRules() {
    return [
      'ถ้าเท้าลาก เข่าทรุด ลำตัวเอียง หรือผู้ดูแลต้องออกแรงมากขึ้น ให้ลดจำนวนหรือกลับระดับก่อนหน้า',
      'ถ้าปวดไหล่เพิ่ม ให้หยุดกิจกรรมแขน ประคองแขน และขอคำแนะนำก่อนทำต่อ',
      'หากมีหน้าเบี้ยว พูดไม่ชัด แขนขาอ่อนแรงใหม่ เจ็บหน้าอก หอบขณะพัก หรือซึมลง ให้หยุดและพบแพทย์ทันที',
    ];
  }

  function routeResult(route, input) {
    const messages = {
      medical_review: 'มีข้อมูลที่ควรให้แพทย์ประเมินก่อนเริ่มหรือเพิ่มการฝึก',
      assisted_rehab: 'ขณะนี้ยังนั่งทรงตัวหรือย้ายจากเตียงไปเก้าอี้ไม่ได้ ควรใช้แผนช่วยเหลือบนเตียงโดยผู้ดูแลและให้นักกายภาพประเมินก่อนเริ่มท่าฝึกด้วยตัวเอง',
      invalid_input: 'ตรวจคะแนน Barthel, FAC และการใช้แขนอีกครั้งก่อนสร้างแผน',
    };
    return {
      route,
      routeMessageTh: messages[route],
      levelId: null,
      levelLabelTh: '',
      activities: [],
      schedule: [],
      progressionRulesTh: [],
      regressionRulesTh: [],
      modifierNotesTh: [],
      ptPriority: 'recommended',
      ptAssessmentTh: ['ประเมินความปลอดภัยและระดับความช่วยเหลือที่เหมาะสม'],
      trackingBaseline: null,
      validationErrorsTh: input.validationErrorsTh,
      input,
    };
  }

  function buildStrokeArmLegPlan(rawInput) {
    const input = normalize(rawInput);
    const route = routeFor(input);
    if (route !== 'personal_plan') return routeResult(route, input);
    const levelId = chooseLevel(input);
    return {
      route,
      routeMessageTh: '',
      levelId,
      levelLabelTh: LEVEL_LABELS[levelId],
      activities: buildActivities(levelId, input).slice(0, 4),
      schedule: buildSchedule(levelId),
      progressionRulesTh: buildProgressionRules(levelId),
      regressionRulesTh: buildRegressionRules(),
      modifierNotesTh: buildModifierNotes(input),
      ptPriority: levelId === 'level_c' && input.modifiers.length === 0 ? 'optional' : 'recommended',
      ptAssessmentTh: buildPtAssessments(input, levelId),
      trackingBaseline: {
        barthelTotal: input.barthelTotal,
        transferLevel: input.transferLevel,
        facLevel: input.facLevel,
        armUseLevel: input.armUseLevel,
      },
      validationErrorsTh: [],
      input,
    };
  }

  return { buildStrokeArmLegPlan };
});
