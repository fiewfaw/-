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
      <h1 className="text-2xl font-bold text-[#0f3a5f]">เป้าหมายของคุณคืออะไร?</h1>
      <p className="mt-1 text-sm text-slate-500">เลือกสิ่งที่อยากดูแล แล้วเราจะช่วยเช็กให้</p>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {GOALS.map((g) => (
          <button key={g.id} onClick={() => choose(g.id, g.packId)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm active:scale-[0.99] disabled:opacity-50"
            disabled={!g.packId}>
            <span className="text-2xl">{g.emoji}</span>
            <span className="flex-1 font-medium text-slate-800">{g.label}</span>
            {!g.packId && <span className="text-xs text-slate-400">เร็ว ๆ นี้</span>}
          </button>
        ))}
      </div>
    </main>
  )
}
