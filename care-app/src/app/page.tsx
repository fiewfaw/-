'use client'
import { useRouter } from 'next/navigation'
import { GOALS } from '@/content/registry'
import { useSession } from '@/lib/store'

export default function Page() {
  const router = useRouter()
  const selectGoal = useSession((s) => s.selectGoal)

  function choose(goalId: string, packId: string | null) {
    selectGoal(goalId, packId)
    if (packId) router.push('/screening')
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <div className="holo-brand">บ้านกายภาพบำบัด ชลบุรี</div>
      <h1 className="mt-2 text-2xl font-bold holo-title">เป้าหมายของคุณคืออะไร?</h1>
      <p className="mt-2 text-sm holo-sub">เลือกสิ่งที่อยากดูแล แล้วเราจะช่วยเช็กให้</p>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {GOALS.map((g) => (
          <button key={g.id} onClick={() => choose(g.id, g.packId)}
            className="holo-card flex items-center gap-3"
            disabled={!g.packId}>
            <span className="text-2xl">{g.emoji}</span>
            <span className="flex-1 font-medium">{g.label}</span>
            {!g.packId && <span className="text-xs holo-cyan">เร็ว ๆ นี้</span>}
          </button>
        ))}
      </div>
    </main>
  )
}
