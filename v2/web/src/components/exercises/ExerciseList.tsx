import { useSuspenseQuery } from '@tanstack/react-query'
import {
  exerciseUsage,
  hasVariations,
  hiddenLast,
  ownExercises,
  sharedExercises,
} from '#/lib/exercises'
import { exercisesQuery, goalsQuery, milestonesQuery } from '#/lib/queries'
import { ExerciseRow } from './ExerciseRow'
import { OwnExerciseActions } from './OwnExerciseActions'

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
            {hiddenLast(own).map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                baseExerciseName={baseName(exercise.baseExerciseId)}
                usage={usage(exercise.id)}
              >
                <OwnExerciseActions
                  exercise={exercise}
                  isUsed={usage(exercise.id) !== null}
                  isBase={hasVariations(exercise.id, exercises)}
                />
              </ExerciseRow>
            ))}
          </ul>
        )}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl">Defaults</h2>
        <ul className="flex flex-col gap-3">
          {hiddenLast(sharedExercises(exercises)).map((exercise) => (
            <ExerciseRow
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
