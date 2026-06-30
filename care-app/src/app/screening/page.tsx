'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPack } from '@/content/registry'
import { useSession } from '@/lib/store'

export default function Page() {
  const router = useRouter()
  const packId = useSession((s) => s.packId)
  const setAnswer = useSession((s) => s.setAnswer)
  const reset = useSession((s) => s.reset)
  const [index, setIndex] = useState(0)

  function goHome() {
    reset()
    router.push('/')
  }
  function goBack() {
    if (index > 0) setIndex(index - 1)
    else goHome()
  }

  useEffect(() => {
    if (!packId) router.push('/')
  }, [packId, router])
  if (!packId) return null

  const pack = getPack(packId)
  const q = pack.screeningQuestions[index]

  function answer(optionId: string) {
    setAnswer(q.id, optionId)
    if (index + 1 < pack.screeningQuestions.length) setIndex(index + 1)
    else router.push('/result')
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={goBack} className="holo-back">← กลับ</button>
        <button onClick={goHome} className="holo-back">หน้าแรก ⌂</button>
      </div>
      <p className="text-xs font-semibold holo-cyan">
        ข้อ {index + 1} / {pack.screeningQuestions.length}
      </p>
      <div className="holo-progress mt-3">
        <div style={{ width: `${(index / pack.screeningQuestions.length) * 100}%` }} />
      </div>
      <h2 className="mt-4 text-xl font-bold holo-title">{q.text}</h2>
      <div className="mt-6 grid gap-3">
        {q.options.map((o) => (
          <button key={o.id} onClick={() => answer(o.id)} className="holo-card">
            {o.label}
          </button>
        ))}
      </div>
    </main>
  )
}
