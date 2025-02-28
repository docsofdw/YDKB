import { GameProvider } from "@/app/hooks/useGameContext"

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <GameProvider>{children}</GameProvider>
} 