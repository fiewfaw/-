'use client'
import { useRouter } from 'next/navigation'
import { GOALS } from '@/content/registry'
import { useSession } from '@/lib/store'

export default function Page() {
  const router = useRouter()
  const selectGoal = useSession((s) => s.selectGoal)

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
        {GOALS.map((g) => (
          <button key={g.id} onClick={() => choose(g)}
            className="holo-card flex items-center gap-3"
            disabled={!(g.packId || g.href)}>
            <span className="text-3xl">{g.emoji}</span>
            <span className="flex-1">
              <span className="block font-semibold">{g.label}</span>
              <span className="mt-0.5 block text-xs holo-sub">{g.sub}</span>
            </span>
            {!(g.packId || g.href) && <span className="shrink-0 text-xs holo-cyan">เร็ว ๆ นี้</span>}
          </button>
        ))}
      </div>
    </main>
  )
}
