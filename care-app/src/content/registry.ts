import { loadJourneyPack, type JourneyPack } from '@/lib/engine/pack'
import strokeRaw from '@/content/stroke.json'
import elderlyRaw from '@/content/elderly.json'
import sportRaw from '@/content/sport.json'

const RAW_PACKS: Record<string, unknown> = {
  stroke: strokeRaw,
  elderly: elderlyRaw,
  sport: sportRaw,
}

export type Goal = {
  id: string
  label: string
  sub: string
  emoji: string
  packId: string | null
  href?: string
}

export const GOALS: Goal[] = [
  {
    id: 'rehab',
    label: 'ฟื้นฟูจากโรค',
    sub: 'หลังป่วย–บาดเจ็บ กลับมาเคลื่อนไหวได้',
    emoji: '🏥',
    packId: null,
    href: '/conditions',
  },
  {
    id: 'elderly',
    label: 'ชะลอความเสื่อม',
    sub: 'ดูแลร่างกายผู้สูงวัย',
    emoji: '💪',
    packId: 'elderly',
  },
  {
    id: 'sport',
    label: 'เพิ่มศักยภาพกีฬา',
    sub: 'สำหรับนักกีฬา–คนออกกำลังกาย',
    emoji: '🏃',
    packId: 'sport',
  },
]

export type Condition = {
  id: string
  label: string
  sub: string
  emoji: string
  packId: string | null
}

export const CONDITIONS: Condition[] = [
  {
    id: 'stroke',
    label: 'โรคหลอดเลือดสมอง (Stroke)',
    sub: 'อ่อนแรงครึ่งซีก ฟื้นการเคลื่อนไหว',
    emoji: '🧠',
    packId: 'stroke',
  },
  {
    id: 'parkinson',
    label: 'พาร์กินสัน',
    sub: 'สั่น เกร็ง ทรงตัว–การเดิน',
    emoji: '🤝',
    packId: null,
  },
  {
    id: 'postop',
    label: 'ฟื้นฟูหลังผ่าตัด',
    sub: 'หลังผ่าตัดกระดูก–ข้อ–เอ็น',
    emoji: '🦴',
    packId: null,
  },
  {
    id: 'cancer',
    label: 'ฟื้นฟูผู้ป่วยมะเร็ง',
    sub: 'เสริมแรง ลดอ่อนล้า ระหว่าง–หลังรักษา',
    emoji: '🎗️',
    packId: null,
  },
]

export function getPack(packId: string): JourneyPack {
  const raw = RAW_PACKS[packId]
  if (!raw) throw new Error(`Unknown pack: ${packId}`)
  return loadJourneyPack(raw)
}
