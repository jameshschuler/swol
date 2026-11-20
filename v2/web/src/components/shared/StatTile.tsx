import { Card, CardContent } from '#/components/ui/card'

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm">{label}</p>
        <p className="font-heading text-2xl">{value}</p>
      </CardContent>
    </Card>
  )
}
