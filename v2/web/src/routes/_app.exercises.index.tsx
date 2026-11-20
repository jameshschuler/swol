import { createFileRoute } from '@tanstack/react-router'
import { ExerciseList } from '#/components/exercises/ExerciseList'
import { PageHeader } from '#/components/shared/PageHeader'
import { PageLoadError } from '#/components/shared/PageLoadError'
import { exercisesQuery, goalsQuery, milestonesQuery } from '#/lib/queries'

export const Route = createFileRoute('/_app/exercises/')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.query({ ...exercisesQuery, staleTime: 'static' }),
      queryClient.query({ ...milestonesQuery, staleTime: 'static' }),
      queryClient.query({ ...goalsQuery, staleTime: 'static' }),
    ]),
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: PageLoadError,
  component: Exercises,
})

function Exercises() {
  return (
    <>
      <PageHeader
        title="Exercises"
        description="Hide defaults you don't do. They stay out of the exercise picker."
      />
      <ExerciseList />
    </>
  )
}
