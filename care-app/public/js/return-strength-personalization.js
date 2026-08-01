(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ReturnStrengthPersonalization = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const LEVEL_LABELS = {
    cautious: 'เริ่มฟื้นอย่างระมัดระวัง',
    rebuilding: 'คืนแรงทีละช่วง',
    advancing: 'พร้อมเพิ่มความทนทาน',
  };

  const RANGE_RULES = {
    walkDistanceMeters: [1, 1000, 'ระยะเดิน 2 นาทีต้องอยู่ระหว่าง 1-1,000 เมตร'],
    postWalkExertion: [0, 10, 'ระดับความเหนื่อยต้องอยู่ระหว่าง 0-10'],
    recoveryMinutes: [0, 30, 'เวลาฟื้นต้องอยู่ระหว่าง 0-30 นาที'],
    chairStandReps: [0, 30, 'จำนวนลุกยืนต้องอยู่ระหว่าง 0-30 ครั้ง'],
    painScore: [0, 10, 'ระดับปวดต้องอยู่ระหว่าง 0-10'],
  };

  function toNumber(value) {
    if (value === '' || value === null || typeof value === 'undefined') return Number.NaN;
    return Number(value);
  }

  function normalize(raw) {
    const source = raw || {};
    const input = {
      walkTestCompleted: source.walkTestCompleted === true,
      walkDistanceMeters: toNumber(source.walkDistanceMeters),
      postWalkExertion: toNumber(source.postWalkExertion),
      recoveryMinutes: toNumber(source.recoveryMinutes),
      chairStandReps: toNumber(source.chairStandReps),
      assistance: ['independent', 'supervision', 'physical_assist'].includes(source.assistance)
        ? source.assistance
        : 'independent',
      redFlag: source.redFlag === true,
      modifiers: Array.isArray(source.modifiers)
        ? [...new Set(source.modifiers.filter((value) => typeof value === 'string'))]
        : [],
      painScore: Number.isFinite(toNumber(source.painScore)) ? toNumber(source.painScore) : 0,
    };

    input.validationErrorsTh = Object.entries(RANGE_RULES).flatMap(([key, rule]) => {
      const [min, max, message] = rule;
      const value = input[key];
      return Number.isFinite(value) && value >= min && value <= max ? [] : [message];
    });
    return input;
  }

  function getRoute(input) {
    if (input.redFlag || input.modifiers.includes('new_orthostatic_symptoms')) return 'medical_review';
    if (input.assistance === 'physical_assist') return 'assisted_rehab';
    if (!input.walkTestCompleted) return 'assessment_incomplete';
    if (input.validationErrorsTh.length) return 'invalid_input';
    return 'personal_plan';
  }

  function makeRouteResult(route, input) {
    const routeCopy = {
      medical_review: 'ควรให้แพทย์หรือนักกายภาพประเมินอาการก่อนเริ่มแผนยืนและเดิน',
      assisted_rehab: 'ควรใช้แผนย้ายตัวหรือแผนที่มีผู้ดูแลช่วย และให้นักกายภาพประเมินก่อน',
      assessment_incomplete: 'ยังใช้แผนเริ่มต้นได้ แต่ต้องทำแบบประเมินให้ครบก่อนสร้าง FITT',
      invalid_input: 'ตรวจตัวเลขที่กรอกอีกครั้งก่อนสร้างแผน',
    };
    return {
      route,
      routeMessageTh: routeCopy[route],
      levelId: null,
      levelLabelTh: '',
      sitToStand: null,
      intervalWalking: null,
      schedule: [],
      progressionRulesTh: [],
      regressionRulesTh: [],
      modifierNotesTh: [],
      ptPriority: 'recommended',
      ptAssessmentTh: ['ประเมินความปลอดภัยก่อนเริ่มกิจกรรมในท่ายืน'],
      trackingBaseline: null,
      validationErrorsTh: input.validationErrorsTh,
      input,
    };
  }

  function getLevel(input) {
    const capped = input.modifiers.includes('stable_cardiopulmonary_limit')
      || input.modifiers.includes('cancer_rapid_loss');
    if (capped
      || input.postWalkExertion >= 7
      || input.recoveryMinutes > 5
      || input.chairStandReps <= 4
      || input.assistance === 'supervision') return 'cautious';
    if (input.postWalkExertion <= 3
      && input.recoveryMinutes <= 2
      && input.chairStandReps >= 10
      && input.assistance === 'independent') return 'advancing';
    return 'rebuilding';
  }

  function buildSitToStand(input, levelId) {
    const painAdaptation = input.painScore >= 5;
    if (levelId === 'cautious') {
      const zeroAdaptation = input.chairStandReps === 0;
      return {
        frequency: '2 วันต่อสัปดาห์ มีวันพักคั่น',
        intensity: 'เหนื่อยประมาณ 2-3/10 หยุดก่อนรูปแบบเสีย',
        time: '1-3 ครั้ง 1 รอบ พัก 90-120 วินาที',
        type: zeroAdaptation
          ? 'ใช้เก้าอี้สูงและมือช่วย ฝึกโน้มตัวหรือยกก้นพ้นเก้าอี้บางส่วน'
          : painAdaptation
            ? 'ใช้เก้าอี้สูงและลดช่วงการลุกตามอาการปวด'
            : 'ลุกยืนจากเก้าอี้สูง ใช้มือช่วยได้ และมีผู้ดูแลใกล้ ๆ',
        restSeconds: '90-120',
      };
    }

    if (levelId === 'rebuilding') {
      const reps = Math.max(2, Math.min(6, Math.floor(input.chairStandReps * 0.5)));
      return {
        frequency: '2-3 วันต่อสัปดาห์',
        intensity: 'เหนื่อยประมาณ 3-4/10',
        time: `${reps} ครั้งต่อรอบ 1-2 รอบ พัก 60-90 วินาที`,
        type: painAdaptation
          ? 'ลุกจากเก้าอี้สูง ลดช่วง และใช้มือเท่าที่จำเป็น'
          : 'ลุกยืนจากเก้าอี้มั่นคง ใช้มือเท่าที่จำเป็น',
        restSeconds: '60-90',
      };
    }

    const reps = Math.max(4, Math.min(10, Math.floor(input.chairStandReps * 0.6)));
    return {
      frequency: '3 วันต่อสัปดาห์',
      intensity: 'เหนื่อยประมาณ 3-5/10 และยังควบคุมการนั่งลงได้',
      time: `${reps} ครั้งต่อรอบ 2 รอบ พัก 60 วินาที`,
      type: painAdaptation
        ? 'ใช้เก้าอี้สูงหรือลดช่วงก่อนเพิ่มจำนวน'
        : 'ลดการใช้มือเมื่อทำได้ปลอดภัย ไม่เร่งความเร็ว',
      restSeconds: '60',
    };
  }

  function buildIntervalWalking(input, levelId) {
    const deviceNote = input.modifiers.includes('walking_aid')
      ? ' ใช้อุปกรณ์เดิมโดยไม่ลดหรือเลิกใช้เอง'
      : '';
    if (levelId === 'cautious') {
      return {
        frequency: '4-5 วันต่อสัปดาห์',
        intensity: 'เหนื่อยประมาณ 2-3/10',
        time: 'เดิน 30-60 วินาที สลับพัก 60-120 วินาที 3-5 รอบ รวม 4-8 นาที',
        type: `เดินทางราบในบ้าน ใกล้จุดพัก และมีผู้ดูแลใกล้ ๆ${deviceNote}`,
      };
    }
    if (levelId === 'rebuilding') {
      return {
        frequency: '5 วันต่อสัปดาห์',
        intensity: 'เหนื่อยประมาณ 3-4/10',
        time: 'เดิน 1-2 นาที สลับพัก 60-90 วินาที 3-5 รอบ รวม 6-12 นาที',
        type: `เดินทางราบในบ้านและกิจวัตรจริง ไม่เร่งความเร็ว${deviceNote}`,
      };
    }
    return {
      frequency: '5-6 วันต่อสัปดาห์',
      intensity: 'เหนื่อยประมาณ 3-5/10',
      time: 'เดิน 3-5 นาที สลับพักประมาณ 60 วินาที 3-4 รอบ รวม 12-20 นาที',
      type: `เพิ่มเวลาต่อเนื่องก่อนเพิ่มความเร็วหรือความซับซ้อน${deviceNote}`,
    };
  }

  function buildSchedule(levelId) {
    const schedules = {
      cautious: [
        'ลุกยืนเบา + เดินช่วงสั้น', 'พักและทำกิจวัตรเบา', 'เดินช่วงสั้น',
        'พัก', 'ลุกยืนเบา + เดินช่วงสั้น', 'กิจวัตรเบา', 'พักและทบทวนอาการ',
      ],
      rebuilding: [
        'ลุกยืน + เดินตามระดับ', 'เดินตามระดับ', 'พักหรือกิจวัตรเบา',
        'ลุกยืน + เดินตามระดับ', 'เดินตามระดับ', 'เดินเบา', 'พักและทบทวนอาการ',
      ],
      advancing: [
        'ลุกยืน + เดินตามระดับ', 'เดินตามระดับ', 'ลุกยืน + เดินเบา',
        'เดินตามระดับ', 'ลุกยืน + เดินตามระดับ', 'เดินลดปริมาณ', 'พักและทบทวนอาการ',
      ],
    };
    return schedules[levelId].map((activityTh, index) => ({
      dayTh: `วันที่ ${index + 1}`,
      activityTh,
    }));
  }

  function buildProgressionRules() {
    return [
      'ทำระดับเดิมอย่างน้อย 2-3 ครั้งก่อนเพิ่ม',
      'เพิ่มเมื่อเหนื่อยไม่เกิน 3/10 และกลับมาไม่เกิน 2/10 ภายใน 2 นาที',
      'เพิ่มเวลาเดิน 30-60 วินาที หรือเพิ่มลุกยืน 1 ครั้ง โดยเพิ่มเพียงอย่างเดียวต่อครั้ง',
    ];
  }

  function buildRegressionRules(input) {
    const rules = [
      'ถ้าเหนื่อยตั้งแต่ 7/10 หรือฟื้นนานกว่า 5 นาที ให้ลดหนึ่งระดับและเพิ่มเวลาพัก',
      'ถ้าวันถัดไปล้ามากหรือกิจวัตรแย่ลง ให้ลดปริมาณครั้งต่อไป',
      'เจ็บหน้าอก หอบขณะพัก เป็นลม หรือมีอาการทางระบบประสาทใหม่ ให้หยุดและพบแพทย์',
    ];
    if (input.painScore >= 5) rules.unshift('หากปวดเพิ่ม ให้ใช้เก้าอี้สูง ลดช่วง และหยุดก่อนอาการมากขึ้น');
    return rules;
  }

  function buildModifierNotes(input) {
    const notes = [];
    if (input.modifiers.includes('stable_cardiopulmonary_limit')) {
      notes.push('โรคหัวใจหรือปอด: เริ่มเบา เพิ่มช่วงอุ่นเครื่องและผ่อนลง และติดตามอาการระหว่างฝึก');
    }
    if (input.modifiers.includes('diabetes_foot')) {
      notes.push('เบาหวานหรือชาเท้า: ตรวจเท้า รองเท้า เวลาอาหาร/ยา และสัญญาณน้ำตาลต่ำก่อนฝึก');
    }
    if (input.modifiers.includes('kidney_dialysis')) {
      notes.push('โรคไตหรือฟอกไต: ลดปริมาณในวันที่อ่อนเพลียหรือหลังฟอกไต');
    }
    if (input.modifiers.includes('cancer_rapid_loss')) {
      notes.push('น้ำหนักหรือกล้ามเนื้อลดเร็ว: ใช้ปริมาณน้อยแต่สม่ำเสมอ เพิ่มวันพัก และประสานทีมรักษา');
    }
    if (input.modifiers.includes('osteoporosis')) {
      notes.push('กระดูกพรุน: ควบคุมการลุกนั่งและเดิน เลี่ยงแรงกระแทก การบิดหรือก้มหลังแรง');
    }
    if (input.modifiers.includes('walking_aid')) {
      notes.push('อุปกรณ์ช่วยเดิน: ใช้อุปกรณ์เดิมต่อและให้นักกายภาพตรวจความสูงกับวิธีใช้');
    }
    return notes;
  }

  function buildPtAssessments(input) {
    const assessments = ['การตอบสนองของชีพจร ความดัน และอาการระหว่างเพิ่มกิจกรรม'];
    if (input.chairStandReps <= 4 || input.painScore >= 5) {
      assessments.push('รูปแบบการลุกยืน การชดเชย และความสูงเก้าอี้ที่เหมาะสม');
    }
    if (input.modifiers.includes('walking_aid')) {
      assessments.push('ความเหมาะสมของอุปกรณ์ช่วยเดินกับพื้นที่จริงในบ้าน');
    }
    if (input.modifiers.includes('stable_cardiopulmonary_limit')) {
      assessments.push('ความทนทานต่อกิจกรรมและการกำหนดช่วงพักที่ปลอดภัย');
    }
    return assessments;
  }

  function buildPtPriority(input, levelId) {
    return levelId === 'cautious'
      || input.chairStandReps === 0
      || input.painScore >= 5
      || input.modifiers.length > 0
      ? 'recommended'
      : 'optional';
  }

  function buildReturnStrengthPlan(rawInput) {
    const input = normalize(rawInput);
    const route = getRoute(input);
    if (route !== 'personal_plan') return makeRouteResult(route, input);
    const levelId = getLevel(input);
    return {
      route,
      levelId,
      levelLabelTh: LEVEL_LABELS[levelId],
      sitToStand: buildSitToStand(input, levelId),
      intervalWalking: buildIntervalWalking(input, levelId),
      schedule: buildSchedule(levelId),
      progressionRulesTh: buildProgressionRules(levelId),
      regressionRulesTh: buildRegressionRules(input),
      modifierNotesTh: buildModifierNotes(input),
      ptPriority: buildPtPriority(input, levelId),
      ptAssessmentTh: buildPtAssessments(input),
      trackingBaseline: {
        walkDistanceMeters: input.walkDistanceMeters,
        postWalkExertion: input.postWalkExertion,
        recoveryMinutes: input.recoveryMinutes,
        chairStandReps: input.chairStandReps,
      },
      validationErrorsTh: [],
      input,
    };
  }

  return { buildReturnStrengthPlan };
});
