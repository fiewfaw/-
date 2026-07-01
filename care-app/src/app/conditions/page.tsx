'use client'
import { useRouter } from 'next/navigation'
import { CONDITIONS } from '@/content/registry'
import { useSession } from '@/lib/store'

export default function Page() {
  const router = useRouter()
  const selectGoal = useSession((s) => s.selectGoal)

  function choose(c: (typeof CONDITIONS)[number]) {
    if (!c.packId) return
    selectGoal(c.id, c.packId)
    router.push('/screening')
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <button onClick={() => router.push('/')} className="holo-back mb-4">← กลับ</button>
      <div className="holo-brand">บ้านกายภาพบำบัด ชลบุรี</div>
      <h1 className="mt-2 text-2xl font-bold holo-title">ฟื้นฟูจากโรคอะไร?</h1>
      <p className="mt-2 text-sm holo-sub">เลือกภาวะที่อยากดูแล แล้วเราจะช่วยเช็กให้</p>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {CONDITIONS.map((c) => (
          <button key={c.id} onClick={() => choose(c)}
            className="holo-card flex items-center gap-3"
            disabled={!c.packId}>
            <span className="text-3xl">{c.emoji}</span>
            <span className="flex-1">
              <span className="block font-semibold">{c.label}</span>
              <span className="mt-0.5 block text-xs holo-sub">{c.sub}</span>
            </span>
            {!c.packId && <span className="shrink-0 text-xs holo-cyan">เร็ว ๆ นี้</span>}
          </button>
        ))}
      </div>
    </main>
  )
}
