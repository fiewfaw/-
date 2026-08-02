(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ParkinsonMobilityPersonalization = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const CHAIR_RISE = new Set([
    'independent',
    'uses_hands',
    'supervision',
    'physical_assist',
    'unable',
  ]);
  const WALKING_ASSISTANCE = new Set([
    'independent',
    'device',
    'supervision',
    'physical_assist',
    'unable',
  ]);
  const MOVEMENT_PERIODS = new Set(['best', 'variable', 'unclear']);

  function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, Math.round(number)));
  }

  function normalize(raw = {}) {
    return {
      diagnosis: raw.diagnosis === 'confirmed' ? 'confirmed' : 'suspected',
      redFlag: raw.redFlag === true,
      movementPeriod: MOVEMENT_PERIODS.has(raw.movementPeriod)
        ? raw.movementPeriod
        : 'unclear',
      freezingEpisodes7d: clampNumber(raw.freezingEpisodes7d, 0, 30),
      freezingTriggers: Array.isArray(raw.freezingTriggers)
        ? raw.freezingTriggers.filter((item) => typeof item === 'string').slice(0, 6)
        : [],
      chairRise: CHAIR_RISE.has(raw.chairRise) ? raw.chairRise : 'uses_hands',
      walkingAssistance: WALKING_ASSISTANCE.has(raw.walkingAssistance)
        ? raw.walkingAssistance
        : 'supervision',
      fallEvents30d: clampNumber(raw.fallEvents30d, 0, 30),
      orthostaticSymptoms: raw.orthostaticSymptoms === true,
      dualTaskDifficulty: raw.dualTaskDifficulty === true,
      bedMobilityDifficulty: raw.bedMobilityDifficulty === true,
      postureDifficulty: raw.postureDifficulty === true,
    };
  }

  const activityDemoKeys = {
    seated_big_reach: 'seated-reach',
    big_sit_to_stand: 'sit-to-stand',
    seated_weight_shift: 'seated-weight-shift',
    cue_step_turn: 'cue-step-turn',
    bed_roll_sequence: 'bed-roll',
    upright_posture: 'upright-posture',
    single_task_route: 'single-task-route',
  };

  function createActivity(id, titleTh, purposeTh, fitt) {
    return { id, titleTh, purposeTh, fitt, demoKey: activityDemoKeys[id] };
  }

  function largeMovementActivity(input, assisted) {
    if (assisted || input.chairRise === 'unable') {
      return createActivity(
        'seated_big_reach',
        'ขยับลำตัวและเอื้อมแขนให้กว้างในท่านั่ง',
        'ฝึกเริ่มการเคลื่อนไหวให้ชัดและกว้าง โดยยังไม่เสี่ยงลุกยืน',
        {
          frequencyTh: 'วันละ 1–2 รอบ',
          intensityTh: 'เคลื่อนไหวกว้างแต่ยังคุมท่าได้',
          timeTh: '4–6 ครั้งต่อทิศทาง',
          typeTh: 'นั่งบนเก้าอี้มีพนัก มีผู้ดูแลใกล้ ๆ',
        },
      );
    }

    const needsSupport = input.chairRise !== 'independent';
    return createActivity(
      'big_sit_to_stand',
      'ลุกยืนด้วยการเคลื่อนไหวที่ชัดและต่อเนื่อง',
      'เพิ่มขนาดการโน้มตัว การเหยียดสะโพก และการยืนให้สุดท่า',
      {
        frequencyTh: 'วันละ 1–2 รอบ',
        intensityTh: needsSupport ? 'ใช้มือช่วยและมีคนเฝ้า' : 'คุมท่าได้ ไม่รีบ',
        timeTh: needsSupport ? '3–5 ครั้ง' : '5–8 ครั้ง',
        typeTh: 'เก้าอี้มั่นคง วางเท้ากว้างพอดี',
      },
    );
  }

  function gaitActivity(input, assisted) {
    if (assisted || input.walkingAssistance === 'unable') {
      return createActivity(
        'seated_weight_shift',
        'ถ่ายน้ำหนักและยกเท้าสลับในท่านั่ง',
        'เตรียมจังหวะซ้าย–ขวาก่อนกลับไปฝึกยืนและก้าวกับผู้เชี่ยวชาญ',
        {
          frequencyTh: 'วันละ 1–2 รอบ',
          intensityTh: 'ไม่กลั้นหายใจและไม่รีบ',
          timeTh: '20–30 วินาที × 2 รอบ',
          typeTh: 'นั่งพิงได้ เท้าวางเต็มพื้น',
        },
      );
    }

    const frequentFreezing = input.freezingEpisodes7d >= 3;
    return createActivity(
      'cue_step_turn',
      'เริ่มก้าวและหมุนตัวตามจังหวะนำ',
      'ใช้เสียงนับหรือเป้าหมายบนพื้นช่วยให้เริ่มก้าวและเปลี่ยนทิศทางได้ต่อเนื่องขึ้น',
      {
        frequencyTh: 'วันละ 1–2 รอบ',
        intensityTh: frequentFreezing ? 'มีคนเฝ้าและทำทีละอย่าง' : 'ช้า ชัด ก้าวกว้าง',
        timeTh: frequentFreezing ? '3–5 เที่ยวสั้น' : '5–8 เที่ยวสั้น',
        typeTh: 'ทางโล่ง ใกล้จุดจับ ฝึกในช่วงเคลื่อนไหวดีที่สุด',
      },
    );
  }

  function optionalActivities(input, assisted) {
    const activities = [];
    if (input.bedMobilityDifficulty) {
      activities.push(createActivity(
        'bed_roll_sequence',
        'พลิกตัวบนเตียงแบบแบ่งเป็นจังหวะ',
        'ใช้สายตา แขน และลำตัวนำการหมุน ลดการติดค้างระหว่างเปลี่ยนท่า',
        {
          frequencyTh: 'ก่อนลุกจากเตียงและก่อนนอน',
          intensityTh: 'ช้าและไม่ดึงแขนผู้ดูแล',
          timeTh: 'ข้างละ 3–5 ครั้ง',
          typeTh: 'ฝึกบนเตียงที่มั่นคง',
        },
      ));
    }
    if (input.postureDifficulty && activities.length < 2) {
      activities.push(createActivity(
        'upright_posture',
        'เปิดอกและตั้งลำตัวให้ตรงก่อนเริ่มเดิน',
        'เตรียมแนวลำตัวและระยะก้าวให้พร้อมก่อนทำกิจกรรมจริง',
        {
          frequencyTh: 'ก่อนเดินทุกครั้ง',
          intensityTh: 'ยืดตัวโดยไม่แอ่นหลัง',
          timeTh: 'ค้าง 5 วินาที × 5 ครั้ง',
          typeTh: assisted ? 'ท่านั่งมีพนัก' : 'นั่งหรือยืนใกล้จุดจับ',
        },
      ));
    }
    if (input.dualTaskDifficulty && activities.length < 2) {
      activities.push(createActivity(
        'single_task_route',
        'ฝึกเส้นทางสำคัญโดยทำทีละอย่าง',
        'ลดสิ่งรบกวนก่อน แล้วค่อยเพิ่มงานที่สองเมื่อเดินพื้นฐานได้ต่อเนื่อง',
        {
          frequencyTh: 'วันละ 1 รอบ',
          intensityTh: 'ไม่มีการถือของหรือคุยระหว่างฝึก',
          timeTh: '3–5 นาที',
          typeTh: 'เส้นทางห้องนอน–ห้องน้ำที่จัดของโล่งแล้ว',
        },
      ));
    }
    return activities;
  }

  function timingNote(input) {
    if (input.movementPeriod === 'best') {
      return 'วางช่วงฝึกไว้ในช่วงที่เคลื่อนไหวได้ดีที่สุดตามแผนยาที่แพทย์กำหนด';
    }
    if (input.movementPeriod === 'variable') {
      return 'บันทึกช่วงเวลาที่เคลื่อนไหวดีและช่วงที่ตัวช้าหรือเท้าติด เพื่อเลือกเวลาฝึกที่ปลอดภัยกว่า';
    }
    return 'ยังไม่ทราบช่วงที่เคลื่อนไหวดีที่สุด ให้เริ่มบันทึกเวลา อาการ และเวลารับประทานยาตามจริง โดยไม่ปรับยาเอง';
  }

  function buildSchedule(assisted) {
    const main = assisted ? 'ขยับกว้างในท่านั่ง + ถ่ายน้ำหนักในท่านั่ง' : 'ลุกยืนกว้าง + เริ่มก้าวตามจังหวะ';
    const light = assisted ? 'ทบทวนการพลิกตัวและพัก' : 'เดินในกิจวัตรตามปกติและบันทึก freezing';
    return [
      { dayTh: 'จันทร์', activityTh: main },
      { dayTh: 'อังคาร', activityTh: assisted ? 'ฝึกท่านั่งช่วงสั้น' : 'ฝึกเริ่มก้าวและหมุนตัว' },
      { dayTh: 'พุธ', activityTh: light },
      { dayTh: 'พฤหัสบดี', activityTh: main },
      { dayTh: 'ศุกร์', activityTh: assisted ? 'ฝึกท่านั่งช่วงสั้น' : 'ฝึกเส้นทางสำคัญในบ้าน' },
      { dayTh: 'เสาร์', activityTh: light },
      { dayTh: 'อาทิตย์', activityTh: 'พักและสรุปอาการตลอดสัปดาห์' },
    ];
  }

  function noExerciseResult(input, route, summaryTh) {
    return {
      input,
      eligible: false,
      route,
      level: null,
      levelLabelTh: '',
      summaryTh,
      timingNoteTh: timingNote(input),
      activities: [],
      schedule: [],
      warningsTh: [],
      ptAssessmentTh: [],
      ptPriority: 'medical_first',
    };
  }

  function buildParkinsonMobilityPlan(raw) {
    const input = normalize(raw);
    if (input.redFlag) {
      return noExerciseResult(
        input,
        'medical_review',
        'มีอาการที่ควรให้แพทย์ประเมินก่อน จึงยังไม่ควรสร้างโปรแกรมฝึกจากข้อมูลชุดนี้',
      );
    }
    if (input.diagnosis !== 'confirmed') {
      return noExerciseResult(
        input,
        'diagnosis_review',
        'ลักษณะการเคลื่อนไหวนี้ควรได้รับการประเมินจากแพทย์ระบบประสาทก่อน แอพไม่สามารถวินิจฉัยโรคพาร์กินสันได้',
      );
    }

    const assisted = input.walkingAssistance === 'physical_assist'
      || input.walkingAssistance === 'unable'
      || input.chairRise === 'physical_assist'
      || input.chairRise === 'unable';
    const safetyFirst = input.freezingEpisodes7d >= 3
      || input.fallEvents30d >= 1
      || input.walkingAssistance === 'supervision'
      || input.orthostaticSymptoms;
    const strategyLevel = input.freezingEpisodes7d >= 1
      || input.movementPeriod !== 'best'
      || input.chairRise !== 'independent';

    const level = assisted
      ? 'assisted_foundation'
      : safetyFirst
        ? 'safety_first'
        : strategyLevel
          ? 'build_strategy'
          : 'maintain_capacity';
    const levelLabels = {
      assisted_foundation: 'สร้างพื้นฐานการเคลื่อนไหวโดยมีผู้ช่วย',
      safety_first: 'ลดช่วงเท้าติดและความเสี่ยงล้มก่อนเพิ่มความยาก',
      build_strategy: 'ฝึกกลยุทธ์ให้เริ่มและต่อการเคลื่อนไหวได้ดีขึ้น',
      maintain_capacity: 'คงความคล่องตัวและป้องกันการเคลื่อนไหวถดถอย',
    };

    const activities = [
      largeMovementActivity(input, assisted),
      gaitActivity(input, assisted),
      ...optionalActivities(input, assisted),
    ].slice(0, 4);

    const warningsTh = [
      'หยุดทันทีหากเจ็บหน้าอก หอบผิดปกติ หน้ามืดจะเป็นลม หรือมีอาการทางระบบประสาทเกิดขึ้นใหม่',
    ];
    if (input.orthostaticSymptoms) {
      warningsTh.unshift('มีอาการหน้ามืดเมื่อลุกเปลี่ยนท่า ให้ลุกช้า นั่งพักก่อนยืน และควรแจ้งทีมรักษา');
    }
    if (input.dualTaskDifficulty) {
      warningsTh.unshift('ช่วงฝึกเดินให้ทำทีละอย่าง งดถือของ คุย หรือหันมองสิ่งอื่นพร้อมกัน');
    }
    if (input.fallEvents30d >= 2) {
      warningsTh.unshift('มีเหตุล้มหรือเกือบล้มซ้ำ ไม่ควรทดลองลดอุปกรณ์หรือเดินคนเดียว');
    }

    const ptPriority = assisted || input.fallEvents30d >= 2 || input.orthostaticSymptoms
      ? 'strongly_recommended'
      : safetyFirst || input.freezingEpisodes7d >= 1
        ? 'recommended'
        : 'optional';

    return {
      input,
      eligible: true,
      route: assisted ? 'assisted_home_rehab' : 'self_training',
      level,
      levelLabelTh: levelLabels[level],
      summaryTh: assisted
        ? 'เริ่มจากการเคลื่อนไหวในท่านั่งและการช่วยเปลี่ยนท่า ก่อนกลับไปฝึกเดินอย่างปลอดภัย'
        : 'คงท่าหลักเดิม แล้วปรับจังหวะ ตัวช่วย จำนวนครั้ง และสภาพแวดล้อมตามอาการจริง',
      timingNoteTh: timingNote(input),
      activities,
      schedule: buildSchedule(assisted),
      progressionTh: [
        'เพิ่มเพียงหนึ่งอย่างต่อครั้ง เช่น เพิ่ม 1–2 ครั้ง เพิ่มระยะเล็กน้อย หรือค่อยลดคำบอกจังหวะ',
        'เพิ่มความยากเมื่อทำได้สองรอบติดต่อกันโดยไม่เกือบล้มและอาการ freezing ไม่เพิ่ม',
      ],
      regressionTh: [
        'หากก้าวสั้นลง ตัวรีบ เท้าติดบ่อยขึ้น หรือเกือบล้ม ให้กลับไปใช้จังหวะนำและลดระยะ',
        'วันที่เคลื่อนไหวไม่ดีให้ลดจำนวนครั้ง เพิ่มเวลาพัก และคงจุดจับหรือผู้ดูแลไว้',
      ],
      warningsTh,
      ptAssessmentTh: [
        'รูปแบบ bradykinesia, rigidity, freezing และการตอบสนองต่อ cue แต่ละชนิด',
        'การลุกยืน เดิน หมุนตัว ทรงตัว และทำกิจกรรมในช่วง ON/OFF จริง',
        'ความดันเมื่อลุกยืน อุปกรณ์ช่วยเดิน จุดเสี่ยงในบ้าน และวิธีช่วยของผู้ดูแล',
      ],
      ptPriority,
    };
  }

  return { buildParkinsonMobilityPlan };
});
