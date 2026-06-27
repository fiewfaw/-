export const STAT_KEYS = [
  'strength', 'balance', 'flexibility', 'endurance', 'function', 'comfort',
] as const
export type StatKey = (typeof STAT_KEYS)[number]

export const STAT_LABELS_TH: Record<StatKey, string> = {
  strength: 'แรง',
  balance: 'ทรงตัว',
  flexibility: 'ยืดหยุ่น',
  endurance: 'ทนทาน',
  function: 'ฟังก์ชัน',
  comfort: 'สบาย',
}

export type StatRadar = Record<StatKey, number> // 0–100
