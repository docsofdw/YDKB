import { GameProvider } from "@/app/hooks/useGameContext"

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-deep-slate flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-10 flex flex-col">
        <GameProvider>{children}</GameProvider>
      </div>
    </div>
  )
} 