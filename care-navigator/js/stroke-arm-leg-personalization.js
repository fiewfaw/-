(function attachStrokeArmLegPersonalization(root, factory) {
  const exerciseLibrary = root && root.CareExerciseLibrary
    ? root.CareExerciseLibrary
    : (typeof module === 'object' && module.exports ? require('./exercise-library.js') : null);
  const api = factory(exerciseLibrary);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.StrokeArmLegPersonalization = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createStrokeArmLegPersonalization(exerciseLibrary) {
  if (!exerciseLibrary) throw new Error('CareExerciseLibrary is required');
  const LEVEL_LABELS = {
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
      facLevel: toNumber(source.facLevel),
      armUseLevel: toNumber(source.armUseLevel),
      armSpasticityImpact: toNumber(source.armSpasticityImpact),
      legSpasticityImpact: toNumber(source.legSpasticityImpact),
      shoulderPainImpact: toNumber(source.shoulderPainImpact),
      redFlag: source.redFlag === true,
      modifiers: Array.isArray(source.modifiers)
        ? [...new Set(source.modifiers.filter((value) => typeof value === 'string'))]
        : [],
    };
    const errors = [];
    if (!Number.isInteger(input.barthelTotal) || input.barthelTotal < 0 || input.barthelTotal > 20) {
      errors.push('คะแนน Barthel Index ต้องเป็นจำนวนเต็มระหว่าง 0-20');
    }
    if (!Number.isInteger(input.facLevel) || input.facLevel < 0 || input.facLevel > 5) {
      errors.push('ระดับการเดิน FAC ต้องเป็นจำนวนเต็มระหว่าง 0-5');
    }
    if (!Number.isInteger(input.armUseLevel) || input.armUseLevel < 0 || input.armUseLevel > 5) {
      errors.push('ระดับการใช้แขนต้องเป็นจำนวนเต็มระหว่าง 0-5');
    }
    if (!Number.isInteger(input.armSpasticityImpact) || input.armSpasticityImpact < 0 || input.armSpasticityImpact > 3) {
      errors.push('ผลกระทบจากอาการเกร็งแขนต้องเป็นจำนวนเต็มระหว่าง 0-3');
    }
    if (!Number.isInteger(input.legSpasticityImpact) || input.legSpasticityImpact < 0 || input.legSpasticityImpact > 3) {
      errors.push('ผลกระทบจากอาการเกร็งขาต้องเป็นจำนวนเต็มระหว่าง 0-3');
    }
    if (!Number.isInteger(input.shoulderPainImpact) || input.shoulderPainImpact < 0 || input.shoulderPainImpact > 3) {
      errors.push('ผลกระทบจากอาการปวดหรือความไม่มั่นคงของไหล่ต้องเป็นจำนวนเต็มระหว่าง 0-3');
    }
    if (input.shoulderPainImpact > 0 && !input.modifiers.includes('shoulder_pain_or_subluxation')) {
      input.modifiers.push('shoulder_pain_or_subluxation');
    }
    input.validationErrorsTh = errors;
    return input;
  }

  function routeFor(input) {
    if (input.redFlag || input.shoulderPainImpact === 3) return 'medical_review';
    if (input.validationErrorsTh.length) return 'invalid_input';
    if (input.barthelTotal <= 4 || input.facLevel === 0) return 'assisted_rehab';
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
    const lowest = Math.min(
      rankBarthel(input.barthelTotal),
      rankFac(input.facLevel),
      rankArm(input.armUseLevel),
    );
    return lowest === 1 ? 'level_a' : lowest === 2 ? 'level_b' : 'level_c';
  }

  function activity(id, frequency, intensity, time, type) {
    return exerciseLibrary.prescribeExercise(id, {
      frequency,
      intensity,
      time,
      type,
    });
  }

  function spasticityActivity(id, impact) {
    const highImpact = impact === 3;
    if (id === 'spasticity_arm_preparation') {
      return activity(
        id,
        'ทุกวัน วันละ 2-3 ช่วงสั้น และก่อนกิจกรรมแขน',
        highImpact
          ? 'เบามาก เคลื่อนไหวเฉพาะช่วงที่สบาย ไม่พยายามเพิ่มองศาเอง'
          : 'เบาและช้า แรงต้านไม่เพิ่มและยังหายใจสบาย',
        '5-8 ครั้งต่อทิศทาง ใช้ประมาณ 3-5 นาที',
        'รองรับแขนบนโต๊ะ เคลื่อนไหวช้า แล้วต่อด้วยกิจกรรมใช้แขนที่อยู่ในแผน',
      );
    }
    return activity(
      id,
      'ทุกวัน วันละ 2-3 ช่วงสั้น และก่อนฝึกลุกหรือเดิน',
      highImpact
        ? 'เบามาก เคลื่อนไหวเฉพาะช่วงที่สบาย ไม่กดข้อเท้าหรือเข่า'
        : 'เบาและช้า เท้ายังมีจุดรองรับและอาการไม่เพิ่ม',
      '5-8 ครั้ง ใช้ประมาณ 3-5 นาที',
      'นั่งบนเก้าอี้มั่นคง เตรียมขาและข้อเท้า แล้วฝึกลุกหรือเดินตามระดับ FAC เดิม',
    );
  }

  function applySpasticityActivities(baseActivities, levelId, input) {
    const armAffected = input.armSpasticityImpact > 0;
    const legAffected = input.legSpasticityImpact > 0;
    if (!armAffected && !legAffected) return baseActivities;

    const preferred = {
      level_a: {
        both: ['arm_table_slide', 'guarded_steps'],
        arm: ['trunk_transfer_supported', 'arm_table_slide', 'guarded_steps'],
        leg: ['trunk_transfer_supported', 'arm_table_slide', 'guarded_steps'],
      },
      level_b: {
        both: ['functional_arm_assist', 'interval_home_walk'],
        arm: ['sit_to_stand_control', 'interval_home_walk', 'functional_arm_assist'],
        leg: ['sit_to_stand_control', 'interval_home_walk', 'functional_arm_assist'],
      },
      level_c: {
        both: ['reach_grasp_release', 'turning_path_walk'],
        arm: ['sit_to_stand_symmetry', 'turning_path_walk', 'reach_grasp_release'],
        leg: ['sit_to_stand_symmetry', 'turning_path_walk', 'reach_grasp_release'],
      },
    };
    const mode = armAffected && legAffected ? 'both' : armAffected ? 'arm' : 'leg';
    const selected = [];
    if (armAffected) selected.push(spasticityActivity('spasticity_arm_preparation', input.armSpasticityImpact));
    if (legAffected) selected.push(spasticityActivity('spasticity_leg_preparation', input.legSpasticityImpact));
    for (const id of preferred[levelId][mode]) {
      const match = baseActivities.find((item) => item.id === id);
      if (match) selected.push(match);
    }
    return selected.slice(0, 4);
  }

  function applyShoulderProtection(activities, input) {
    if (input.shoulderPainImpact <= 0) return activities;
    const armActivityIds = new Set([
      'arm_table_slide',
      'functional_arm_assist',
      'reach_grasp_release',
      'bilateral_daily_task',
      'spasticity_arm_preparation',
    ]);
    return activities.map((item) => {
      if (!armActivityIds.has(item.id)) return item;
      const moderate = input.shoulderPainImpact === 2;
      return {
        ...item,
        fitt: {
          ...item.fitt,
          intensity: moderate
            ? 'เบามาก ทำเฉพาะช่วงที่สบาย อาการปวดไม่เพิ่มเกิน 3/10 และไหล่ไม่ยกชดเชย'
            : 'เบา เคลื่อนไหวช้า อาการปวดไม่เพิ่มและแขนยังมีที่รองรับ',
          time: moderate
            ? '3-5 ครั้งต่อกิจกรรม 1 รอบ แล้วติดตามอาการถึงวันถัดไป'
            : item.fitt.time,
          type: `${item.fitt.type} รองรับข้อศอกและท่อนแขนตลอดช่วงที่ยังควบคุมไหล่ไม่มั่นคง`,
        },
        safetyTh: `${item.safetyTh} ห้ามดึงแขนข้างอ่อนแรง และหยุดเมื่อปวดหรือไหล่ตกมากขึ้น`,
      };
    });
  }

  function buildActivities(levelId, input) {
    const deviceNote = input.modifiers.includes('walking_aid')
      ? ' ใช้อุปกรณ์เดิมต่อไปจนกว่านักกายภาพจะปรับให้'
      : '';

    if (levelId === 'level_a') {
      return applyShoulderProtection(applySpasticityActivities([
        activity(
          'trunk_transfer_supported',
          'วันละ 1-2 ช่วง 5-6 วันต่อสัปดาห์',
          'เบาและควบคุมได้ หยุดก่อนลำตัวเอียงมาก',
          '3-5 ครั้งต่อรอบ 1-2 รอบ พัก 90-120 วินาที',
          'เก้าอี้สูงมั่นคง ใช้มือช่วยได้ ผู้ดูแลช่วยที่ลำตัวหรือเชิงกราน',
        ),
        activity(
          'arm_table_slide',
          'วันละ 1-2 ช่วง 5-7 วันต่อสัปดาห์',
          'เคลื่อนไหวสบาย ไม่ฝืนเจ็บและไม่ยกไหล่ชดเชย',
          '5-8 ครั้งต่อทิศทาง 1-2 รอบ',
          'วางแขนบนผ้าหรือพื้นลื่น เลื่อนไปด้านหน้าและกลับช้า ๆ',
        ),
        activity(
          'supported_weight_shift',
          '4-5 วันต่อสัปดาห์',
          'เบา ยังคงเข่าและลำตัวในแนวปลอดภัย',
          'ค้าง 3-5 วินาที 4-6 ครั้ง 1-2 รอบ',
          'ยืนที่ราวหรือโต๊ะมั่นคง ถ่ายน้ำหนักทีละน้อย',
        ),
        activity(
          'guarded_steps',
          '3-5 วันต่อสัปดาห์',
          'หยุดก่อนเท้าลาก เข่าทรุด หรือลำตัวเสียแนว',
          '3-6 ก้าวต่อรอบ 2-3 รอบ พัก 1-2 นาที',
          `ก้าวบนทางราบใกล้จุดนั่งพักและมีผู้ช่วยตลอด${deviceNote}`,
        ),
      ], levelId, input), input);
    }

    if (levelId === 'level_b') {
      return applyShoulderProtection(applySpasticityActivities([
        activity(
          'sit_to_stand_control',
          '3-5 วันต่อสัปดาห์',
          'เหนื่อยประมาณ 3-4/10 และยังนั่งลงได้อย่างควบคุม',
          '4-8 ครั้งต่อรอบ 2 รอบ พัก 60-90 วินาที',
          'ลุกจากเก้าอี้มั่นคง วางเท้าให้สมดุลและใช้มือเท่าที่จำเป็น',
        ),
        activity(
          'weight_shift_step',
          '4-5 วันต่อสัปดาห์',
          'ก้าวช้า คุมเข่าและลำตัว ไม่เร่งจำนวน',
          'ก้าว 5-8 ครั้งต่อข้าง 1-2 รอบ',
          'แตะเป้าหมายด้านหน้าและด้านข้างใกล้ราวจับ',
        ),
        activity(
          'interval_home_walk',
          '4-6 วันต่อสัปดาห์',
          'เหนื่อยประมาณ 3-4/10 และยังพูดเป็นประโยคได้',
          'เดิน 1-3 นาที สลับพัก 1-2 นาที 3-4 รอบ',
          `เดินทางราบไปยังจุดใช้งานจริง เช่น ห้องน้ำหรือโต๊ะอาหาร${deviceNote}`,
        ),
        activity(
          'functional_arm_assist',
          'ทุกวัน วันละ 2-3 ช่วงสั้น',
          'ทำช้า ไม่กลั้นหายใจ และไม่ฝืนปวดไหล่',
          'เลือก 1-2 กิจกรรม ทำกิจกรรมละ 5-10 ครั้ง',
          'ใช้มือข้างอ่อนแรงช่วยจับผ้า กล่องเบา หรือพยุงภาชนะบนโต๊ะ',
        ),
      ], levelId, input), input);
    }

    return applyShoulderProtection(applySpasticityActivities([
      activity(
        'sit_to_stand_symmetry',
        '3 วันต่อสัปดาห์',
        'เหนื่อยประมาณ 3-5/10 รูปแบบยังคงดี',
        '6-10 ครั้งต่อรอบ 2-3 รอบ พัก 60 วินาที',
        'ลดการใช้มือทีละน้อยและนั่งลงช้า 2-3 วินาที',
      ),
      activity(
        'turning_path_walk',
        '4-6 วันต่อสัปดาห์',
        'เหนื่อยประมาณ 3-5/10 โดยเท้าไม่ลากมากขึ้น',
        'เดิน 3-5 นาที 3-4 รอบ พักประมาณ 1 นาที',
        `เดินเส้นทางเดิมแล้วเพิ่มจุดเลี้ยวทีละจุด${deviceNote}`,
      ),
      activity(
        'reach_grasp_release',
        '5-7 วันต่อสัปดาห์',
        'ใช้ของเบา เคลื่อนไหวช้าและไม่ยกไหล่ชดเชย',
        '5-10 ครั้งต่อเป้าหมาย 2 รอบ',
        'ย้ายของชิ้นใหญ่และเบาระหว่างจุดใกล้ตัว 2-3 จุด',
      ),
      activity(
        'bilateral_daily_task',
        'ทุกวัน วันละ 2-3 ช่วงสั้น',
        'เลือกงานที่สำเร็จได้โดยไม่เร่งและไม่เสี่ยงล้ม',
        '5-10 นาทีต่อกิจกรรม 1-2 กิจกรรม',
        'พับผ้า เปิดภาชนะเบา เช็ดโต๊ะ หรือจัดของบนโต๊ะ',
      ),
    ], levelId, input), input);
  }

  function buildSchedule(levelId, input) {
    const schedules = {
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
    const preparation = [
      input.armSpasticityImpact > 0 ? 'เตรียมแขน' : '',
      input.legSpasticityImpact > 0 ? 'เตรียมขา' : '',
      input.shoulderPainImpact > 0 ? 'ประคองไหล่และแขน' : '',
    ].filter(Boolean).join(' + ');
    return schedules[levelId].map((activityTh, index) => ({
      dayTh: `วันที่ ${index + 1}`,
      activityTh: preparation && (index === 0 || index === 3)
        ? `${preparation} ก่อน ${activityTh}`
        : activityTh,
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
    if (input.armSpasticityImpact > 0) {
      notes.push('อาการเกร็งแขน: รองรับแขนและเตรียมการเคลื่อนไหวช้าก่อนต่อด้วยกิจกรรมใช้แขนจริง ไม่ดึงไหล่หรือดัดข้อเร็ว');
    }
    if (input.legSpasticityImpact > 0) {
      notes.push('อาการเกร็งขา: เตรียมขาและข้อเท้าในท่านั่งก่อนลุกหรือเดิน และคงระดับผู้ช่วยตาม FAC เดิม');
    }
    if (input.armSpasticityImpact === 3 || input.legSpasticityImpact === 3) {
      notes.push('อาการเกร็งรบกวนมาก: ไม่ฝืนเพิ่มช่วงการเคลื่อนไหวเอง ควรประเมินข้อติด ความเจ็บปวด ผิวหนัง การจัดท่า และสิ่งกระตุ้นก่อนเพิ่มการฝึก');
    }
    return notes;
  }

  function buildPtAssessments(input, levelId) {
    const items = [
      'การควบคุมลำตัว การถ่ายน้ำหนัก และคุณภาพการลุกยืน',
      'คุณภาพการเดิน การควบคุมเข่า เท้าลาก และความเหมาะสมของอุปกรณ์',
      'การควบคุมแขนและมือด้วย Fugl-Meyer หรือแบบประเมินเฉพาะที่เหมาะสม',
      'โทนกล้ามเนื้อ การจัดแนวสะบัก และความปลอดภัยของข้อไหล่',
    ];
    if (levelId === 'level_a') items.push('วิธีช่วยของผู้ดูแลและความปลอดภัยของการย้ายตัวในบ้าน');
    if (input.modifiers.includes('neglect_or_visual_field')) items.push('การละเลยด้านอ่อนแรงและการรับรู้สิ่งแวดล้อม');
    if (input.armSpasticityImpact > 0 || input.legSpasticityImpact > 0) {
      items.push('รูปแบบอาการเกร็ง ช่วงการเคลื่อนไหว ข้อติด ความเจ็บปวด การจัดท่า และผลต่อกิจวัตรจริง');
    }
    if (input.shoulderPainImpact > 0) {
      items.push('สาเหตุปวดไหล่ การจัดแนวสะบักและข้อไหล่ ภาวะข้อไหล่เคลื่อนบางส่วน เนื้อเยื่อรอบข้อ และวิธีประคองแขนในกิจวัตร');
    }
    return items;
  }

  function buildProgressionRules(levelId) {
    const rules = [
      'ทำระดับเดิมได้อย่างปลอดภัยอย่างน้อย 2-3 ครั้งก่อนเพิ่ม',
      'เพิ่มเพียงอย่างเดียวต่อครั้ง ได้แก่ จำนวน เวลา ระยะ หรือความซับซ้อน',
      'เพิ่มเมื่อวันถัดไปไม่ล้ามากขึ้นและกิจวัตรเดิมไม่แย่ลง',
    ];
    if (levelId !== 'level_c') rules.push('ลดความช่วยเหลือเฉพาะเมื่อรูปแบบยังปลอดภัย ไม่ลดเพราะต้องการให้ยากขึ้นอย่างเดียว');
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
      medical_review: input.shoulderPainImpact === 3
        ? 'อาการปวดหรือความไม่มั่นคงของไหล่รบกวนมาก ควรให้แพทย์หรือนักกายภาพประเมินสาเหตุก่อนเพิ่มการฝึกแขน'
        : 'มีข้อมูลที่ควรให้แพทย์ประเมินก่อนเริ่มหรือเพิ่มการฝึก',
      assisted_rehab: 'ระดับนี้ควรใช้แผนที่มีผู้ดูแลและนักกายภาพประเมินการย้ายตัวก่อน ไม่ควรเริ่มแผนเดินด้วยตัวเอง',
      invalid_input: 'ตรวจคะแนน Barthel, FAC การใช้แขน อาการเกร็ง และอาการไหล่อีกครั้งก่อนสร้างแผน',
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
      schedule: buildSchedule(levelId, input),
      progressionRulesTh: buildProgressionRules(levelId),
      regressionRulesTh: buildRegressionRules(),
      modifierNotesTh: buildModifierNotes(input),
      ptPriority: levelId === 'level_c'
        && input.modifiers.length === 0
        && input.armSpasticityImpact === 0
        && input.legSpasticityImpact === 0
        && input.shoulderPainImpact === 0
        ? 'optional'
        : 'recommended',
      ptAssessmentTh: buildPtAssessments(input, levelId),
      trackingBaseline: {
        barthelTotal: input.barthelTotal,
        facLevel: input.facLevel,
        armUseLevel: input.armUseLevel,
        armSpasticityImpact: input.armSpasticityImpact,
        legSpasticityImpact: input.legSpasticityImpact,
        shoulderPainImpact: input.shoulderPainImpact,
      },
      validationErrorsTh: [],
      input,
    };
  }

  return { buildStrokeArmLegPlan };
});
