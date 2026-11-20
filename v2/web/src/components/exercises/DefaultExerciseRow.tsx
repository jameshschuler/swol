import { Eye, EyeOff } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useSetExerciseHidden } from '#/hooks/useExerciseMutations'
import { cn } from '#/lib/utils'
import type { Exercise } from '#/types/api'
import { ExerciseLink } from './ExerciseLink'

export function DefaultExerciseRow({
  exercise,
  baseExerciseName,
  usage,
}: {
  exercise: Exercise
  baseExerciseName: string | undefined
  usage: string | null
}) {
  const setHidden = useSetExerciseHidden(exercise.id)
  const action = exercise.hidden ? 'Show' : 'Hide'

  return (
    <li className="flex items-start gap-3 rounded-base border-2 border-border bg-secondary-background p-3">
      <div className={cn('min-w-0 flex-1', exercise.hidden && 'opacity-60')}>
        <p className="flex min-w-0 items-center gap-2 font-heading">
          <ExerciseLink exerciseId={exercise.id} className="truncate">
            {exercise.name}
          </ExerciseLink>
          {exercise.hidden && <Badge>Hidden</Badge>}
        </p>
        {baseExerciseName && (
          <p className="truncate text-sm">Variation of {baseExerciseName}</p>
        )}
        {usage && <p className="text-sm">{usage}</p>}
      </div>
      <Button
        variant="neutral"
        size="icon-sm"
        aria-label={`${action} ${exercise.name}`}
        title={`${action} in exercise lists`}
        disabled={setHidden.isPending}
        onClick={() => setHidden.mutate(!exercise.hidden)}
      >
        {exercise.hidden ? <Eye /> : <EyeOff />}
      </Button>
    </li>
  )
}
