export function PageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-heading md:text-4xl">{title}</h1>
      {description && <p className="mt-1">{description}</p>}
    </header>
  )
}
