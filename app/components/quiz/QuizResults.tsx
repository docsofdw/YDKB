import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import SpriteIcon from '@/app/components/ui/SpriteIcon';

type QuizOption = {
  id: string;
  text: string;
};

type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: QuizQuestion[];
};

type QuizResultsProps = {
  quiz: Quiz;
  answers: Record<string, string>;
  timeSpent: number;
};

export default function QuizResults({ quiz, answers, timeSpent }: QuizResultsProps) {
  // Calculate the score
  const calculateScore = () => {
    let correctCount = 0;
    
    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (userAnswer && userAnswer === question.correctOptionId) {
        correctCount++;
      }
    });
    
    return {
      correct: correctCount,
      total: quiz.questions.length,
      percentage: Math.round((correctCount / quiz.questions.length) * 100)
    };
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const score = calculateScore();
  
  return (
    <Card className="quiz-results">
      <CardHeader>
        <CardTitle>Quiz Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-6xl font-bold mb-2">{score.percentage}%</div>
          <p className="text-xl">
            You got {score.correct} out of {score.total} questions correct
          </p>
          <p className="text-muted-foreground mt-2">
            Time spent: {formatTime(timeSpent)}
          </p>
        </div>
        
        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            const userAnswer = answers[question.id] || '';
            const isCorrect = userAnswer === question.correctOptionId;
            
            return (
              <div key={question.id} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <SpriteIcon id="check-circle" className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <SpriteIcon id="x-circle" className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {index + 1}. {question.text}
                    </p>
                    <div className="mt-2 space-y-1">
                      {question.options.map((option) => {
                        const isUserSelection = userAnswer === option.id;
                        const isCorrectOption = option.id === question.correctOptionId;
                        
                        let optionClass = 'text-gray-500';
                        if (isUserSelection && isCorrectOption) optionClass = 'text-green-600 font-medium';
                        else if (isUserSelection) optionClass = 'text-red-600 font-medium';
                        else if (isCorrectOption) optionClass = 'text-green-600 font-medium';
                        
                        return (
                          <p key={option.id} className={optionClass}>
                            {option.text} 
                            {isCorrectOption && ' ✓'}
                            {isUserSelection && !isCorrectOption && ' ✗'}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/play" className="w-full">
          <Button className="w-full">Return to Play</Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 