'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPack } from '@/content/registry'
import { useSession } from '@/lib/store'
import { resolveStage } from '@/lib/engine/scoring'
import { computeStats } from '@/lib/engine/stats'
import { selectReadout, detectRedFlags } from '@/lib/engine/readout'
import { StatHexagon } from '@/components/StatHexagon'
import { BodyChart } from '@/components/BodyChart'
import { FadeIn } from '@/components/FadeIn'

const DISCLAIMER =
  'ผลนี้เป็นการคัดกรองเชิงให้ความรู้ ไม่ใช่การวินิจฉัย ควรปรึกษานักกายภาพบำบัดเพื่อการประเมินที่แม่นยำ'

export default function Page() {
  const router = useRouter()
  const packId = useSession((s) => s.packId)
  const answers = useSession((s) => s.answers)

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
      <h1 className="text-xl font-bold text-[#0f3a5f]">{pack.name}</h1>
      <p className="mt-1 text-sm font-medium text-[#2b7cb8]">ระยะของคุณ: {stage?.label}</p>

      <FadeIn>
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <BodyChart markers={[]} />
          <StatHexagon stats={stats} />
        </div>
      </FadeIn>

      {redFlags.length > 0 && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {redFlags.map((m, i) => <p key={i}>⚠ {m}</p>)}
        </div>
      )}

      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-slate-700">{readout.summary}</p>
        {readout.starterTechniques.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
            {readout.starterTechniques.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        )}
      </section>

      <a href="#consult"
        className="mt-6 block rounded-2xl bg-[#0f3a5f] py-4 text-center font-semibold text-white">
        ปรึกษานักกายภาพ
      </a>

      <p className="mt-4 text-xs text-slate-400">{DISCLAIMER}</p>
    </main>
  )
}
