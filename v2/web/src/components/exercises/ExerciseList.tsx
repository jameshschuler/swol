import { useSuspenseQuery } from '@tanstack/react-query'
import {
  exerciseUsage,
  hasVariations,
  ownExercises,
  sharedExercises,
} from '#/lib/exercises'
import { exercisesQuery, goalsQuery, milestonesQuery } from '#/lib/queries'
import { DefaultExerciseRow } from './DefaultExerciseRow'
import { ExerciseRow } from './ExerciseRow'

export function ExerciseList() {
  const { data: exercises } = useSuspenseQuery(exercisesQuery)
  const { data: milestones } = useSuspenseQuery(milestonesQuery)
  const { data: goals } = useSuspenseQuery(goalsQuery)
  const own = ownExercises(exercises)
  const baseName = (baseExerciseId: string | null) =>
    exercises.find(({ id }) => id === baseExerciseId)?.name
  const usage = (exerciseId: string) =>
    exerciseUsage(exerciseId, milestones, goals)

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl">Yours</h2>
        {own.length === 0 ? (
          <p>
            No exercises of your own yet. Add one with "+ New exercise" when you
            log a milestone or set a goal.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {own.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                baseExerciseName={baseName(exercise.baseExerciseId)}
                usage={usage(exercise.id)}
                isBase={hasVariations(exercise.id, exercises)}
              />
            ))}
          </ul>
        )}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl">Defaults</h2>
        <ul className="flex flex-col gap-3">
          {sharedExercises(exercises).map((exercise) => (
            <DefaultExerciseRow
              key={exercise.id}
              exercise={exercise}
              baseExerciseName={baseName(exercise.baseExerciseId)}
              usage={usage(exercise.id)}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}
