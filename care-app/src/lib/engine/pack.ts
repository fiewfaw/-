import { z } from 'zod'
import { STAT_KEYS } from '@/lib/types'

const statPartial = z.object(
  Object.fromEntries(STAT_KEYS.map((k) => [k, z.number().optional()])),
).strict()

const optionSchema = z.object({
  id: z.string(),
  label: z.string(),
  stage: z.string().nullable(),
  stats: statPartial.default({}),
})

const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  stat: z.string().nullable().default(null),
  options: z.array(optionSchema).min(1),
})

const redFlagSchema = z.object({
  questionId: z.string(),
  optionId: z.string(),
  message: z.string(),
})

const readoutSchema = z.object({
  summary: z.string(),
  starterTechniques: z.array(z.string()).default([]),
})

export const journeyPackSchema = z.object({
  id: z.string(),
  goal: z.string(),
  type: z.enum(['clinical', 'wellness']),
  name: z.string(),
  intro: z.object({ what_is: z.string(), how_help: z.string() }),
  redFlags: z.array(redFlagSchema).default([]),
  screeningQuestions: z.array(questionSchema).min(1),
  stages: z.array(z.object({ id: z.string(), label: z.string() })).min(1),
  freeReadout: z.record(z.string(), readoutSchema),
})

export type JourneyPack = z.infer<typeof journeyPackSchema>

export function loadJourneyPack(raw: unknown): JourneyPack {
  return journeyPackSchema.parse(raw)
}
