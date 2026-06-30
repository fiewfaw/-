import { loadJourneyPack, type JourneyPack } from '@/lib/engine/pack'
import strokeRaw from '@/content/stroke.json'

const RAW_PACKS: Record<string, unknown> = {
  stroke: strokeRaw,
}

export const GOALS: {
  id: string
  label: string
  sub: string
  emoji: string
  packId: string | null
}[] = [
  {
    id: 'rehab',
    label: 'ฟื้นฟูร่างกาย',
    sub: 'กลับมาเคลื่อนไหวได้อีกครั้ง · หลังป่วย–บาดเจ็บ',
    emoji: '🏥',
    packId: 'stroke',
  },
  {
    id: 'elderly',
    label: 'สูงวัย แข็งแรง ไม่ล้ม',
    sub: 'ออกกำลังปลอดภัยสำหรับผู้สูงอายุ',
    emoji: '💪',
    packId: null,
  },
  {
    id: 'sport',
    label: 'เล่นกีฬา ไม่บาดเจ็บ',
    sub: 'ฟื้นฟู–เพิ่มประสิทธิภาพนักกีฬา',
    emoji: '🏃',
    packId: null,
  },
]

export function getPack(packId: string): JourneyPack {
  const raw = RAW_PACKS[packId]
  if (!raw) throw new Error(`Unknown pack: ${packId}`)
  return loadJourneyPack(raw)
}
