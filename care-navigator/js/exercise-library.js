(function attachExerciseLibrary(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CareExerciseLibrary = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createExerciseLibrary() {
  const STROKE_PLAN_ID = 'plan_03_stroke_arm_leg';

  function visual(asset, firstFrame, secondFrame, altTh) {
    return {
      asset,
      frames: [firstFrame, secondFrame],
      altTh,
    };
  }

  const definitions = [
    {
      id: 'caregiver_bed_rolling',
      familyId: 'bed_mobility',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'caregiver_assisted', 'bed_mobility'],
      titleTh: 'จัดท่าและฝึกพลิกตัวโดยผู้ดูแล',
      purposeTh: 'ผู้ดูแลช่วยจัดแขนข้างอ่อนแรงให้อยู่ด้านหน้า แล้วช่วยหมุนลำตัวและเชิงกรานทีละขั้นโดยไม่ดึงแขน',
      safetyTh: 'ไม่ควรทดลองทำคนเดียว หากนั่งทรงตัวไม่ได้ควรให้นักกายภาพตรวจการจัดท่า เตียง และวิธีช่วยก่อน',
      visual: visual(
        'media/team4-stroke-demo-grid-c.png',
        'roll-start',
        'roll-end',
        'สาธิตการจัดท่าและพลิกตัวบนเตียงโดยผู้ดูแล',
      ),
    },
    {
      id: 'partial_bridge_supported',
      familyId: 'bridging',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'supported', 'bed_exercise'],
      titleTh: 'ฝึกยกสะโพกเล็กน้อยบนเตียง',
      purposeTh: 'งอเข่า วางเท้ามั่นคง แล้วยกสะโพกเพียงเล็กน้อยโดยมีผู้ดูแลประคองเข่าหรือเชิงกราน',
      safetyTh: 'ใช้เตรียมการพลิกตัวและขยับบนเตียง งดเมื่อมีข้อห้ามหลังผ่าตัดสะโพกหรือกระดูกสันหลัง หรือมีอาการปวดเพิ่ม',
      visual: visual(
        'media/team4-stroke-demo-grid-c.png',
        'bridge-start',
        'bridge-end',
        'สาธิตการยกสะโพกเล็กน้อยบนเตียงโดยมีผู้ดูแล',
      ),
    },
    {
      id: 'trunk_transfer_supported',
      familyId: 'sit_to_stand',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'assisted', 'transfer'],
      titleTh: 'จัดแนวลำตัวและลุกยืนแบบมีผู้ช่วย',
      purposeTh: 'สร้างฐานลำตัวและลำดับการลุกให้ปลอดภัยก่อนเพิ่มจำนวน',
      safetyTh: 'ต้องมีผู้ดูแลที่ได้รับคำแนะนำหรือจุดจับมั่นคง ห้ามดึงแขนข้างอ่อนแรง',
      visual: visual(
        'media/team4-stroke-demo-grid-a.png',
        'sit',
        'stand',
        'สาธิตการจัดแนวลำตัวและลุกยืนแบบมีผู้ช่วยหลังโรคหลอดเลือดสมอง',
      ),
    },
    {
      id: 'arm_table_slide',
      familyId: 'supported_upper_limb_reach',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'upper_limb', 'supported'],
      titleTh: 'เลื่อนแขนข้างอ่อนแรงบนโต๊ะ',
      purposeTh: 'ให้แขนร่วมกิจกรรมโดยลดน้ำหนักของแขนและไม่ดึงข้อไหล่',
      safetyTh: 'ประคองข้อศอกและสะบักหากแขนยังควบคุมได้น้อย หยุดเมื่อปวดไหล่เพิ่ม',
      visual: visual(
        'media/team4-stroke-demo-grid-a.png',
        'arm-start',
        'arm-end',
        'สาธิตการเลื่อนแขนข้างอ่อนแรงบนโต๊ะ',
      ),
    },
    {
      id: 'spasticity_arm_preparation',
      familyId: 'spasticity_preparation',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'spasticity', 'upper_limb', 'supported'],
      titleTh: 'เตรียมแขนและมือก่อนฝึกใช้งาน',
      purposeTh: 'รองรับแขนบนโต๊ะ แล้วเคลื่อนไหวข้อศอก ข้อมือ และนิ้วช้า ๆ ในช่วงที่สบาย ก่อนต่อด้วยงานที่ต้องใช้แขนจริง',
      safetyTh: 'ไม่ดึงไหล่ ไม่กระชากหรือดัดข้อเร็ว หากปวด ข้อติดค้าง เปิดมือทำความสะอาดไม่ได้ หรือเกร็งเพิ่มชัด ให้หยุดและขอการประเมิน',
      visual: visual(
        'media/team4-stroke-spasticity-grid.png',
        'tone-arm-start',
        'tone-arm-ready',
        'สาธิตการรองรับแขนและเคลื่อนไหวช้าเพื่อเตรียมแขนที่มีอาการเกร็งก่อนทำกิจกรรม',
      ),
    },
    {
      id: 'spasticity_leg_preparation',
      familyId: 'spasticity_preparation',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'spasticity', 'lower_limb', 'seated'],
      titleTh: 'เตรียมขาและข้อเท้าก่อนลุกหรือเดิน',
      purposeTh: 'นั่งบนเก้าอี้มั่นคง วางเท้าให้มีจุดรองรับ แล้วขยับขาและข้อเท้าช้า ๆ ก่อนฝึกลุกหรือเดินตามระดับ FAC เดิม',
      safetyTh: 'ไม่กดเข่าหรือข้อเท้าแรง ไม่ฝืนให้ส้นติดพื้น หากปวด เท้าบิดมาก ข้อติด หรือยืนไม่ปลอดภัย ควรให้นักกายภาพประเมินก่อน',
      visual: visual(
        'media/team4-stroke-spasticity-grid.png',
        'tone-leg-start',
        'tone-leg-ready',
        'สาธิตการเตรียมขาและข้อเท้าอย่างช้า ๆ ในท่านั่งก่อนลุกหรือเดิน',
      ),
    },
    {
      id: 'supported_weight_shift',
      familyId: 'standing_weight_shift',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'assisted', 'lower_limb'],
      titleTh: 'ถ่ายน้ำหนักไปขาข้างอ่อนแรงแบบมีคนเฝ้า',
      purposeTh: 'เตรียมการยืนและก้าวโดยไม่เร่งให้เดินเกินความสามารถ',
      safetyTh: 'ผู้ดูแลอยู่ด้านข้างขาอ่อนแรงและพร้อมช่วยที่ลำตัวหรือเชิงกราน',
      visual: visual(
        'media/team4-stroke-demo-grid-b.png',
        'weight-start',
        'step-end',
        'สาธิตการถ่ายน้ำหนักไปยังขาข้างอ่อนแรงโดยมีผู้ดูแล',
      ),
    },
    {
      id: 'guarded_steps',
      familyId: 'home_walking',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'assisted', 'gait'],
      titleTh: 'ก้าวระยะสั้นโดยมีผู้ช่วย',
      purposeTh: 'เชื่อมการลงน้ำหนักกับก้าวจริงในระยะที่ควบคุมได้',
      safetyTh: 'ไม่ทำคนเดียว หากผู้ช่วยต้องยกน้ำหนักตัวมากควรให้นักกายภาพประเมินก่อน',
      visual: visual(
        'media/team4-stroke-demo-grid-b.png',
        'weight-start',
        'step-end',
        'สาธิตการก้าวระยะสั้นหลังโรคหลอดเลือดสมองโดยมีผู้ช่วย',
      ),
    },
    {
      id: 'sit_to_stand_control',
      familyId: 'sit_to_stand',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'bilateral_loading', 'transfer'],
      titleTh: 'ลุกยืนโดยเน้นลงน้ำหนักสองข้าง',
      purposeTh: 'ลดการใช้ขาข้างแข็งแรงชดเชยและเพิ่มการควบคุมลำตัว',
      safetyTh: 'มีผู้ดูแลใกล้ ๆ หากยังต้องเตือนหรือเสียสมดุลเป็นครั้งคราว',
      visual: visual(
        'media/team4-stroke-demo-grid-a.png',
        'sit',
        'stand',
        'สาธิตการลุกยืนโดยเน้นลงน้ำหนักสองข้าง',
      ),
    },
    {
      id: 'weight_shift_step',
      familyId: 'standing_weight_shift',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'target_step', 'lower_limb'],
      titleTh: 'ถ่ายน้ำหนักและก้าวไปยังเป้าหมาย',
      purposeTh: 'ฝึกการรับน้ำหนักข้างอ่อนแรงก่อนต่อเป็นการเดิน',
      safetyTh: 'หยุดเมื่อเข่าทรุด เท้าลากมากขึ้น หรือผู้ดูแลต้องออกแรงพยุงต่อเนื่อง',
      visual: visual(
        'media/team4-stroke-demo-grid-b.png',
        'weight-start',
        'step-end',
        'สาธิตการถ่ายน้ำหนักและก้าวไปยังเป้าหมาย',
      ),
    },
    {
      id: 'interval_home_walk',
      familyId: 'home_walking',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'interval', 'gait'],
      titleTh: 'เดินเป็นช่วงในเส้นทางจริงของบ้าน',
      purposeTh: 'เพิ่มระยะใช้งานโดยยังรักษาคุณภาพการก้าวและความปลอดภัย',
      safetyTh: 'มีคนเฝ้าตามระดับ FAC เดิม ไม่ลดอุปกรณ์หรือความช่วยเหลือเอง',
      visual: visual(
        'media/team4-stroke-demo-grid-b.png',
        'weight-start',
        'step-end',
        'สาธิตการเดินเป็นช่วงในเส้นทางจริงของบ้าน',
      ),
    },
    {
      id: 'functional_arm_assist',
      familyId: 'functional_upper_limb_task',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'upper_limb', 'bilateral_task'],
      titleTh: 'ใช้แขนข้างอ่อนแรงช่วยงานสองมือ',
      purposeTh: 'เปลี่ยนจากการขยับแยกส่วนไปสู่การช่วยจับ พยุง และเลื่อนของในกิจวัตร',
      safetyTh: 'วางของในระยะใกล้และมีผู้ดูแลช่วยจัดมือเมื่อจำเป็น',
      visual: visual(
        'media/team4-stroke-demo-grid-b.png',
        'arm-grasp',
        'arm-place',
        'สาธิตการใช้แขนข้างอ่อนแรงช่วยทำกิจกรรมสองมือ',
      ),
    },
    {
      id: 'sit_to_stand_symmetry',
      familyId: 'sit_to_stand',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'symmetry', 'transfer'],
      titleTh: 'ลุกยืนให้สมมาตรและควบคุมจังหวะ',
      purposeTh: 'เพิ่มคุณภาพการออกแรงสองข้างก่อนเพิ่มความเร็วหรือจำนวน',
      safetyTh: 'ใช้เก้าอี้มั่นคงและหยุดหากเข่าทรุดหรือเสียสมดุล',
      visual: visual(
        'media/team4-stroke-demo-grid-a.png',
        'sit',
        'stand',
        'สาธิตการลุกยืนให้สมมาตรและควบคุมจังหวะ',
      ),
    },
    {
      id: 'turning_path_walk',
      familyId: 'home_walking',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'turning', 'gait'],
      titleTh: 'เดิน เลี้ยว และเปลี่ยนทิศในบ้าน',
      purposeTh: 'เตรียมการเดินในพื้นที่จริงที่มีประตู มุม และจุดเลี้ยว',
      safetyTh: 'เพิ่มความซับซ้อนก่อนความเร็ว และคงอุปกรณ์เดิมจนได้รับการประเมิน',
      visual: visual(
        'media/team4-stroke-demo-grid-b.png',
        'weight-start',
        'step-end',
        'สาธิตการเดิน เลี้ยว และเปลี่ยนทิศในบ้าน',
      ),
    },
    {
      id: 'reach_grasp_release',
      familyId: 'functional_upper_limb_task',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'upper_limb', 'reach_grasp_release'],
      titleTh: 'เอื้อม จับ และวางของด้วยแขนข้างอ่อนแรง',
      purposeTh: 'เพิ่มการควบคุมแขนและมือในระยะที่ใช้จริง',
      safetyTh: 'หยุดเมื่อปวดไหล่ ชามากขึ้น หรือการเคลื่อนไหวเสียรูปแบบชัดเจน',
      visual: visual(
        'media/team4-stroke-demo-grid-b.png',
        'arm-grasp',
        'arm-place',
        'สาธิตการเอื้อม จับ และวางของด้วยแขนข้างอ่อนแรง',
      ),
    },
    {
      id: 'bilateral_daily_task',
      familyId: 'functional_upper_limb_task',
      planIds: [STROKE_PLAN_ID],
      variantTags: ['stroke', 'upper_limb', 'daily_task'],
      titleTh: 'ฝึกงานจริงที่ต้องใช้สองมือ',
      purposeTh: 'เชื่อมแขนข้างอ่อนแรงกลับสู่บทบาทในกิจวัตรที่ผู้ใช้ให้ความสำคัญ',
      safetyTh: 'เริ่มจากท่านั่งหากงานนั้นดึงความสนใจจากการทรงตัว',
      visual: visual(
        'media/team4-stroke-demo-grid-a.png',
        'arm-start',
        'arm-end',
        'สาธิตกิจกรรมในชีวิตประจำวันที่ใช้แขนทั้งสองข้าง',
      ),
    },
  ];

  const byId = new Map();
  for (const definition of definitions) {
    if (byId.has(definition.id)) throw new Error(`Duplicate exercise id: ${definition.id}`);
    byId.set(definition.id, definition);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getExercise(id) {
    const definition = byId.get(id);
    return definition ? clone(definition) : null;
  }

  function listExercises(filter) {
    const planId = filter && filter.planId;
    return definitions
      .filter((definition) => !planId || definition.planIds.includes(planId))
      .map(clone);
  }

  function prescribeExercise(id, fitt, overrides) {
    const definition = getExercise(id);
    if (!definition) throw new Error(`Unknown exercise: ${id}`);
    const changes = overrides || {};
    return {
      ...definition,
      ...changes,
      exerciseId: definition.id,
      fitt: clone(fitt || {}),
      visual: clone(changes.visual || definition.visual),
    };
  }

  return {
    getExercise,
    listExercises,
    prescribeExercise,
  };
});
