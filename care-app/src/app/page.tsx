'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GOALS } from '@/content/registry'
import { GOAL_ICON_FRAMES } from '@/content/icons'
import { CardIcon } from '@/components/CardIcon'
import { useSession } from '@/lib/store'

export default function Page() {
  const router = useRouter()
  const selectGoal = useSession((s) => s.selectGoal)
  const [hovered, setHovered] = useState<string | null>(null)

  function choose(g: (typeof GOALS)[number]) {
    if (g.href) {
      router.push(g.href)
      return
    }
    if (g.packId) {
      selectGoal(g.id, g.packId)
      router.push('/screening')
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <div className="holo-brand">บ้านกายภาพบำบัด ชลบุรี</div>
      <h1 className="mt-2 text-2xl font-bold holo-title">เป้าหมายของคุณคืออะไร?</h1>
      <p className="mt-2 text-sm holo-sub">เลือกสิ่งที่อยากดูแล แล้วเราจะช่วยเช็กให้</p>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {GOALS.map((g) => {
          const ready = !!(g.packId || g.href)
          return (
            <button key={g.id} onClick={() => choose(g)}
              onMouseEnter={() => setHovered(g.id)}
              onMouseLeave={() => setHovered((h) => (h === g.id ? null : h))}
              className="holo-card flex items-center gap-3"
              disabled={!ready}>
              <CardIcon frames={GOAL_ICON_FRAMES[g.id]} emoji={g.emoji} playing={hovered === g.id} />
              <span className="flex-1">
                <span className="block font-semibold">{g.label}</span>
                <span className="mt-0.5 block text-xs holo-sub">{g.sub}</span>
              </span>
              {!ready && <span className="shrink-0 text-xs holo-cyan">เร็ว ๆ นี้</span>}
            </button>
          )
        })}
      </div>
    </main>
  )
}
