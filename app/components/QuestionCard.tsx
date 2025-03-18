"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/common/ui/card"
import { Button } from "@/app/components/common/ui/button"
import Image from "next/image"

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
  question: string
  options: PlayerOption[]
  onSelect: (index: number) => void
  selectedOption: number | null
  correctOption: number
  showAnswer: boolean
}

export default function QuestionCard({
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
        <CardTitle className="text-center text-xl">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  )
} 