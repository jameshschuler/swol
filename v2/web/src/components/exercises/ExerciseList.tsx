import { useSuspenseQuery } from '@tanstack/react-query'
import { exerciseUsage, hasVariations, ownExercises } from '#/lib/exercises'
import { exercisesQuery, goalsQuery, milestonesQuery } from '#/lib/queries'
import { ExerciseRow } from './ExerciseRow'

export function ExerciseList() {
  const { data: exercises } = useSuspenseQuery(exercisesQuery)
  const { data: milestones } = useSuspenseQuery(milestonesQuery)
  const { data: goals } = useSuspenseQuery(goalsQuery)
  const own = ownExercises(exercises)

  if (own.length === 0) {
    return (
      <p>
        No exercises of your own yet. Add one with "+ New exercise" when you log
        a milestone or set a goal.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {own.map((exercise) => (
        <ExerciseRow
          key={exercise.id}
          exercise={exercise}
          baseExerciseName={
            exercises.find(({ id }) => id === exercise.baseExerciseId)?.name
          }
          usage={exerciseUsage(exercise.id, milestones, goals)}
          isBase={hasVariations(exercise.id, exercises)}
        />
      ))}
    </ul>
  )
}
