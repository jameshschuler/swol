import { Link } from '@tanstack/react-router'
import { CalendarCheck, Goal, Medal, Trophy } from 'lucide-react'
import { LegalLinks } from '#/components/legal/LegalLinks'
import { buttonVariants } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'

const features = [
  {
    icon: CalendarCheck,
    title: 'Log every visit',
    text: 'Time your workouts or just check in. See your history on a calendar.',
  },
  {
    icon: Trophy,
    title: 'Track your PRs',
    text: 'Record milestones for each lift and see your weight and rep records.',
  },
  {
    icon: Goal,
    title: 'Chase goals',
    text: 'Set targets for each lift and see how much weight you have to go.',
  },
  {
    icon: Medal,
    title: 'Earn achievements',
    text: 'Unlock levels for streaks, visits and big lifts like the 1,000 lb club.',
  },
]

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-8 p-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-5xl">SWOL</h1>
        <p className="text-lg">
          A simple workout tracker for people who lift. Log your sessions, track
          your personal records and keep showing up.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/signup" className={buttonVariants({ size: 'lg' })}>
            Create an account
          </Link>
          <Link
            to="/login"
            className={buttonVariants({ variant: 'neutral', size: 'lg' })}
          >
            Sign in
          </Link>
        </div>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Card className="h-full">
              <CardContent className="flex gap-3">
                <Icon className="size-6 shrink-0" />
                <div>
                  <p className="font-heading">{title}</p>
                  <p className="text-sm">{text}</p>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <footer className="flex flex-col items-center gap-2">
        <LegalLinks />
        <p className="text-xs">Your data is never sold.</p>
      </footer>
    </main>
  )
}
