import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { useClearSuccess } from '#/hooks/useClearSuccess'
import { useUpdateSessionNotes } from '#/hooks/useSessionMutations'
import type { WorkoutSession } from '#/types/api'

export function SessionNotes({ session }: { session: WorkoutSession }) {
  const saved = session.notes ?? ''
  const [draft, setDraft] = useState(saved)
  const updateNotes = useUpdateSessionNotes(session.id)
  const isDirty = draft.trim() !== saved
  useClearSuccess(updateNotes, 2000)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    updateNotes.mutate(draft)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label htmlFor={`notes-${session.id}`} className="font-heading">
        Notes
      </label>
      <Textarea
        id={`notes-${session.id}`}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="How did it go?"
        rows={5}
        maxLength={5000}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!isDirty || updateNotes.isPending}>
          Save notes
        </Button>
        {updateNotes.isSuccess && !isDirty && <p className="text-sm">Saved</p>}
      </div>
      {updateNotes.error && (
        <p className="text-danger">{updateNotes.error.message}</p>
      )}
    </form>
  )
}
