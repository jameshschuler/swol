import { createFileRoute } from '@tanstack/react-router'
import { ExerciseHistory } from '#/components/exercises/ExerciseHistory'
import { BackLink } from '#/components/shared/BackLink'
import { PageLoadError } from '#/components/shared/PageLoadError'
import { exercisesQuery, meQuery, milestonesQuery } from '#/lib/queries'

export const Route = createFileRoute('/_app/exercises/$exerciseId')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.query({ ...meQuery, staleTime: 'static' }),
      queryClient.query({ ...exercisesQuery, staleTime: 'static' }),
      queryClient.query({ ...milestonesQuery, staleTime: 'static' }),
    ]),
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: PageLoadError,
  component: ExercisePage,
})

function ExercisePage() {
  const { exerciseId } = Route.useParams()
  return (
    <>
      <BackLink to="/exercises" label="All exercises" />
      <ExerciseHistory exerciseId={exerciseId} />
    </>
  )
}
