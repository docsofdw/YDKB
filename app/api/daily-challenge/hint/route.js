import { NextResponse } from 'next/server';

export async function POST(request) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
  
  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  
  try {
    const { guess, answer } = await request.json();
    
    if (!guess || !answer) {
      return NextResponse.json(
        { error: 'Missing guess or answer' },
        { status: 400, headers }
      );
    }
    
    // Generate a hint based on the guess and correct answer
    const hint = generateHint(guess, answer);
    
    return NextResponse.json({ hint }, { headers });
  } catch (error) {
    console.error('Error generating hint:', error);
    return NextResponse.json(
      { error: 'Failed to generate hint' },
      { status: 500, headers }
    );
  }
}

function generateHint(guess, answer) {
  // Simple hint generation - you can make this more sophisticated
  // For example, comparing location, size, type of institution, etc.
  
  // Convert to lowercase for comparison
  const guessLower = guess.toLowerCase();
  const answerLower = answer.toLowerCase();
  
  // Example hints
  if (guessLower.includes('university') && answerLower.includes('university')) {
    return "You're on the right track with a university.";
  }
  
  if (guessLower.includes('college') && answerLower.includes('college')) {
    return "You're on the right track with a college.";
  }
  
  // Geographic hints (would need a database of college locations)
  // This is just a placeholder example
  const collegeRegions = {
    'harvard university': 'northeast',
    'stanford university': 'west',
    'university of michigan': 'midwest',
    // Add more colleges and their regions
  };
  
  const guessRegion = collegeRegions[guessLower];
  const answerRegion = collegeRegions[answerLower];
  
  if (guessRegion && answerRegion) {
    if (guessRegion === answerRegion) {
      return `You're looking in the right region!`;
    } else {
      return `Try looking in a different region.`;
    }
  }
  
  // Default hint
  return "That's not it. Try another college.";
} 