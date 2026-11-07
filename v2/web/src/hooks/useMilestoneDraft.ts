import { useState } from 'react'
import { newExerciseId } from '#/components/exercises/exercise-constants'
import { isCompleteMilestone } from '#/lib/milestones'
import type { MilestoneDraft } from '#/lib/milestones'

export function useMilestoneDraft(initial: () => MilestoneDraft) {
  const [draft, setDraft] = useState(initial)
  return {
    draft,
    update: (changes: Partial<MilestoneDraft>) =>
      setDraft((current) => ({ ...current, ...changes })),
    reset: () => setDraft(initial()),
    canSubmit: draft.exerciseId !== newExerciseId && isCompleteMilestone(draft),
  }
}
