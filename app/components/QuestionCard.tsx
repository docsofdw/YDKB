"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/common/ui/card"
import { Button } from "@/app/components/common/ui/button"
import Image from "next/image"
import type { Player } from "@/app/types/game"

interface PlayerOption {
  id: number
  name: string
  team: string
  position: string
  jersey_number: string
  ppg: number
  college: string
  height?: string
  weight?: string
  experience?: string
}

interface QuestionCardProps {
  playerData: Player
  hintsRevealed: number
  onRevealHint: () => void
  maxHints: number
  question?: string
  options?: PlayerOption[]
  onSelect?: (index: number) => void
  selectedOption?: number | null
  correctOption?: number
  showAnswer?: boolean
}

export default function QuestionCard({
  playerData,
  hintsRevealed,
  onRevealHint,
  maxHints,
  question,
  options,
  onSelect,
  selectedOption,
  correctOption,
  showAnswer,
}: QuestionCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl">{question || `Guess the college for ${playerData.name}`}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display player info and hints based on hintsRevealed */}
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <p>Team: {playerData.team}</p>
            <p>Position: {playerData.position}</p>
            {hintsRevealed >= 1 && <p>Draft Year: {playerData.draftYear}</p>}
            {hintsRevealed >= 2 && playerData.imageUrl && (
              <div className="mt-4 overflow-hidden rounded-lg">
                <Image 
                  src={playerData.imageUrl}
                  alt={playerData.name}
                  width={200}
                  height={200}
                  className="object-cover"
                />
              </div>
            )}
          </div>
          
          {hintsRevealed < maxHints && (
            <Button onClick={onRevealHint} variant="outline">
              Reveal Hint ({hintsRevealed}/{maxHints})
            </Button>
          )}
        </div>

        {/* Original options UI - render conditionally if options are provided */}
        {options && onSelect && selectedOption !== undefined && correctOption !== undefined && showAnswer !== undefined && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option, index) => (
              <Button
                key={option.id}
                variant={
                  showAnswer
                    ? index === correctOption
                      ? "default"
                      : selectedOption === index
                      ? "destructive"
                      : "outline"
                    : selectedOption === index
                    ? "default"
                    : "outline"
                }
                onClick={() => !showAnswer && onSelect(index)}
                disabled={showAnswer}
                className="w-full h-auto py-4 text-left"
              >
                {option.college}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 