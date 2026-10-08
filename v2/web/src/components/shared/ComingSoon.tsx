import { Construction } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { PageHeader } from './PageHeader'

export function ComingSoon({
  page,
  description,
}: {
  page: string
  description: string
}) {
  return (
    <>
      <PageHeader title={page} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Construction className="size-10" />
          <p className="font-heading">Coming soon</p>
        </CardContent>
      </Card>
    </>
  )
}
