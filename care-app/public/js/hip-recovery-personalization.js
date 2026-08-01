(function attachHipRecoveryPersonalization(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.HipRecoveryPersonalization = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createHipRecoveryPersonalization() {
  const TREATMENTS = new Set([
    'screws_pins',
    'dynamic_hip_screw',
    'intramedullary_nail',
    'hemiarthroplasty',
    'total_hip_replacement',
    'nonoperative_or_unsure',
  ]);
  const WEIGHT_BEARING = new Set([
    'unknown',
    'non_weight_bearing',
    'toe_touch',
    'partial_weight_bearing',
    'weight_bearing_as_tolerated',
    'full_weight_bearing',
  ]);
  const PRECAUTIONS = new Set([
    'posterior_standard',
    'anterior_standard',
    'explicitly_none',
    'surgeon_specific',
    'unknown',
  ]);
  const ARTHROPLASTY = new Set(['hemiarthroplasty', 'total_hip_replacement']);
  const FIXATION = new Set(['screws_pins', 'dynamic_hip_screw', 'intramedullary_nail']);
  const STANDING_ALLOWED = new Set([
    'partial_weight_bearing',
    'weight_bearing_as_tolerated',
    'full_weight_bearing',
  ]);

  const LEVEL_LABELS = {
    level_0: 'ระดับ 0 · ฟื้นการขยับบนเตียงและเตรียมย้ายตัว',
    level_1: 'ระดับ 1 · คงกำลังระหว่างรออนุญาตลงน้ำหนัก',
    level_2: 'ระดับ 2 · ฝึกลุกยืนและเดินโดยมีคนดูแล',
    level_3: 'ระดับ 3 · เพิ่มระยะเดินและกลับสู่กิจวัตรในบ้าน',
  };

  const TREATMENT_LABELS = {
    screws_pins: 'สกรูหรือหมุดยึดกระดูก',
    dynamic_hip_screw: 'แผ่นและสกรู DHS',
    intramedullary_nail: 'แกนดามในโพรงกระดูก IM nail',
    hemiarthroplasty: 'เปลี่ยนข้อสะโพกบางส่วน',
    total_hip_replacement: 'เปลี่ยนข้อสะโพกทั้งหมด',
    nonoperative_or_unsure: 'รักษาโดยไม่ผ่าตัดหรือยังไม่แน่ใจ',
  };

  function toNumber(value) {
    if (value === '' || value === null || typeof value === 'undefined') return Number.NaN;
    return Number(value);
  }

  function optionalNumber(value) {
    if (value === '' || value === null || typeof value === 'undefined') return null;
    return Number(value);
  }

  function uniqueStrings(value) {
    return Array.isArray(value)
      ? [...new Set(value.filter((item) => typeof item === 'string' && item.trim()))]
      : [];
  }

  function normalize(rawInput) {
    const source = rawInput || {};
    const input = {
      treatmentType: source.treatmentType,
      operationDate: typeof source.operationDate === 'string' ? source.operationDate : '',
      operatedSide: source.operatedSide || 'unknown',
      weightBearingStatus: source.weightBearingStatus,
      hipPrecautionStatus: source.hipPrecautionStatus,
      painAtRest: toNumber(source.painAtRest),
      painWithMovement: toNumber(source.painWithMovement),
      casBedTransfer: toNumber(source.casBedTransfer),
      casChairTransfer: toNumber(source.casChairTransfer),
      casIndoorWalking: toNumber(source.casIndoorWalking),
      barthelTotal: optionalNumber(source.barthelTotal),
      walkingMinutes: optionalNumber(source.walkingMinutes),
      sitToStandSeconds: optionalNumber(source.sitToStandSeconds),
      currentAid: source.currentAid || 'walker',
      caregiverAvailable: source.caregiverAvailable === true,
      homeRisks: uniqueStrings(source.homeRisks),
      redFlags: source.redFlags && typeof source.redFlags === 'object' ? source.redFlags : {},
      ankleMovementRestricted: source.ankleMovementRestricted === true,
    };

    const errors = [];
    if (!TREATMENTS.has(input.treatmentType)) errors.push('กรุณาระบุวิธีรักษาหรือเลือกว่ายังไม่แน่ใจ');
    if (!WEIGHT_BEARING.has(input.weightBearingStatus)) errors.push('กรุณาระบุคำสั่งการลงน้ำหนักจากทีมรักษา');
    if (!PRECAUTIONS.has(input.hipPrecautionStatus)) errors.push('กรุณาระบุข้อควรระวังของข้อสะโพก');
    if (!['left', 'right', 'unknown'].includes(input.operatedSide)) errors.push('กรุณาระบุข้างที่รักษา');
    if (!input.operationDate || Number.isNaN(Date.parse(input.operationDate))) errors.push('กรุณาระบุวันที่ผ่าตัดหรือวันที่เริ่มรักษา');
    for (const [value, label] of [
      [input.painAtRest, 'ความปวดขณะพัก'],
      [input.painWithMovement, 'ความปวดขณะขยับ'],
    ]) {
      if (!Number.isFinite(value) || value < 0 || value > 10) errors.push(`${label}ต้องอยู่ระหว่าง 0-10`);
    }
    for (const [value, label] of [
      [input.casBedTransfer, 'การลุกจากเตียง'],
      [input.casChairTransfer, 'การลุกจากเก้าอี้'],
      [input.casIndoorWalking, 'การเดินในบ้าน'],
    ]) {
      if (!Number.isInteger(value) || value < 0 || value > 2) errors.push(`${label}ต้องมีคะแนน 0-2`);
    }
    if (input.barthelTotal !== null
      && (!Number.isInteger(input.barthelTotal) || input.barthelTotal < 0 || input.barthelTotal > 20)) {
      errors.push('คะแนน Barthel Index ต้องเป็นจำนวนเต็มระหว่าง 0-20');
    }
    if (input.walkingMinutes !== null
      && (!Number.isFinite(input.walkingMinutes) || input.walkingMinutes < 0 || input.walkingMinutes > 120)) {
      errors.push('เวลาที่เดินต่อเนื่องต้องอยู่ระหว่าง 0-120 นาที');
    }
    if (input.sitToStandSeconds !== null
      && (!Number.isFinite(input.sitToStandSeconds) || input.sitToStandSeconds <= 0 || input.sitToStandSeconds > 300)) {
      errors.push('เวลาทดสอบลุกยืน 5 ครั้งต้องมากกว่า 0 และไม่เกิน 300 วินาที');
    }
    input.validationErrorsTh = errors;
    input.casTotal = Number.isInteger(input.casBedTransfer)
      && Number.isInteger(input.casChairTransfer)
      && Number.isInteger(input.casIndoorWalking)
      ? input.casBedTransfer + input.casChairTransfer + input.casIndoorWalking
      : null;
    return input;
  }

  function hasFlag(redFlags, keys) {
    return keys.some((key) => redFlags[key] === true);
  }

  function routeFor(input) {
    if (hasFlag(input.redFlags, [
      'chest_pain',
      'severe_breathlessness',
      'collapse_or_confusion',
      'suspected_dislocation',
    ])) return 'emergency';
    if (hasFlag(input.redFlags, [
      'calf_dvt_signs',
      'wound_infection',
      'new_fall_with_pain',
    ])) return 'medical_review';
    if (input.validationErrorsTh.length) return 'invalid_input';
    if (input.weightBearingStatus === 'unknown') return 'verify_orders';
    return 'personal_plan';
  }

  function chooseLevel(input) {
    if (input.casBedTransfer === 0 || input.casChairTransfer === 0) return 'level_0';
    if (['non_weight_bearing', 'toe_touch'].includes(input.weightBearingStatus)) return 'level_1';
    if (input.casIndoorWalking <= 1) return 'level_2';
    return 'level_3';
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

  function circulationRoutine(input) {
    if (input.ankleMovementRestricted) return null;
    return activity(
      'ankle_pump',
      'กระดกข้อเท้าเพื่อลดการคั่งของเลือดและบวม',
      'ช่วยให้กล้ามเนื้อน่องบีบตัวและกระตุ้นการไหลเวียนระหว่างที่ยังเดินน้อย',
      'ทุกชั่วโมงขณะตื่น',
      'เบา สบาย ไม่ฝืนเจ็บ',
      '10 ครั้งต่อรอบ',
      'นอนหรือนั่ง เหยียดเข่าสบาย แล้วกระดกปลายเท้าขึ้น-ลงช้า ๆ',
      'หยุดเมื่อปวดน่อง บวมแดงร้อนมากขึ้น หรือแพทย์สั่งจำกัดการขยับข้อเท้า ท่านี้ไม่แทนยาป้องกันลิ่มเลือดหรือถุงรัดที่แพทย์สั่ง',
      'ankle-pump',
    );
  }

  function levelActivities(levelId, input) {
    const commonSafety = 'ทำช้า ๆ ในช่วงที่ปวดไม่เพิ่มเกิน 2 ระดับจากก่อนฝึก และอาการควรกลับใกล้เดิมภายใน 1-2 ชั่วโมง';
    if (levelId === 'level_0') {
      return [
        activity('quadriceps_set', 'เกร็งกล้ามเนื้อหน้าขา', 'คงกำลังขาระหว่างที่ยังลุกย้ายตัวไม่ปลอดภัย', 'วันละ 2-3 ช่วง', 'เกร็งพอรู้สึกกล้ามเนื้อทำงานและหายใจปกติ', 'ค้าง 3-5 วินาที 6-10 ครั้ง', 'นอนเหยียดเข่า กดหลังเข่าลงบนที่นอนเบา ๆ', commonSafety, 'quad-set'),
        activity('gluteal_set', 'เกร็งกล้ามเนื้อก้น', 'เตรียมกล้ามเนื้อสะโพกสำหรับการย้ายตัวและยืนในขั้นถัดไป', 'วันละ 2-3 ช่วง', 'เกร็งเบา ไม่กลั้นหายใจ', 'ค้าง 3-5 วินาที 6-10 ครั้ง', 'นอนหงาย บีบก้นสองข้างเข้าหากันโดยไม่ยกสะโพก', commonSafety, 'glute-set'),
        activity('caregiver_positioning', 'จัดท่าและพลิกตัวร่วมกับผู้ดูแล', 'ลดการกดทับและช่วยให้การดูแลบนเตียงปลอดภัยขึ้น', 'เปลี่ยนท่าตามแผนผู้ดูแลตลอดวัน', 'ใช้แรงช่วยเท่าที่จำเป็น', 'ครั้งละ 2-5 นาที', 'จัดหมอนรองและพลิกเป็นลำดับ โดยไม่บิดขาข้างผ่าตัด', 'ถ้าผู้ดูแลต้องยกน้ำหนักมากหรือผู้ป่วยปวดมาก ควรให้นักกายภาพสอนวิธีย้ายตัวก่อน', 'positioning'),
        activity('supported_sitting', 'ฝึกนั่งพิงอย่างมั่นคง', 'เตรียมการทรงตัวสำหรับลุกจากเตียงและกิจวัตรบนเก้าอี้', 'วันละ 1-3 ช่วงเมื่อทีมรักษาอนุญาต', 'นั่งแล้วไม่หน้ามืดและไม่ไหลตัว', 'เริ่ม 2-5 นาที', 'นั่งบนเก้าอี้มีพนัก เท้าวางพื้น และมีผู้ดูแลใกล้ ๆ', 'งดถ้ายังไม่เคยได้รับอนุญาตให้นั่งหรือมีอาการหน้ามืด ซึม หรือปวดเพิ่มชัดเจน', 'supported-sitting'),
      ];
    }
    if (levelId === 'level_1') {
      return [
        activity('quadriceps_gluteal_set', 'เกร็งหน้าขาและกล้ามเนื้อก้น', 'รักษากำลังระหว่างรออนุญาตลงน้ำหนัก', 'วันละ 2-3 ช่วง', 'เบาถึงปานกลาง หายใจปกติ', 'ท่าละ 6-10 ครั้ง ค้าง 3-5 วินาที', 'เกร็งหน้าขาและก้นแยกกันโดยไม่ยกสะโพก', commonSafety, 'quad-glute-set'),
        activity('heel_slide_limited', 'เลื่อนส้นเท้าในช่วงที่อนุญาต', 'คงการเคลื่อนไหวเข่าและสะโพกโดยไม่เกินข้อควรระวัง', 'วันละ 1-2 ช่วง', 'ขยับสบาย ไม่ฝืนมุมสะโพก', '5-8 ครั้ง 1-2 รอบ', 'นอนหงาย เลื่อนส้นเท้าเข้าหาตัวช้า ๆ และหยุดก่อนมุมจำกัด', 'ไม่ฝืนงอสะโพกเกินข้อห้าม และหยุดหากปวดแผลหรือขาหนีบเพิ่ม', 'heel-slide'),
        activity('seated_knee_extension', 'เหยียดเข่าในท่านั่ง', 'คงกำลังหน้าขาสำหรับการลุกยืนเมื่อได้รับอนุญาต', 'วันละ 1-2 ช่วง', 'เหยียดเท่าที่ควบคุมได้', '6-10 ครั้ง 1-2 รอบ', 'นั่งพิง เหยียดเข่าข้างรักษาช้า ๆ แล้วลดลง', commonSafety, 'seated-knee-extension'),
        activity('taught_transfer_practice', 'ทบทวนการย้ายตัวที่ทีมรักษาสอนไว้', 'คงความสามารถย้ายเตียง-เก้าอี้โดยไม่ละเมิดคำสั่งลงน้ำหนัก', 'เฉพาะเวลาย้ายตัวจริง', 'ใช้รูปแบบเดิมที่ได้รับการสอน', 'ครั้งละ 1 รอบ', 'วางอุปกรณ์และผู้ช่วยตามคำแนะนำจากโรงพยาบาล', 'ห้ามทดลองวิธีใหม่เอง และไม่ลงน้ำหนักขาข้างรักษาเกินคำสั่ง', 'transfer-practice'),
      ];
    }
    if (levelId === 'level_2') {
      return [
        activity('high_chair_sit_to_stand', 'ลุกยืนจากเก้าอี้สูงอย่างปลอดภัย', 'เพิ่มกำลังขาและความมั่นใจในการย้ายตัว', 'วันละ 1-2 ช่วง 4-6 วันต่อสัปดาห์', 'ปวดไม่เกิน 5/10 และยังควบคุมการนั่งลงได้', '3-6 ครั้ง 1-2 รอบ', 'ใช้เก้าอี้แข็งมีที่วางแขน ดันตัวขึ้นและจับ walker หลังยืนมั่นคง', 'มีผู้ดูแลใกล้ ๆ และทำตามคำสั่งลงน้ำหนักทุกครั้ง', 'high-chair-sit-stand'),
        activity('prescribed_weight_acceptance', 'ฝึกรับน้ำหนักตามคำสั่ง', 'ช่วยให้ขาข้างรักษากลับมารับแรงอย่างเป็นขั้นตอน', 'วันละ 1-2 ช่วง 4-6 วันต่อสัปดาห์', 'ลงน้ำหนักไม่เกินระดับที่ทีมรักษาอนุญาต', 'ถ่ายน้ำหนัก 5-8 ครั้ง 1-2 รอบ', 'ยืนจับ walker แล้วถ่ายน้ำหนักช้า ๆ โดยมีคนเฝ้า', 'งดถ้าไม่ทราบคำสั่งลงน้ำหนักหรือมีปวดแหลม บวมเพิ่ม หรือขาทรุด', 'weight-acceptance'),
        activity('walker_gait', 'เดินระยะสั้นด้วย walker', 'เชื่อมการลงน้ำหนักกับเส้นทางที่ใช้จริงในบ้าน', 'วันละ 2-4 รอบสั้น', 'เหนื่อย 2-4/10 และยังพูดเป็นประโยคได้', 'เริ่ม 1-3 นาทีต่อรอบ', 'เดินบนทางโล่งไปยังจุดใช้งานจริง เช่น ห้องน้ำหรือโต๊ะอาหาร', 'ให้ผู้ดูแลเฝ้าตามระดับ CAS และไม่ลดอุปกรณ์เอง', 'walker-gait'),
        activity('supported_hip_abduction', 'กางขาเล็กน้อยขณะยืนจับ walker', 'เพิ่มกำลังกล้ามเนื้อด้านข้างสะโพกเพื่อช่วยพยุงการเดิน', '3-5 วันต่อสัปดาห์', 'ช่วงสั้น ไม่เอียงลำตัว', '4-8 ครั้ง 1-2 รอบ', 'ยืนจับมั่นคง เลื่อนขาข้างรักษาออกด้านข้างเล็กน้อยแล้วกลับ', 'ทำเฉพาะเมื่ออนุญาตลงน้ำหนักและข้อควรระวังไม่ห้ามท่านี้', 'standing-hip-abduction'),
      ];
    }
    return [
      activity('functional_sit_to_stand', 'ลุกนั่งเพื่อกิจวัตรจริง', 'เพิ่มกำลังและลดการพึ่งมือในระดับที่ยังปลอดภัย', '3-5 วันต่อสัปดาห์', 'เหนื่อย 3-5/10 รูปแบบยังดี', '5-10 ครั้ง 2 รอบ', 'ใช้เก้าอี้มั่นคงและค่อย ๆ ลดการใช้มือเมื่อทำได้ดี', commonSafety, 'functional-sit-stand'),
      activity('progressive_household_walk', 'เพิ่มระยะเดินในบ้านเป็นช่วง', 'เพิ่มความทนทานสำหรับห้องน้ำ โต๊ะอาหาร และทางเดินหลัก', '5-7 วันต่อสัปดาห์', 'เหนื่อย 3-4/10 และปวดไม่เพิ่มต่อเนื่อง', 'เดิน 3-8 นาที 2-4 รอบ', 'เลือกเส้นทางโล่งและใช้ walker หรือไม้เท้าตามเดิม', 'ไม่เพิ่มทั้งระยะและความเร็วในวันเดียวกัน', 'progressive-walk'),
      activity('small_step_turn', 'เลี้ยวด้วยก้าวสั้นหลายก้าว', 'ลดแรงบิดต่อข้อสะโพกและเพิ่มความปลอดภัยในพื้นที่แคบ', 'ฝึกสั้น ๆ ทุกวันที่เดิน', 'ช้าและควบคุมได้', 'เลี้ยวข้างละ 3-5 รอบ', 'หมุนทั้งตัวด้วยก้าวเล็ก ๆ ไม่บิดตัวค้างบนขาข้างเดียว', 'มีจุดจับใกล้ ๆ และงดหมุนเร็ว', 'small-step-turn'),
      activity('step_stair_preparation', 'เตรียมขึ้นลงต่างระดับหรือบันได', 'กลับไปใช้เส้นทางจำเป็นในบ้านอย่างเป็นลำดับ', '2-3 วันต่อสัปดาห์', 'ทำได้โดยไม่เข่าทรุดและยังคุมอุปกรณ์ได้', '3-5 ครั้ง 1-2 รอบ', 'เริ่มจากขั้นเตี้ยพร้อมราวจับและผู้ดูแล', 'ทำเฉพาะเมื่อทีมรักษาอนุญาตและนักกายภาพยืนยันลำดับเท้าแล้ว', 'stair-preparation'),
    ];
  }

  function activePrecautions(input, verificationTasksTh) {
    if (input.hipPrecautionStatus === 'explicitly_none') return [];
    if (input.hipPrecautionStatus === 'posterior_standard') {
      return [
        'ไม่งอสะโพกเกิน 90 องศา ใช้เก้าอี้และโถสุขภัณฑ์ที่สูงพอ',
        'ไม่ไขว้ขาหรือพาขาข้างผ่าตัดข้ามแนวกึ่งกลางลำตัว',
        'ไม่บิดหรือหมุนตัวบนขาข้างผ่าตัด ให้เลี้ยวด้วยก้าวสั้นหลายก้าว',
      ];
    }
    if (input.hipPrecautionStatus === 'anterior_standard') {
      return [
        'หลีกเลี่ยงเหยียดสะโพกไปด้านหลังมากร่วมกับหมุนปลายเท้าออก',
        'เลี้ยวด้วยก้าวสั้นและหลีกเลี่ยงการหมุนตัวค้างบนขาข้างผ่าตัด',
        'ใช้ข้อควรระวังตามเอกสารจำหน่ายของศัลยแพทย์เป็นหลัก',
      ];
    }
    if (input.hipPrecautionStatus === 'surgeon_specific') {
      return ['ทำตามข้อจำกัดเฉพาะที่ศัลยแพทย์หรือทีมรักษาระบุในใบจำหน่าย'];
    }
    if (input.hipPrecautionStatus === 'unknown' && ARTHROPLASTY.has(input.treatmentType)) {
      verificationTasksTh.push('ตรวจข้อห้ามและคำสั่งการเคลื่อนไหวในใบจำหน่ายหรือสอบถามทีมผ่าตัด');
      return [
        'ระหว่างรอยืนยัน ไม่งอสะโพกเกิน 90 องศา',
        'ไม่ไขว้ขาหรือพาข้างผ่าตัดข้ามแนวกึ่งกลาง',
        'ไม่บิดหมุนตัวบนขาข้างผ่าตัด',
      ];
    }
    return [];
  }

  function problemBlocks(input, levelId) {
    const mobilityCopy = levelId === 'level_0'
      ? 'การนั่งและย้ายตัวยังต้องได้รับความช่วยเหลือ จึงต้องเริ่มจากท่าบนเตียงและวิธีช่วยที่ปลอดภัย'
      : 'กำลังขาและการรับน้ำหนักยังไม่พอสำหรับการลุกยืนที่สม่ำเสมอ';
    return [
      {
        id: 'protect_treatment',
        titleTh: 'เคลื่อนไหวให้ปลอดภัยโดยไม่รบกวนส่วนที่รักษา',
        meaningTh: 'คำสั่งลงน้ำหนักและข้อควรระวังต่างกันตามชนิดการผ่าตัด จึงต้องรู้สิ่งที่ทำได้วันนี้ก่อนเพิ่มการฝึก',
        managementTh: 'ใช้คำสั่งจากใบจำหน่ายเป็นขอบเขต และติดตามปวด บวม แผล และอาการผิดปกติทุกวัน',
      },
      {
        id: 'strength_transfer',
        titleTh: 'กำลังขาและการลุกยืนยังไม่กลับมาเต็มที่',
        meaningTh: mobilityCopy,
        managementTh: 'เริ่มท่าเกร็งกล้ามเนื้อหรือลุกยืนจากเก้าอี้สูงตามระดับ แล้วเพิ่มจำนวนเมื่ออาการหลังฝึกกลับใกล้เดิม',
      },
      {
        id: 'walking_home_route',
        titleTh: 'การเดินและอุปกรณ์ต้องเข้ากับบ้านจริง',
        meaningTh: input.homeRisks.length
          ? 'เส้นทางในบ้านมีจุดเสี่ยงที่อาจทำให้ walker ติด เลี้ยวยาก หรือไปห้องน้ำไม่ปลอดภัย'
          : 'แม้ทางเดินไม่มีจุดเสี่ยงเด่น การปรับความสูงอุปกรณ์และลำดับก้าวยังมีผลต่อความปลอดภัย',
        managementTh: 'ฝึกบนเส้นทางจำเป็นระยะสั้น ใช้อุปกรณ์เดิม และให้ผู้ดูแลเฝ้าตามระดับความช่วยเหลือจริง',
      },
    ];
  }

  function timelineFor(treatmentType) {
    if (FIXATION.has(treatmentType)) {
      return [
        { periodTh: 'ช่วงแรก', detailTh: 'ดูแลแผล ลดบวม รักษากำลัง และทำตามคำสั่งลงน้ำหนัก' },
        { periodTh: 'ประมาณ 6-12 สัปดาห์', detailTh: 'มักเป็นช่วงติดตามภาพถ่ายและพิจารณาความก้าวหน้าของการติดกระดูก ไม่ใช่คำรับรองว่ากระดูกติดแล้ว' },
        { periodTh: 'หลายเดือนถัดมา', detailTh: 'เพิ่มกำลัง ระยะเดิน และกิจวัตรตามผลภาพถ่ายและคำสั่งแพทย์' },
      ];
    }
    if (ARTHROPLASTY.has(treatmentType)) {
      return [
        { periodTh: 'ช่วงแรก', detailTh: 'ดูแลแผล บวม การป้องกันข้อหลุด และฝึกย้ายตัวตามคำสั่ง' },
        { periodTh: 'ประมาณ 6-12 สัปดาห์', detailTh: 'มักประเมินแผล เนื้อเยื่อรอบข้อ การเดิน และการใช้อุปกรณ์อีกครั้ง' },
        { periodTh: 'หลายเดือนถัดมา', detailTh: 'เพิ่มความแข็งแรง ความทนทาน และกลับสู่กิจวัตรที่ต้องการ' },
      ];
    }
    return [
      { periodTh: 'ตอนนี้', detailTh: 'ยืนยันชนิดการรักษาและคำสั่งลงน้ำหนักก่อน' },
      { periodTh: 'การติดตามครั้งถัดไป', detailTh: 'ให้แพทย์ใช้อาการและภาพถ่ายตัดสินความพร้อมในการเพิ่มกิจกรรม' },
    ];
  }

  function scheduleFor(levelId, activities) {
    const focus = activities.slice(0, 2).map((item) => item.titleTh).join(' + ');
    return Array.from({ length: 7 }, (_, index) => ({
      day: index + 1,
      focusTh: index === 0
        ? `ตั้งค่าความปลอดภัยและเริ่ม ${focus}`
        : index === 6
          ? 'ทบทวนอาการและเปรียบเทียบกับวันแรก'
          : levelId === 'level_3'
            ? `ทำท่าหลักและเพิ่มการเดินเล็กน้อยในวันที่ ${index + 1}`
            : `ทำท่าหลักตามจำนวนเดิมในวันที่ ${index + 1}`,
    }));
  }

  function baseResult(input, route, levelId, verificationTasksTh, precautions) {
    const circulation = circulationRoutine(input);
    let activities = ['emergency', 'medical_review', 'invalid_input'].includes(route)
      ? []
      : levelActivities(route === 'verify_orders' ? (levelId === 'level_0' ? 'level_0' : 'level_1') : levelId, input);
    activities = activities.slice(0, 4);
    const starterActivities = [];
    if (circulation) starterActivities.push(circulation);
    if (activities[0]) starterActivities.push(activities[0]);
    const barthelRequired = Number.isInteger(input.casTotal)
      && (input.casTotal <= 3 || input.casBedTransfer === 0 || input.casChairTransfer === 0);
    const optionalFiveTimesSitToStand = route === 'personal_plan'
      && STANDING_ALLOWED.has(input.weightBearingStatus)
      && input.casChairTransfer === 2
      && input.painWithMovement <= 7;
    const activeWarningsTh = [];
    if (input.ankleMovementRestricted) activeWarningsTh.push('มีข้อจำกัดการขยับข้อเท้าหรือคำสั่งเฉพาะ จึงงด Ankle Pump จนกว่าจะยืนยันกับทีมรักษา');
    if (!input.caregiverAvailable && ['level_0', 'level_2'].includes(levelId)) activeWarningsTh.push('ระดับนี้ควรมีผู้ดูแลอยู่ใกล้ระหว่างย้ายตัวหรือฝึกเดิน');
    if (input.painWithMovement >= 7) activeWarningsTh.push('ความปวดขณะขยับค่อนข้างสูง ควรลดปริมาณและตรวจหาสาเหตุถ้าปวดไม่ลด');
    if (route === 'verify_orders') activeWarningsTh.push('ยังไม่ทราบคำสั่งลงน้ำหนัก จึงงดการยืนและเดินในแผนนี้ชั่วคราว');

    return {
      route,
      levelId,
      levelLabelTh: LEVEL_LABELS[levelId] || '',
      treatmentLabelTh: TREATMENT_LABELS[input.treatmentType] || '',
      treatmentKnowledgeId: input.treatmentType,
      casTotal: input.casTotal,
      barthelRequired,
      circulationRoutine: circulation,
      starterActivities: starterActivities.slice(0, 2),
      activities,
      schedule: ['emergency', 'medical_review', 'invalid_input'].includes(route) ? [] : scheduleFor(levelId, activities),
      activePrecautionsTh: precautions,
      verificationTasksTh,
      activeWarningsTh,
      healingTimeline: timelineFor(input.treatmentType),
      problemBlocks: problemBlocks(input, levelId),
      optionalAssessments: {
        barthel: barthelRequired,
        walkingBaseline: route === 'personal_plan' && STANDING_ALLOWED.has(input.weightBearingStatus) && input.casIndoorWalking > 0,
        fiveTimesSitToStand: optionalFiveTimesSitToStand,
      },
      ptAssessmentTh: [
        'ตรวจคำสั่งลงน้ำหนัก ชนิดการผ่าตัด และข้อควรระวังให้ตรงกับใบจำหน่าย',
        'ประเมินการย้ายตัว การใช้ walker รูปแบบการเดิน และการรับน้ำหนักของขาข้างรักษา',
        'ตรวจแผล บวม ช่วงการเคลื่อนไหว กำลังกล้ามเนื้อ และเส้นทางจริงในบ้าน',
      ],
      progressionRulesTh: [
        'เพิ่มเพียงหนึ่งอย่างต่อครั้ง ระหว่างจำนวนครั้ง ระยะเดิน หรือจำนวนรอบ',
        'เพิ่มเมื่อทำรูปแบบเดิมได้ปลอดภัย 2 วันติด และปวดหรือบวมกลับใกล้เดิมภายใน 1-2 ชั่วโมง',
      ],
      regressionRulesTh: [
        'ลดจำนวนหรือกลับไประดับก่อน ถ้าปวดหรือบวมเพิ่มต่อเนื่องถึงวันถัดไป',
        'หยุดและขอคำแนะนำเมื่อแผลผิดปกติ ขาทรุด ล้ม หรืออาการโดยรวมแย่ลง',
      ],
      trackingBaseline: {
        casTotal: input.casTotal,
        barthelTotal: input.barthelTotal,
        painAtRest: input.painAtRest,
        painWithMovement: input.painWithMovement,
        walkingMinutes: input.walkingMinutes,
        sitToStandSeconds: input.sitToStandSeconds,
      },
      validationErrorsTh: input.validationErrorsTh,
    };
  }

  function buildHipRecoveryPlan(rawInput) {
    const input = normalize(rawInput);
    const route = routeFor(input);
    const safeLevel = Number.isInteger(input.casTotal) ? chooseLevel(input) : 'level_0';
    const verificationTasksTh = [];
    if (input.weightBearingStatus === 'unknown') {
      verificationTasksTh.push('ดูคำว่า NWB, TTWB, PWB, WBAT หรือ FWB ในใบจำหน่าย');
      verificationTasksTh.push('โทรสอบถามหอผู้ป่วยหรือทีมผ่าตัดก่อนทดลองยืนและเดิน');
    }
    if (input.treatmentType === 'nonoperative_or_unsure') {
      verificationTasksTh.push('ยืนยันชื่อวิธีรักษาจากใบสรุปการรักษาหรือภาพถ่ายเอกสาร');
    }
    const precautions = activePrecautions(input, verificationTasksTh);
    const result = baseResult(input, route, safeLevel, verificationTasksTh, precautions);

    if (route === 'emergency') {
      result.actionSummaryTh = 'หยุดแบบฝึกและขอความช่วยเหลือฉุกเฉินก่อน';
      result.avoidSummaryTh = 'ไม่ควรรอดูอาการหรือทดลองยืนเดินเอง';
    } else if (route === 'medical_review') {
      result.actionSummaryTh = 'หยุดการเพิ่มแบบฝึกและให้แพทย์ประเมินอาการก่อน';
      result.avoidSummaryTh = 'อย่าฝืนเดิน นวดน่อง หรือปิดบังแผลที่ผิดปกติ';
    } else if (route === 'invalid_input') {
      result.actionSummaryTh = 'ตรวจคำตอบที่ยังไม่ครบหรืออยู่นอกช่วงก่อนสร้างแผน';
      result.avoidSummaryTh = 'ระบบจะยังไม่สร้างแบบฝึกจากข้อมูลที่ไม่ครบ';
    } else if (route === 'verify_orders') {
      result.actionSummaryTh = 'ฝึกบนเตียงและเก้าอี้ได้ตามรายการที่ไม่ลงน้ำหนัก พร้อมตรวจคำสั่งจากโรงพยาบาล';
      result.avoidSummaryTh = 'ยังไม่ยืนหรือเดินจนกว่าจะทราบคำสั่งลงน้ำหนัก';
    } else {
      result.actionSummaryTh = `${LEVEL_LABELS[safeLevel]} โดยยึดคำสั่งลงน้ำหนักและอาการหลังฝึกเป็นหลัก`;
      result.avoidSummaryTh = precautions.length
        ? 'ไม่ทำท่าที่เกินข้อควรระวังของข้อสะโพก และไม่ลดอุปกรณ์ช่วยเดินเอง'
        : 'ไม่เพิ่มระยะหรือความหนักเร็วเกินไป และไม่ลดอุปกรณ์ช่วยเดินเอง';
    }
    return result;
  }

  return { buildHipRecoveryPlan };
});
