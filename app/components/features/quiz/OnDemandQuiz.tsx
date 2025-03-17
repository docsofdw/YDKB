'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { saveUserGameHistory, saveUserQuestionHistory } from '@/app/lib/user-actions';
import { getRandomPlayer } from '@/app/lib/supabase-client';

type QuizState = 'setup' | 'loading' | 'in-progress' | 'completed';
type Difficulty = 'easy' | 'medium' | 'hard';

type Question = {
  id: number;
  playerId: number;
  playerName: string;
  playerImage?: string;
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  timeTaken?: number;
};

export default function OnDemandQuiz() {
  const { isSignedIn, isLoaded } = useUser();
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuiz = async () => {
    setQuizState('loading');
    setError(null);
    setIsGenerating(true);
    
    try {
      const generatedQuestions: Question[] = [];
      
      // Generate questions based on questionCount
      for (let i = 0; i < questionCount; i++) {
        const playerResult = await getRandomPlayer(difficulty);
        
        if (!playerResult || !playerResult.id) {
          throw new Error(`Failed to load player for question ${i + 1}`);
        }
        
        generatedQuestions.push({
          id: i + 1,
          playerId: playerResult.id,
          playerName: playerResult.name,
          playerImage: playerResult.image_url || undefined,
          correctAnswer: playerResult.name.toLowerCase(),
        });
      }
      
      setQuestions(generatedQuestions);
      setQuizState('in-progress');
      setCurrentQuestionIndex(0);
      setScore(0);
      setStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setTotalTimeTaken(0);
      setUserAnswer('');
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz. Please try again.');
      setQuizState('setup');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(e.target.value);
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      return; // Don't submit empty answers
    }
    
    const now = Date.now();
    const questionTimeTaken = questionStartTime ? (now - questionStartTime) / 1000 : 0;
    
    // Get current question
    const currentQuestion = questions[currentQuestionIndex];
    
    // Check if answer is correct (case insensitive)
    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    
    // Update question with user's answer
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer,
      isCorrect,
      timeTaken: questionTimeTaken,
    };
    
    setQuestions(updatedQuestions);
    
    // Update score
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Update total time
    setTotalTimeTaken(totalTimeTaken + questionTimeTaken);
    
    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setQuestionStartTime(now);
    } else {
      completeQuiz(updatedQuestions, isCorrect ? score + 1 : score);
    }
  };

  const completeQuiz = async (finalQuestions: Question[], finalScore: number) => {
    setQuizState('completed');
    
    if (isSignedIn) {
      try {
        // Save game history
        const gameData = {
          score: finalScore,
          correct_answers: finalScore,
          total_questions: questions.length,
          time_taken: totalTimeTaken,
          difficulty,
          game_date: new Date().toISOString().split('T')[0]
        };
        
        const gameResult = await saveUserGameHistory(gameData);
        
        if (gameResult.success && gameResult.gameId) {
          // Save question history
          const questionData = finalQuestions.map((q, index) => ({
            game_id: gameResult.gameId,
            player_id: q.playerId,
            answered_correctly: q.isCorrect || false,
            time_taken: q.timeTaken || 0,
          }));
          
          await saveUserQuestionHistory(gameResult.gameId, questionData);
        }
      } catch (err) {
        console.error('Error saving quiz results:', err);
        // Don't show error to user, just log it
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  const resetQuiz = () => {
    setQuizState('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer('');
    setError(null);
  };

  if (!isLoaded) {
    return (
      <div className="p-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="p-4 text-center">
        <p>Please sign in to play quizzes.</p>
      </div>
    );
  }

  if (quizState === 'setup') {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6 text-center">Create Your Quiz</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <div className="flex space-x-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-md ${
                    difficulty === d
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <div className="flex space-x-4">
              {[3, 5, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`px-4 py-2 rounded-md ${
                    questionCount === count
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={generateQuiz}
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating Quiz...' : 'Start Quiz'}
          </button>
        </div>
      </div>
    );
  }

  if (quizState === 'loading') {
    return (
      <div className="p-4 text-center">
        <p>Generating your quiz...</p>
      </div>
    );
  }

  if (quizState === 'completed') {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Quiz Completed!</h2>
        <p className="text-lg mb-2">Your Score: {score}/{questions.length}</p>
        <p className="text-sm text-gray-500 mb-6">Time: {totalTimeTaken.toFixed(1)} seconds</p>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="font-bold mb-2">Results</h3>
          {questions.map((question, index) => (
            <div key={index} className="mb-4 p-3 rounded border border-gray-200">
              <p className="font-medium">Question {index + 1}: Who is this player?</p>
              {question.playerImage && (
                <div className="my-2">
                  <img 
                    src={question.playerImage} 
                    alt="NFL Player" 
                    className="mx-auto h-32 object-cover rounded"
                  />
                </div>
              )}
              <p className="text-sm">
                Your answer: <span className={question.isCorrect ? 'text-green-600' : 'text-red-600'}>
                  {question.userAnswer}
                </span>
              </p>
              {!question.isCorrect && (
                <p className="text-sm text-green-600">Correct answer: {question.playerName}</p>
              )}
              <p className="text-xs text-gray-500">Time: {question.timeTaken?.toFixed(1)}s</p>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-4 justify-center">
          <button
            onClick={resetQuiz}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            New Quiz
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // In-progress state
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm font-medium">
          Question {currentQuestionIndex + 1}/{questions.length}
        </span>
        <span className="text-sm text-gray-500">
          Score: {score}
        </span>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Who is this NFL player?</h2>
        
        {currentQuestion.playerImage && (
          <div className="mb-6">
            <img 
              src={currentQuestion.playerImage} 
              alt="NFL Player" 
              className="mx-auto h-48 object-cover rounded"
            />
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="text"
            value={userAnswer}
            onChange={handleAnswerChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter player name"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        
        <button
          onClick={handleSubmitAnswer}
          disabled={!userAnswer.trim()}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
        
        <button
          onClick={() => {
            const now = Date.now();
            const questionTimeTaken = questionStartTime ? (now - questionStartTime) / 1000 : 0;
            
            // Get current question
            const currentQuestion = questions[currentQuestionIndex];
            
            // Update question with user's answer
            const updatedQuestions = [...questions];
            updatedQuestions[currentQuestionIndex] = {
              ...currentQuestion,
              userAnswer: "I don't know",
              isCorrect: false,
              timeTaken: questionTimeTaken,
            };
            
            setQuestions(updatedQuestions);
            
            // Update total time
            setTotalTimeTaken(totalTimeTaken + questionTimeTaken);
            
            // Move to next question or complete quiz
            if (currentQuestionIndex < questions.length - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              setUserAnswer('');
              setQuestionStartTime(now);
            } else {
              completeQuiz(updatedQuestions, score);
            }
          }}
          className="w-full mt-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-100"
        >
          I don't know ball
        </button>
      </div>
    </div>
  );
} 