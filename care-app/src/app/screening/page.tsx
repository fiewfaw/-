'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getPack } from '@/content/registry'
import { useSession } from '@/lib/store'

export default function Page() {
  const router = useRouter()
  const packId = useSession((s) => s.packId)
  const setAnswer = useSession((s) => s.setAnswer)
  const [index, setIndex] = useState(0)

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
      <p className="text-xs text-slate-400">
        ข้อ {index + 1} / {pack.screeningQuestions.length}
      </p>
      <h2 className="mt-2 text-xl font-bold text-[#0f3a5f]">{q.text}</h2>
      <div className="mt-6 grid gap-3">
        {q.options.map((o) => (
          <button key={o.id} onClick={() => answer(o.id)}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm active:scale-[0.99]">
            {o.label}
          </button>
        ))}
      </div>
    </main>
  )
}
