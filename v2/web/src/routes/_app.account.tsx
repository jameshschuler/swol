import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { PageHeader } from '#/components/shared/PageHeader'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { useUpdateWeightUnit } from '#/hooks/useUpdateWeightUnit'
import { meQuery } from '#/lib/queries'
import { supabase } from '#/lib/supabase'
import type { WeightUnit } from '#/types/api'

export const Route = createFileRoute('/_app/account')({
  component: Account,
})

const units: { value: WeightUnit; label: string }[] = [
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'kg', label: 'Kilograms (kg)' },
]

function Account() {
  const { data: me, isPending, error } = useQuery(meQuery)
  const updateWeightUnit = useUpdateWeightUnit()

  return (
    <>
      <PageHeader title="Account" />
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending && <p>Loading…</p>}
            {error && <p className="text-red-600">{error.message}</p>}
            {me && <p className="font-heading break-all">{me.email}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight unit</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {units.map(({ value, label }) => (
              <Button
                key={value}
                variant={me?.weightUnit === value ? 'default' : 'neutral'}
                disabled={!me || updateWeightUnit.isPending}
                onClick={() => updateWeightUnit.mutate(value)}
                aria-pressed={me?.weightUnit === value}
              >
                {label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Button
          variant="neutral"
          className="self-start"
          onClick={() => supabase.auth.signOut()}
        >
          <LogOut />
          Sign out
        </Button>
      </div>
    </>
  )
}
