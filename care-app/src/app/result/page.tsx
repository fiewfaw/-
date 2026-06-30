'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPack } from '@/content/registry'
import { useSession } from '@/lib/store'
import { resolveStage } from '@/lib/engine/scoring'
import { computeStats } from '@/lib/engine/stats'
import { selectReadout, detectRedFlags } from '@/lib/engine/readout'
import { StatHexagon } from '@/components/StatHexagon'
import { HologramAvatar } from '@/components/hologram/HologramAvatar'
import { FadeIn } from '@/components/FadeIn'

const DISCLAIMER =
  'ผลนี้เป็นการคัดกรองเชิงให้ความรู้ ไม่ใช่การวินิจฉัย ควรปรึกษานักกายภาพบำบัดเพื่อการประเมินที่แม่นยำ'

export default function Page() {
  const router = useRouter()
  const packId = useSession((s) => s.packId)
  const answers = useSession((s) => s.answers)
  const reset = useSession((s) => s.reset)

  useEffect(() => {
    if (!packId) router.push('/')
  }, [packId, router])
  if (!packId) return null

  const pack = getPack(packId)
  const stageId = resolveStage(pack, answers)
  const stage = pack.stages.find((s) => s.id === stageId)
  const stats = computeStats(pack, answers)
  const readout = selectReadout(pack, stageId)
  const redFlags = detectRedFlags(pack, answers)

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <button
        onClick={() => { reset(); router.push('/') }}
        className="holo-back mb-4"
      >
        ← กลับหน้าแรก
      </button>
      <h1 className="text-xl font-bold holo-title">{pack.name}</h1>
      <p className="mt-1 text-sm font-semibold holo-cyan">ระยะของคุณ: {stage?.label}</p>

      <FadeIn>
        <div className="mt-4">
          <HologramAvatar height={340} />
          <div className="holo-panel mt-4 p-4">
            <StatHexagon stats={stats} />
          </div>
        </div>
      </FadeIn>

      {redFlags.length > 0 && (
        <div className="mt-4 rounded-2xl border border-red-400/50 bg-red-950/40 p-4 text-sm text-red-200">
          {redFlags.map((m, i) => <p key={i}>⚠ {m}</p>)}
        </div>
      )}

      <section className="holo-panel mt-4 p-4">
        <p className="leading-relaxed" style={{ color: '#cfe7f6' }}>{readout.summary}</p>
        {readout.starterTechniques.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-sm" style={{ color: '#bcd9ec' }}>
            {readout.starterTechniques.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        )}
      </section>

      <a href="#consult" className="holo-cta mt-6">⚡ ปรึกษานักกายภาพ</a>

      <p className="mt-4 text-xs holo-sub">{DISCLAIMER}</p>
    </main>
  )
}
