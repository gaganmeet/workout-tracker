import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">This screen is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
