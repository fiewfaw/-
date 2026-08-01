(function attachKneeRecoveryPersonalization(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.KneeRecoveryPersonalization = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createKneeRecoveryPersonalization() {
  const TREATMENTS = [
    'total_knee_replacement',
    'partial_knee_replacement',
    'patella_fracture',
    'tibial_plateau_fracture',
    'distal_femur_fracture',
    'other_peri_knee_fracture',
    'nonoperative_fracture',
    'unsure',
  ];
  const WEIGHT_BEARING = [
    'non_weight_bearing',
    'toe_touch',
    'partial',
    'weight_bearing_as_tolerated',
    'full',
    'unknown',
  ];
  const MOTION_ORDERS = [
    'range_as_tolerated',
    'fixed_limit',
    'locked_extension',
    'no_active_knee_motion',
    'unknown',
  ];
  const BRACE_STATUSES = ['none', 'hinged', 'locked', 'cast', 'unknown'];
  const SIDES = ['left', 'right', 'both', 'unsure'];
  const AIDS = ['none', 'stick', 'crutches', 'walker', 'wheelchair', 'other'];
  const SWELLING_TRENDS = ['decreasing', 'stable', 'increasing', 'unsure'];
  const FRACTURE_TREATMENTS = new Set([
    'patella_fracture',
    'tibial_plateau_fracture',
    'distal_femur_fracture',
    'other_peri_knee_fracture',
    'nonoperative_fracture',
  ]);
  const EMERGENCY_FLAGS = new Set([
    'chest_pain',
    'severe_shortness_of_breath',
    'collapse',
    'cold_numb_foot',
    'new_deformity',
  ]);
  const MEDICAL_REVIEW_FLAGS = new Set([
    'wound_infection',
    'calf_dvt',
    'rapid_swelling',
    'new_fall',
  ]);

  const TREATMENT_LABELS = {
    total_knee_replacement: 'ผ่าตัดเปลี่ยนข้อเข่าเทียมทั้งหมด',
    partial_knee_replacement: 'ผ่าตัดเปลี่ยนข้อเข่าเทียมบางส่วน',
    patella_fracture: 'กระดูกสะบ้าหัก',
    tibial_plateau_fracture: 'กระดูกหน้าแข้งส่วนบนหักบริเวณผิวข้อเข่า',
    distal_femur_fracture: 'กระดูกต้นขาส่วนปลายหักเหนือเข่า',
    other_peri_knee_fracture: 'กระดูกหักรอบข้อเข่าชนิดอื่น',
    nonoperative_fracture: 'รักษากระดูกหักโดยไม่ผ่าตัด',
    unsure: 'ยังไม่แน่ใจชนิดการรักษา',
  };

  function isNumberInRange(value, min, max) {
    return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
  }

  function isOptionalNumberInRange(value, min, max) {
    return value == null || value === '' || isNumberInRange(value, min, max);
  }

  function validateInput(input) {
    const errors = [];
    if (!input || typeof input !== 'object') return ['ไม่พบข้อมูลสำหรับสร้างแผน'];
    if (!TREATMENTS.includes(input.treatmentType)) errors.push('ชนิดการรักษาไม่ถูกต้อง');
    if (!WEIGHT_BEARING.includes(input.weightBearingStatus)) errors.push('คำสั่งลงน้ำหนักไม่ถูกต้อง');
    if (!MOTION_ORDERS.includes(input.kneeMotionOrder)) errors.push('คำสั่งการขยับเข่าไม่ถูกต้อง');
    if (!BRACE_STATUSES.includes(input.braceStatus)) errors.push('ข้อมูลเฝือกหรือสนับเข่าไม่ถูกต้อง');
    if (!SIDES.includes(input.affectedSide)) errors.push('ข้างที่รักษาไม่ถูกต้อง');
    if (!AIDS.includes(input.currentAid)) errors.push('อุปกรณ์ช่วยเดินไม่ถูกต้อง');
    if (!SWELLING_TRENDS.includes(input.swellingTrend)) errors.push('แนวโน้มอาการบวมไม่ถูกต้อง');
    if (!isNumberInRange(input.painAtRest, 0, 10)) errors.push('คะแนนปวดขณะพักต้องอยู่ระหว่าง 0-10');
    if (!isNumberInRange(input.painWithMovement, 0, 10)) errors.push('คะแนนปวดขณะขยับต้องอยู่ระหว่าง 0-10');
    if (!isOptionalNumberInRange(input.kneeFlexionDegrees, 0, 180)) errors.push('มุมงอเข่าต้องอยู่ระหว่าง 0-180 องศา');
    if (!isOptionalNumberInRange(input.kneeExtensionDeficitDegrees, 0, 90)) errors.push('มุมเหยียดเข่าที่ยังขาดต้องอยู่ระหว่าง 0-90 องศา');
    if (!isOptionalNumberInRange(input.maximumFlexionOrder, 0, 180)) errors.push('มุมงอสูงสุดตามคำสั่งต้องอยู่ระหว่าง 0-180 องศา');
    if (input.kneeMotionOrder === 'fixed_limit' && !isNumberInRange(input.maximumFlexionOrder, 0, 180)) {
      errors.push('ต้องระบุมุมงอเข่าสูงสุดตามคำสั่งแพทย์');
    }
    for (const [key, label] of [
      ['mobilityBedChair', 'การขยับบนเตียงและย้ายตัว'],
      ['mobilitySitToStand', 'การลุกยืน'],
      ['mobilityIndoorWalking', 'การเดินในบ้าน'],
    ]) {
      if (![0, 1, 2].includes(input[key])) errors.push(`คะแนน${label}ต้องเป็น 0, 1 หรือ 2`);
    }
    if (!isOptionalNumberInRange(input.walkingMinutes, 0, 240)) errors.push('เวลาเดินต้องอยู่ระหว่าง 0-240 นาที');
    if (!isOptionalNumberInRange(input.fiveTimesSitToStandSeconds, 1, 300)) errors.push('เวลาลุกยืน 5 ครั้งไม่ถูกต้อง');
    return errors;
  }

  function blankResult(route) {
    return {
      route,
      levelId: 'level_0',
      levelLabelTh: '',
      treatmentKnowledgeId: 'unsure',
      healingTimelineType: 'replacement',
      mobilityTotal: 0,
      problemBlocks: [],
      circulationRoutine: null,
      starterActivities: [],
      activities: [],
      schedule: [],
      activeOrdersTh: [],
      activeWarningsTh: [],
      verificationTasksTh: [],
      optionalAssessments: { kneeRange: false, walking: false, fiveTimesSitToStand: false },
      progressionRulesTh: [],
      regressionRulesTh: [],
      ptAssessmentTh: [],
      validationErrorsTh: [],
      aiSummaryTh: '',
    };
  }

  function invalidResult(errors) {
    const result = blankResult('invalid_input');
    result.validationErrorsTh = errors;
    result.activeWarningsTh = ['ข้อมูลบางส่วนยังไม่ครบหรือไม่ถูกต้อง จึงยังสร้างแผนไม่ได้'];
    return result;
  }

  function routeRedFlags(redFlags) {
    for (const [key, active] of Object.entries(redFlags || {})) {
      if (active && EMERGENCY_FLAGS.has(key)) return 'emergency';
    }
    for (const [key, active] of Object.entries(redFlags || {})) {
      if (active && MEDICAL_REVIEW_FLAGS.has(key)) return 'medical_review';
    }
    return null;
  }

  function stoppedResult(route, input) {
    const result = blankResult(route);
    result.treatmentKnowledgeId = input.treatmentType;
    result.healingTimelineType = FRACTURE_TREATMENTS.has(input.treatmentType) ? 'fracture' : 'replacement';
    result.activeWarningsTh = route === 'emergency'
      ? ['หยุดแบบประเมินและขอความช่วยเหลือทางการแพทย์ฉุกเฉินก่อน']
      : ['หยุดเพิ่มโปรแกรมและติดต่อโรงพยาบาลหรือทีมผ่าตัดเพื่อประเมินอาการก่อน'];
    result.aiSummaryTh = buildAiSummary(input, result);
    return result;
  }

  function buildOrderGates(input) {
    const weightKnown = input.weightBearingStatus !== 'unknown';
    const motionKnown = input.kneeMotionOrder !== 'unknown';
    const allowsWeightBearing = ['partial', 'weight_bearing_as_tolerated', 'full'].includes(input.weightBearingStatus);
    const allowsRange = motionKnown
      && !['locked_extension', 'no_active_knee_motion'].includes(input.kneeMotionOrder)
      && input.braceStatus !== 'cast'
      && input.braceStatus !== 'locked';
    const allowsActiveMotion = motionKnown
      && input.kneeMotionOrder !== 'no_active_knee_motion'
      && input.braceStatus !== 'cast';
    return {
      weightKnown,
      motionKnown,
      allowsWeightBearing,
      allowsRange,
      allowsActiveMotion,
      maximumFlexion: input.kneeMotionOrder === 'fixed_limit' ? input.maximumFlexionOrder : null,
    };
  }

  function selectLevel(input, gates) {
    if (input.mobilityBedChair === 0) return 'level_0';
    if (!gates.weightKnown || !gates.motionKnown) return 'level_1';
    if (!gates.allowsWeightBearing) return 'level_1';
    if (input.mobilitySitToStand < 2 || input.mobilityIndoorWalking < 2) return 'level_2';
    return 'level_3';
  }

  function buildActiveOrders(input, gates) {
    const orders = [];
    const weightLabels = {
      non_weight_bearing: 'ยังห้ามลงน้ำหนักที่ขาข้างรักษา',
      toe_touch: 'แตะปลายเท้าเพื่อทรงตัวเท่านั้น ไม่ถ่ายน้ำหนักเกินคำสั่ง',
      partial: 'ลงน้ำหนักได้บางส่วนตามคำสั่งและต้องใช้อุปกรณ์ช่วย',
      weight_bearing_as_tolerated: 'ลงน้ำหนักได้เท่าที่อาการยอมรับ โดยใช้อุปกรณ์ตามที่สอนไว้',
      full: 'ลงน้ำหนักได้เต็มตามคำสั่ง แต่ยังต้องรักษาคุณภาพและความปลอดภัย',
      unknown: 'ยังไม่ทราบคำสั่งลงน้ำหนัก จึงยังไม่เพิ่มท่ายืนหรือเดิน',
    };
    orders.push(weightLabels[input.weightBearingStatus]);
    if (!gates.motionKnown) orders.push('ยังไม่ทราบว่าขยับเข่าได้แค่ไหน จึงยังไม่เพิ่มท่างอหรือเหยียดเข่า');
    if (input.kneeMotionOrder === 'range_as_tolerated') orders.push('ขยับเข่าได้ตามอาการ ภายในคำแนะนำของทีมผ่าตัด');
    if (input.kneeMotionOrder === 'fixed_limit') orders.push(`งอเข่าได้ไม่เกิน ${input.maximumFlexionOrder}° ตามคำสั่ง`);
    if (input.kneeMotionOrder === 'locked_extension') orders.push('ต้องคงเข่าเหยียดตรงและล็อกสนับเข่าตามคำสั่ง');
    if (input.kneeMotionOrder === 'no_active_knee_motion') orders.push('ยังไม่ให้ขยับเข่าด้วยแรงของตนเอง');
    if (input.braceStatus === 'cast') orders.push('มีเฝือกป้องกันเข่า ห้ามทดสอบมุมเข่าด้วยตนเอง');
    return orders;
  }

  function fitt(frequency, intensity, time, type) {
    return { frequency, intensity, time, type };
  }

  function activity(id, titleTh, summaryTh, fittValue) {
    return { id, titleTh, summaryTh, fitt: fittValue };
  }

  function circulationActivity() {
    return activity(
      'ankle_pump',
      'กระดกข้อเท้าเป็นจังหวะ',
      'ขยับปลายเท้าขึ้นและลงในช่วงสบาย เพื่อช่วยการไหลเวียน ไม่ใช้แทนยาป้องกันลิ่มเลือด',
      fitt('ทุกช่วงที่ตื่นตามคำแนะนำโรงพยาบาล', 'เบาและไม่ฝืนข้อเท้า', '10 ครั้งต่อรอบ', 'ขยับข้อเท้าขึ้นและลง'),
    );
  }

  function quadSetActivity() {
    return activity(
      'quadriceps_setting',
      'เกร็งกล้ามเนื้อหน้าขาโดยไม่ขยับเข่า',
      'เกร็งหน้าขาให้เข่ามั่นคงขึ้น โดยไม่เบ่งหรือกลั้นหายใจ',
      fitt('3-4 รอบต่อวัน', 'เกร็งชัดแต่ไม่ทำให้ปวดหรือบวมเพิ่ม', '5-10 ครั้ง ค้างครั้งละไม่เกิน 5 วินาที', 'การเกร็งกล้ามเนื้อแบบเข่าอยู่นิ่ง'),
    );
  }

  function positioningActivity() {
    return activity(
      'swelling_positioning',
      'จัดท่าพักและติดตามอาการบวม',
      'จัดขาตามคำแนะนำที่ได้รับและแบ่งกิจกรรมเป็นช่วงสั้นเพื่อไม่ให้อาการบวมสะสม',
      fitt('ตรวจอาการก่อนและหลังทำกิจกรรม', 'ไม่ฝืนและไม่ปรับเฝือกหรือสนับเข่าเอง', 'พักเป็นช่วงตามอาการ', 'การจัดท่าและติดตามอาการ'),
    );
  }

  function heelSlideActivity(input, gates) {
    const limit = gates.maximumFlexion == null
      ? 'เลื่อนในช่วงสบายและไม่ฝืน'
      : `เลื่อนไม่เกิน ${gates.maximumFlexion}° ตามคำสั่ง`;
    return activity(
      'heel_slide',
      'เลื่อนส้นเท้าเพื่อฝึกงอเข่า',
      'เลื่อนส้นเท้าเข้าหาตัวช้า ๆ แล้วกลับสู่ท่าเริ่ม โดยคุมแนวเข่า',
      fitt('3-5 รอบสั้นต่อวัน', limit, '5-10 ครั้งต่อรอบ', 'ฝึกงอเข่าในช่วงที่อนุญาต'),
    );
  }

  function extensionActivity() {
    return activity(
      'supported_knee_extension',
      'ฝึกให้เข่าเหยียดได้ดีขึ้น',
      'รองรับบริเวณส้นเท้าตามภาพ ปล่อยให้เข่าเหยียดอย่างนุ่มนวลโดยไม่กดเข่าลง',
      fitt('2-4 รอบต่อวัน', 'ตึงได้เล็กน้อยแต่ไม่ปวดแหลม', 'ค้าง 20-60 วินาทีตามอาการ', 'ฝึกช่วงเหยียดเข่าแบบมีการรองรับ'),
    );
  }

  function seatedExtensionActivity() {
    return activity(
      'seated_knee_extension',
      'เหยียดเข่าในท่านั่งอย่างควบคุม',
      'เหยียดเข่าเท่าที่ทำได้โดยไม่เหวี่ยงขา แล้วลดลงช้า ๆ',
      fitt('2-3 รอบต่อวัน', 'เบาถึงปานกลางและไม่ทำให้อาการบวมเพิ่ม', '5-10 ครั้งต่อรอบ', 'ฝึกกำลังหน้าขาในช่วงที่อนุญาต'),
    );
  }

  function sitToStandActivity() {
    return activity(
      'sit_to_stand',
      'ลุกยืนจากเก้าอี้ด้วยอุปกรณ์ที่กำหนด',
      'ใช้เก้าอี้มั่นคงและทำตามลำดับที่โรงพยาบาลสอน โดยมีคนเฝ้าเมื่อยังไม่มั่นใจ',
      fitt('1-3 รอบต่อวัน', 'คุมการลงน้ำหนักตามคำสั่ง', '3-5 ครั้งต่อรอบ', 'กิจกรรมลุกจากเก้าอี้'),
    );
  }

  function walkingActivity(input) {
    const baseline = typeof input.walkingMinutes === 'number' && input.walkingMinutes > 0
      ? Math.max(1, Math.floor(input.walkingMinutes))
      : 2;
    return activity(
      'supported_walk',
      'เดินระยะสั้นด้วยอุปกรณ์ตามคำสั่ง',
      'เดินในเส้นทางโล่ง มีจุดพัก และหยุดก่อนรูปแบบการเดินเสียหรืออาการเพิ่มชัดเจน',
      fitt('2-5 รอบสั้นต่อวัน', 'จังหวะสบายและลงน้ำหนักตามคำสั่ง', `${baseline} นาทีต่อรอบ แล้วประเมินอาการ`, 'ฝึกเดินในบ้านด้วยอุปกรณ์ที่ใช้อยู่'),
    );
  }

  function selectActivities(input, gates, levelId) {
    const activities = [];
    if (gates.allowsActiveMotion) activities.push(quadSetActivity());
    if (gates.allowsRange) {
      const flexionIsPriority = input.kneeFlexionDegrees == null || input.kneeFlexionDegrees < 95;
      const extensionIsPriority = input.kneeExtensionDeficitDegrees != null && input.kneeExtensionDeficitDegrees >= 5;
      if (flexionIsPriority) activities.push(heelSlideActivity(input, gates));
      if (extensionIsPriority) activities.push(extensionActivity());
      if (!flexionIsPriority && !extensionIsPriority && gates.allowsActiveMotion) activities.push(seatedExtensionActivity());
    }
    if (gates.allowsWeightBearing && ['level_2', 'level_3'].includes(levelId) && input.mobilitySitToStand >= 1) {
      activities.push(sitToStandActivity());
    }
    if (gates.allowsWeightBearing && ['level_2', 'level_3'].includes(levelId) && input.mobilityIndoorWalking >= 1) {
      activities.push(walkingActivity(input));
    }
    if (!activities.length) activities.push(positioningActivity());
    return activities.slice(0, 4);
  }

  function selectStarterActivities(input, gates, levelId, circulationRoutine, activities) {
    const starter = [];
    if (circulationRoutine) starter.push(circulationRoutine);
    const priority = activities.find((item) => item.id !== 'supported_walk') || activities[0] || positioningActivity();
    if (!starter.some((item) => item.id === priority.id)) starter.push(priority);
    if (starter.length < 2 && gates.allowsWeightBearing && ['level_2', 'level_3'].includes(levelId)) {
      const walking = activities.find((item) => item.id === 'supported_walk');
      if (walking) starter.push(walking);
    }
    return starter.slice(0, 2);
  }

  function buildProblemBlocks(input, gates) {
    return [
      {
        id: 'symptom_recovery',
        titleTh: 'อาการบวมและปวดกำลังบอกว่าร่างกายรับกิจกรรมได้แค่ไหน',
        explanationTh: 'อาการหลังผ่าตัดหรือกระดูกหักเปลี่ยนได้ในแต่ละวัน จึงควรดูทั้งระดับปวด แนวโน้มบวม แผล และอาการที่น่องร่วมกัน',
        managementTh: 'แบ่งกิจกรรมเป็นช่วงสั้น ติดตามอาการก่อนและหลังฝึก และทำตามคำแนะนำเรื่องแผล ความเย็น การยกขา และยาที่ได้รับ',
        selfAssessmentAvailable: true,
        ptAssessmentTh: 'แยกอาการบวมตามระยะฟื้นตัวออกจากภาวะแทรกซ้อน และตรวจการไหลเวียนเมื่อมีข้อสงสัย',
      },
      {
        id: 'knee_range',
        titleTh: 'เข่ายังเหยียดหรืองอได้ไม่พอกับกิจกรรมที่ต้องทำ',
        explanationTh: 'การเหยียดเข่ามีผลต่อการยืนและเดิน ส่วนการงอเข่ามีผลต่อการนั่ง ลุก และขึ้นลงระดับ แต่ต้องอยู่ภายในคำสั่งการรักษา',
        managementTh: gates.allowsRange
          ? 'ใช้ค่ามุมเข่าเลือกว่าจะเน้นการเหยียดหรือการงอ และฝึกเพียงช่วงที่แพทย์อนุญาต'
          : 'ยังไม่ควรทดสอบหรือเพิ่มมุมเข่าจนกว่าจะทราบคำสั่งและข้อจำกัดที่ชัดเจน',
        selfAssessmentAvailable: gates.allowsRange,
        ptAssessmentTh: 'วัดมุมข้อเข่าด้วยเครื่องมือ ตรวจคุณภาพการเคลื่อนไหว และแยกข้อจำกัดจากปวด บวม กล้ามเนื้อ หรือโครงสร้าง',
      },
      {
        id: 'mobility',
        titleTh: 'กำลังขาและการเดินยังไม่กลับมาเพียงพอสำหรับการใช้ชีวิตในบ้าน',
        explanationTh: 'ความพร้อมในการลุกและเดินขึ้นกับกำลังขา คำสั่งลงน้ำหนัก อุปกรณ์ และความช่วยเหลือที่มีในบ้าน',
        managementTh: gates.allowsWeightBearing
          ? 'เริ่มจากระดับที่ทำได้อย่างปลอดภัย ใช้อุปกรณ์ตามคำสั่ง และเพิ่มเวลาหรือจำนวนครั้งทีละอย่าง'
          : 'ยังไม่เพิ่มท่ายืนหรือเดิน ให้เน้นการขยับบนเตียงและเก้าอี้ตามวิธีที่ทีมรักษาสอนไว้',
        selfAssessmentAvailable: true,
        ptAssessmentTh: 'ตรวจแรงขา เทคนิคการลุกยืน การลงน้ำหนักจริง ความสูงอุปกรณ์ และเส้นทางเดินในบ้าน',
      },
    ];
  }

  function buildVerificationTasks(gates) {
    const tasks = [];
    if (!gates.weightKnown) tasks.push('ตรวจใบสรุปการรักษาว่าลงน้ำหนักที่ขาข้างรักษาได้เท่าไร');
    if (!gates.motionKnown) tasks.push('ตรวจคำสั่งว่างอ เหยียด หรือขยับเข่าได้แค่ไหน และต้องล็อกสนับเข่าหรือไม่');
    return tasks;
  }

  function buildWarnings(input) {
    const warnings = [];
    if (input.swellingTrend === 'increasing') warnings.push('อาการบวมกำลังเพิ่ม ควรลดกิจกรรมและประเมินร่วมกับปวด แผล และอาการที่น่อง');
    if (input.painWithMovement >= 7) warnings.push('ปวดขณะขยับค่อนข้างมาก ยังไม่ควรเพิ่มความหนักหรือช่วงการเคลื่อนไหว');
    if (input.ankleMovementRestricted) warnings.push('ข้อเท้าถูกจำกัดการเคลื่อนไหว จึงไม่นำ Ankle Pump มาใช้จนกว่าจะตรวจคำสั่ง');
    return warnings;
  }

  function buildSchedule(activities) {
    const labels = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
    return labels.map((day, index) => ({
      day,
      focusTh: index === 6 ? 'ทบทวนอาการและบันทึกความก้าวหน้า' : 'ทำกิจกรรมตามแผนโดยติดตามปวดและบวม',
      activityIds: activities.map((item) => item.id),
    }));
  }

  function buildAiSummary(input, result) {
    return [
      'ข้อมูลสำหรับให้ AI ช่วยวิเคราะห์ต่อ โดยไม่ใช้แทนการวินิจฉัยหรือคำสั่งทีมผ่าตัด',
      `การรักษา: ${TREATMENT_LABELS[input.treatmentType] || 'ไม่ทราบ'}`,
      `ข้างที่รักษา: ${input.affectedSide || 'ไม่ทราบ'}`,
      `คำสั่งลงน้ำหนัก: ${input.weightBearingStatus || 'ไม่ทราบ'}`,
      `คำสั่งขยับเข่า: ${input.kneeMotionOrder || 'ไม่ทราบ'}`,
      `ปวดขณะพัก/ขยับ: ${input.painAtRest ?? '-'} / ${input.painWithMovement ?? '-'} จาก 10`,
      `แนวโน้มบวม: ${input.swellingTrend || 'ไม่ทราบ'}`,
      `ระดับแผน: ${result.levelId || '-'}`,
      `กิจกรรม: ${(result.activities || []).map((item) => item.titleTh).join(', ') || 'ยังไม่สร้าง'}`,
      `ข้อมูลที่ต้องตรวจเพิ่ม: ${(result.verificationTasksTh || []).join(', ') || 'ไม่มี'}`,
    ].join('\n');
  }

  function buildPlan(input, gates, levelId) {
    const result = blankResult(!gates.weightKnown || !gates.motionKnown ? 'verify_orders' : 'personal_plan');
    const levelLabels = {
      level_0: 'ช่วงฟื้นตัวบนเตียงและเก้าอี้โดยมีผู้ดูแลช่วย',
      level_1: 'ช่วงปกป้องเข่าและรอความพร้อมตามคำสั่งการรักษา',
      level_2: 'ช่วงฝึกลุกยืนและเดินในบ้านโดยมีอุปกรณ์หรือคนช่วย',
      level_3: 'ช่วงเพิ่มความมั่นคงและระยะการเดินในบ้าน',
    };
    result.levelId = levelId;
    result.levelLabelTh = levelLabels[levelId];
    result.treatmentKnowledgeId = input.treatmentType;
    result.healingTimelineType = FRACTURE_TREATMENTS.has(input.treatmentType) ? 'fracture' : 'replacement';
    result.mobilityTotal = input.mobilityBedChair + input.mobilitySitToStand + input.mobilityIndoorWalking;
    result.activeOrdersTh = buildActiveOrders(input, gates);
    result.activeWarningsTh = buildWarnings(input);
    result.verificationTasksTh = buildVerificationTasks(gates);
    result.optionalAssessments = {
      kneeRange: gates.allowsRange,
      walking: gates.allowsWeightBearing && input.mobilityIndoorWalking >= 1,
      fiveTimesSitToStand: gates.allowsWeightBearing
        && levelId === 'level_3'
        && input.mobilitySitToStand === 2
        && input.mobilityIndoorWalking === 2,
    };
    result.problemBlocks = buildProblemBlocks(input, gates);
    result.circulationRoutine = input.ankleMovementRestricted ? null : circulationActivity();
    result.activities = selectActivities(input, gates, levelId);
    result.starterActivities = selectStarterActivities(input, gates, levelId, result.circulationRoutine, result.activities);
    result.schedule = buildSchedule(result.activities);
    result.progressionRulesTh = [
      'เพิ่มเพียงหนึ่งอย่างต่อครั้ง: จำนวนครั้ง เวลาค้าง เวลาเดิน ระดับความช่วยเหลือ แล้วจึงเพิ่มความซับซ้อน',
      'เพิ่มเมื่ออาการปวดและบวมกลับสู่ระดับเดิม และคุณภาพการเคลื่อนไหวยังคงปลอดภัย',
    ];
    result.regressionRulesTh = [
      'ลดจำนวนครั้งหรือแบ่งเป็นรอบสั้นลงเมื่อปวดหรือบวมเพิ่มหลังทำกิจกรรม',
      'หยุดเพิ่มโปรแกรมเมื่อมีแผลผิดปกติ อาการที่น่อง หกล้ม หรืออาการแย่ลงชัดในวันถัดไป',
    ];
    result.ptAssessmentTh = [
      'วัดมุมงอและเหยียดเข่าด้วยเครื่องมือ และตรวจสาเหตุที่ทำให้ติด',
      'ตรวจแรงกล้ามเนื้อหน้าขา เทคนิคการลุกยืน และการลงน้ำหนักจริง',
      'ปรับ walker หรือไม้ค้ำ ตรวจจังหวะเดิน การเลี้ยว และทางเดินในบ้าน',
      'ทบทวนข้อจำกัดจากการผ่าตัด เฝือก สนับเข่า และภาพถ่ายรังสีตามแผนแพทย์',
    ];
    result.aiSummaryTh = buildAiSummary(input, result);
    return result;
  }

  function buildKneeRecoveryPlan(input) {
    const errors = validateInput(input);
    if (errors.length) return invalidResult(errors);
    const urgentRoute = routeRedFlags(input.redFlags);
    if (urgentRoute) return stoppedResult(urgentRoute, input);
    const gates = buildOrderGates(input);
    const levelId = selectLevel(input, gates);
    return buildPlan(input, gates, levelId);
  }

  return { buildKneeRecoveryPlan };
});
