(function attachFrailtyIndependencePlan(global) {
  'use strict'

  const transferValues = ['independent', 'uses_arms', 'supervision', 'physical_help']
  const walkingValues = ['independent', 'furniture', 'device', 'assisted', 'unable']

  const problemCopy = {
    transfer_strength: {
      titleTh: 'แรงลดลง ทำให้ลุกยืนและย้ายตัวลำบาก',
      summaryTh: 'ระดับแรงและวิธีลุกยืนตอนนี้ทำให้ต้องใช้มือหรือความช่วยเหลือมากขึ้น',
    },
    gait_balance: {
      titleTh: 'เดินช้าลงและเสียสมดุลง่าย',
      summaryTh: 'การเดินในบ้านยังต้องพึ่งจุดจับ อุปกรณ์ หรือผู้ดูแล จึงควรจัดความปลอดภัยก่อนเพิ่มความยาก',
    },
    activity_tolerance: {
      titleTh: 'ความทนทานลดลง ทำกิจวัตรได้ไม่ต่อเนื่อง',
      summaryTh: 'ร่างกายล้าเร็วและใช้เวลาฟื้นนาน ทำให้กิจวัตรสำคัญต้องแบ่งเป็นช่วงสั้นลง',
    },
  }

  const modifierCopy = {
    nutrition: {
      labelTh: 'น้ำหนักลดหรือกินได้น้อย',
      guidanceTh: 'ติดตามน้ำหนักและปริมาณอาหาร หากลดต่อเนื่องควรประสานแพทย์หรือนักกำหนดอาหาร',
    },
    cognition: {
      labelTh: 'ความจำหรือการทำตามคำสั่ง',
      guidanceTh: 'ใช้คำสั่งสั้นทีละขั้น ฝึกเวลาและสถานที่เดิม พร้อมให้ผู้ดูแลอยู่ใกล้',
    },
    osteoporosis: {
      labelTh: 'กระดูกพรุนหรือเสี่ยงกระดูกหัก',
      guidanceTh: 'หลีกเลี่ยงแรงกระแทกและการบิดหรืองอหลังแรง เน้นท่าที่มีจุดจับมั่นคง',
    },
    cardiopulmonary: {
      labelTh: 'โรคหัวใจหรือปอด',
      guidanceTh: 'ใช้ช่วงฝึกสั้นสลับพัก ติดตามอาการหอบ แน่นหน้าอก เวียนหัว และใจสั่น',
    },
    metabolic: {
      labelTh: 'เบาหวานหรือโรคเมตาบอลิก',
      guidanceTh: 'จัดเวลาฝึกให้สัมพันธ์กับอาหารและยา ตรวจเท้า และระวังอาการน้ำตาลต่ำ',
    },
    home_risk: {
      labelTh: 'บ้านหรือผู้ดูแลมีข้อจำกัด',
      guidanceTh: 'จัดทางเดิน ห้องน้ำ จุดจับ และวิธีช่วยให้ทำซ้ำได้โดยไม่เพิ่มภาระผู้ดูแล',
    },
  }

  function assertEnum(name, value, allowed) {
    if (!allowed.includes(value)) throw new TypeError(`${name} is invalid`)
  }

  function assertNumber(name, value, min, max, nullable) {
    if (nullable && value === null) return
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new TypeError(`${name} must be between ${min} and ${max}`)
    }
  }

  function validate(input) {
    if (!input || typeof input !== 'object') throw new TypeError('input is required')
    if (typeof input.redFlag !== 'boolean') throw new TypeError('redFlag must be boolean')
    assertEnum('transferAssist', input.transferAssist, transferValues)
    assertEnum('householdWalking', input.householdWalking, walkingValues)
    assertNumber('chairStandReps', input.chairStandReps, 0, 60, true)
    assertNumber('nearFalls30d', input.nearFalls30d, 0, 99, false)
    assertNumber('fatigue010', input.fatigue010, 0, 10, false)
    assertNumber('activityMinutes', input.activityMinutes, 0, 240, true)
    assertNumber('recoveryMinutes', input.recoveryMinutes, 0, 240, true)
    if (typeof input.adlDecline !== 'boolean') throw new TypeError('adlDecline must be boolean')
    if (typeof input.weightLossOrLowIntake !== 'boolean') {
      throw new TypeError('weightLossOrLowIntake must be boolean')
    }
    if (!Array.isArray(input.modifiers)) throw new TypeError('modifiers must be an array')
  }

  function scoreProblems(input) {
    const transferMap = { independent: 0, uses_arms: 2, supervision: 3, physical_help: 5 }
    const walkingMap = { independent: 0, device: 2, furniture: 3, assisted: 4, unable: 5 }
    let transfer = transferMap[input.transferAssist]
    let gait = walkingMap[input.householdWalking]
    let tolerance = 0

    if (input.chairStandReps !== null) {
      if (input.chairStandReps === 0) transfer += 4
      else if (input.chairStandReps <= 5) transfer += 3
      else if (input.chairStandReps <= 8) transfer += 2
      else if (input.chairStandReps <= 11) transfer += 1
    }

    if (input.nearFalls30d >= 3) gait += 3
    else if (input.nearFalls30d >= 1) gait += 2

    if (input.fatigue010 >= 8) tolerance += 4
    else if (input.fatigue010 >= 5) tolerance += 3
    else if (input.fatigue010 >= 3) tolerance += 1

    if (input.activityMinutes !== null) {
      if (input.activityMinutes <= 2) tolerance += 3
      else if (input.activityMinutes <= 5) tolerance += 2
      else if (input.activityMinutes <= 10) tolerance += 1
    }
    if (input.recoveryMinutes !== null) {
      if (input.recoveryMinutes >= 15) tolerance += 3
      else if (input.recoveryMinutes >= 8) tolerance += 2
      else if (input.recoveryMinutes >= 4) tolerance += 1
    }
    if (input.adlDecline) tolerance += 3

    const priority = { transfer_strength: 0, gait_balance: 1, activity_tolerance: 2 }
    return [
      { id: 'transfer_strength', score: transfer },
      { id: 'gait_balance', score: gait },
      { id: 'activity_tolerance', score: tolerance },
    ]
      .sort((a, b) => b.score - a.score || priority[a.id] - priority[b.id])
      .map((problem) => ({ ...problemCopy[problem.id], ...problem }))
  }

  function selectLevel(input, problems) {
    if (
      input.transferAssist === 'physical_help' ||
      ['assisted', 'unable'].includes(input.householdWalking) ||
      problems[0].score >= 8
    ) return 'supported_start'

    if (
      input.transferAssist !== 'independent' ||
      input.householdWalking !== 'independent' ||
      input.fatigue010 >= 5 ||
      problems[0].score >= 4
    ) return 'rebuild'

    return 'progressive'
  }

  function fitt(frequencyTh, intensityTh, timeTh, typeTh) {
    return { frequencyTh, intensityTh, timeTh, typeTh }
  }

  function activitiesFor(level) {
    if (level === 'supported_start') return [
      {
        id: 'supported_bridge_or_transfer',
        titleTh: 'ฝึกยกสะโพกหรือออกแรงร่วมขณะย้ายตัว',
        purposeTh: 'เริ่มสร้างแรงลำตัวและขาโดยยังไม่บังคับให้ยืนเอง',
        fitt: fitt('วันละ 1-2 รอบ', 'เหลือแรงทำได้อีก 2-3 ครั้ง', '4-6 ครั้ง พักระหว่างครั้ง', 'ยกสะโพกบนเตียงหรือฝึกออกแรงร่วมตามระดับช่วยเหลือ'),
        safetyTh: 'หยุดเมื่อปวดมาก หอบผิดปกติ หน้ามืด หรือผู้ดูแลควบคุมการเคลื่อนไหวไม่ได้',
        visualKey: 'bed_bridge',
      },
      {
        id: 'supported_sit_balance',
        titleTh: 'นั่งทรงตัวและถ่ายน้ำหนักอย่างมีจุดรองรับ',
        purposeTh: 'เตรียมลำตัวสำหรับการลุกและย้ายตัว',
        fitt: fitt('วันละ 2-3 ช่วงสั้น', 'มั่นคงและพูดคุยได้', 'ครั้งละ 1-3 นาที', 'นั่งพิงหรือนั่งขอบเตียงโดยมีคนดูแล'),
        safetyTh: 'ไม่ทำคนเดียวเมื่อยังนั่งไม่มั่นคงหรือมีอาการหน้ามืด',
        visualKey: 'supported_sitting',
      },
      {
        id: 'seated_step',
        titleTh: 'ยกเท้าสลับในท่านั่ง',
        purposeTh: 'เพิ่มการเคลื่อนไหวและความทนทานโดยลดความเสี่ยงล้ม',
        fitt: fitt('วันละ 1-2 รอบ', 'เบาถึงปานกลาง', '20-40 วินาที 2 รอบ', 'ยกเท้าสลับขณะนั่งเก้าอี้มั่นคง'),
        safetyTh: 'หยุดเมื่อเหนื่อยเกิน 7 จาก 10 หรือมีเจ็บหน้าอกและเวียนหัว',
        visualKey: 'seated_march',
      },
    ]

    if (level === 'rebuild') return [
      {
        id: 'chair_rise',
        titleTh: 'ลุกยืนจากเก้าอี้ระดับที่ปลอดภัย',
        purposeTh: 'เพิ่มแรงขาและลดการใช้มือหรือคนช่วยทีละขั้น',
        fitt: fitt('4-5 วันต่อสัปดาห์', 'ทำซ้ำโดยรูปแบบยังคงดี', '4-8 ครั้ง 1-2 รอบ', 'ลุกยืนจากเก้าอี้มั่นคง ใช้มือได้ตามจำเป็น'),
        safetyTh: 'มีจุดจับหรือผู้ดูแลใกล้ ๆ และหยุดเมื่อเข่าทรุดหรือเกือบล้ม',
        visualKey: 'chair_rise',
      },
      {
        id: 'supported_weight_shift',
        titleTh: 'ถ่ายน้ำหนักซ้ายขวาที่เคาน์เตอร์',
        purposeTh: 'ฝึกควบคุมสมดุลก่อนเพิ่มระยะเดิน',
        fitt: fitt('4-5 วันต่อสัปดาห์', 'เคลื่อนไหวช้าและคุมได้', 'ข้างละ 6-10 ครั้ง', 'ยืนจับพื้นผิวมั่นคงและถ่ายน้ำหนัก'),
        safetyTh: 'ไม่ยืนฝึกคนเดียวหากยังต้องจับเฟอร์นิเจอร์ขณะเดิน',
        visualKey: 'weight_shift',
      },
      {
        id: 'interval_walk',
        titleTh: 'เดินช่วงสั้นในเส้นทางสำคัญของบ้าน',
        purposeTh: 'เพิ่มความทนทานและความมั่นใจในกิจวัตรจริง',
        fitt: fitt('ทุกวันตามความพร้อม', 'เหนื่อยไม่เกิน 5 จาก 10', '1-3 นาที สลับพัก 2-3 รอบ', 'เดินไปยังจุดหมายจริงโดยใช้อุปกรณ์เดิม'),
        safetyTh: 'ทางเดินต้องโล่งและมีคนดูแลเมื่อเคยเกือบล้มหรือล้ม',
        visualKey: 'home_walk',
      },
      {
        id: 'meaningful_task',
        titleTh: 'ฝึกกิจวัตรหนึ่งอย่างที่อยากกลับไปทำ',
        purposeTh: 'เปลี่ยนกำลังที่เพิ่มขึ้นให้เป็นความช่วยเหลือตัวเองจริง',
        fitt: fitt('อย่างน้อย 5 วันต่อสัปดาห์', 'ใช้ความช่วยเหลือน้อยที่สุดที่ยังปลอดภัย', '5-10 นาที', 'เช่น แต่งตัว ยืนล้างหน้า หรือเดินไปโต๊ะอาหาร'),
        safetyTh: 'ลดขั้นตอนหรือหยุดเมื่อรูปแบบแย่ลงและต้องช่วยมากกว่าปกติ',
        visualKey: 'adl_task',
      },
    ]

    return [
      {
        id: 'controlled_chair_rise',
        titleTh: 'ลุกยืนแบบควบคุมจังหวะ',
        purposeTh: 'เพิ่มกำลังและพลังของขาสำหรับกิจกรรมที่ท้าทายขึ้น',
        fitt: fitt('3-4 วันต่อสัปดาห์', 'ปานกลาง เหลือแรง 2-3 ครั้ง', '8-12 ครั้ง 2 รอบ', 'ลุกยืนช้าและนั่งลงอย่างควบคุม'),
        safetyTh: 'คงเก้าอี้หรือผนังไว้ใกล้ตัวหากมีประวัติเสียสมดุล',
        visualKey: 'controlled_chair_rise',
      },
      {
        id: 'multi_direction_balance',
        titleTh: 'ก้าวหลายทิศทางใกล้จุดจับ',
        purposeTh: 'เตรียมสมดุลสำหรับการเลี้ยวและหลบสิ่งกีดขวาง',
        fitt: fitt('3-5 วันต่อสัปดาห์', 'ก้าวได้แม่นโดยไม่รีบ', 'ทิศทางละ 4-6 ครั้ง', 'ก้าวหน้า ข้าง และกลับจุดเดิม'),
        safetyTh: 'ฝึกใกล้เคาน์เตอร์และไม่เพิ่มความเร็วหากยังไขว้เท้าหรือเซ',
        visualKey: 'multi_direction_step',
      },
      {
        id: 'progressive_walk',
        titleTh: 'เดินต่อเนื่องตามเป้าหมาย',
        purposeTh: 'เพิ่มเวลาหรือระยะที่ใช้ชีวิตได้โดยไม่ล้ามากเกินไป',
        fitt: fitt('4-6 วันต่อสัปดาห์', 'เหนื่อย 4-6 จาก 10', '10-20 นาที หรือแบ่ง 2 ช่วง', 'เดินในบ้านหรือนอกบ้านตามความปลอดภัย'),
        safetyTh: 'ลดเวลาหากวันถัดไปล้ามากผิดปกติหรือใช้เวลาฟื้นนานขึ้น',
        visualKey: 'progressive_walk',
      },
      {
        id: 'goal_task',
        titleTh: 'ฝึกกิจกรรมเป้าหมายเฉพาะบุคคล',
        purposeTh: 'เตรียมร่างกายสำหรับงานบ้าน ท่องเที่ยว หรือกิจกรรมสังคม',
        fitt: fitt('2-4 วันต่อสัปดาห์', 'ท้าทายแต่ควบคุมได้', '10-15 นาที', 'จำลององค์ประกอบของเป้าหมายจริง'),
        safetyTh: 'เพิ่มเพียงหนึ่งตัวแปรต่อครั้ง เช่น เวลา ระยะ หรือความยาก',
        visualKey: 'goal_task',
      },
    ]
  }

  function selectModifiers(input) {
    const keys = []
    if (input.weightLossOrLowIntake) keys.push('nutrition')
    for (const raw of input.modifiers) {
      const key = raw === 'sarcopenia' ? 'nutrition' : raw
      if (modifierCopy[key] && !keys.includes(key)) keys.push(key)
    }
    return keys.slice(0, 2).map((id) => ({ id, ...modifierCopy[id] }))
  }

  function buildFrailtyIndependencePlan(input) {
    validate(input)
    const mainPlanTitleTh = 'แผนฟื้นกำลัง กลับมาช่วยเหลือตัวเอง'

    if (input.redFlag) {
      return {
        route: 'medical_review',
        level: 'supported_start',
        levelLabelTh: 'ควรประเมินทางการแพทย์ก่อน',
        mainPlanTitleTh,
        problems: [],
        modifiers: [],
        activities: [],
        weeklySchedule: [],
        progressionTh: [],
        regressionTh: [],
        ptAssessmentTh: [],
        stopPointTh: 'หยุดแผนฝึกชั่วคราวจนกว่าอาการอันตรายจะได้รับการประเมิน',
      }
    }

    const problems = scoreProblems(input)
    const level = selectLevel(input, problems)
    const missingSafeData = [input.chairStandReps, input.activityMinutes, input.recoveryMinutes].every(
      (value) => value === null,
    )
    const substantialAssistance =
      input.transferAssist === 'physical_help' ||
      ['assisted', 'unable'].includes(input.householdWalking)
    const route = substantialAssistance && missingSafeData ? 'professional_review' : 'personal_plan'
    const levelLabels = {
      supported_start: 'เริ่มฟื้นกำลังโดยมีคนช่วย',
      rebuild: 'สร้างแรงและการเดินกลับคืน',
      progressive: 'เพิ่มศักยภาพและความทนทาน',
    }
    const ptAssessmentTh = [
      'แรงขาและลำตัวร่วมกับวิธีลุกยืนและย้ายตัว',
      'รูปแบบการเดิน การเลี้ยว การตอบสนองเมื่อเสียสมดุล และอุปกรณ์ช่วยเดิน',
      'ความทนทาน สัญญาณชีพ อาการขณะเปลี่ยนท่า และเส้นทางจริงในบ้าน',
    ]
    if (input.adlDecline) ptAssessmentTh.push('Barthel Index เพื่อระบุระดับความช่วยเหลือในกิจวัตรที่ลดลง')

    return {
      route,
      level,
      levelLabelTh: levelLabels[level],
      mainPlanTitleTh,
      problems,
      modifiers: selectModifiers(input),
      activities: route === 'personal_plan' ? activitiesFor(level).slice(0, 4) : [],
      weeklySchedule: route === 'personal_plan' ? [
        { dayTh: 'จันทร์ พุธ ศุกร์', itemsTh: ['ฝึกแรงและการลุกยืน', 'ฝึกสมดุลตามระดับ'] },
        { dayTh: 'อังคาร พฤหัส เสาร์', itemsTh: ['เดินหรือเคลื่อนไหวแบบช่วงสั้น', 'ฝึกกิจวัตรเป้าหมาย'] },
        { dayTh: 'ทุกวัน', itemsTh: ['ขยับร่างกายระหว่างวัน', 'ติดตามอาการและเวลาฟื้น'] },
      ] : [],
      progressionTh: [
        'เพิ่มเพียงหนึ่งอย่างต่อสัปดาห์ เช่น จำนวนครั้ง เวลา หรือระดับการช่วยเหลือ',
        'เพิ่มเมื่อทำได้ครบด้วยรูปแบบเดิม 2-3 ครั้งติดต่อกันและวันถัดไปไม่ล้ามากขึ้น',
      ],
      regressionTh: [
        'ลดจำนวนครั้งหรือเวลาลง 20-30% เมื่อเหนื่อยนานกว่าปกติหรือรูปแบบการเคลื่อนไหวแย่ลง',
        'กลับไปใช้จุดจับหรือความช่วยเหลือระดับเดิมเมื่อมีเหตุเกือบล้ม',
      ],
      ptAssessmentTh,
      stopPointTh: 'ลดหรือยุติการจ้างกายภาพได้เมื่อคนไข้และครอบครัวทำและปรับแผนได้ปลอดภัย ความสามารถดีขึ้นหรือคงที่ตามเป้าหมาย และการประเมินซ้ำไม่เปลี่ยนแผนอย่างมีสาระ',
    }
  }

  global.FrailtyIndependencePlan = Object.freeze({ buildFrailtyIndependencePlan })
})(window)
