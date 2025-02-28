// app/archive/page.tsx
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card"

export default function ArchivePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Past Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Link key={i} href={`/play?date=${new Date().toISOString()}`}>
                <div className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <h3 className="font-medium">February {15 - i}, 2024</h3>
                  <p className="text-sm text-muted-foreground">Test your knowledge</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}