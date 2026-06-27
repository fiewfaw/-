import { loadJourneyPack, type JourneyPack } from '@/lib/engine/pack'
import strokeRaw from '@/content/stroke.json'

const RAW_PACKS: Record<string, unknown> = {
  stroke: strokeRaw,
}

export const GOALS: { id: string; label: string; emoji: string; packId: string | null }[] = [
  { id: 'rehab', label: 'ฟื้นฟูจากโรค', emoji: '🏥', packId: 'stroke' },
  { id: 'elderly', label: 'แข็งแรง–กันล้ม (สูงวัย)', emoji: '💪', packId: null },
  { id: 'pain', label: 'หายปวด–ขยับสบาย', emoji: '🔥', packId: null },
  { id: 'weight', label: 'ลดน้ำหนัก–กระชับ', emoji: '⚖️', packId: null },
  { id: 'wellness', label: 'ดูแลสุขภาพทั่วไป', emoji: '🌱', packId: null },
]

export function getPack(packId: string): JourneyPack {
  const raw = RAW_PACKS[packId]
  if (!raw) throw new Error(`Unknown pack: ${packId}`)
  return loadJourneyPack(raw)
}
