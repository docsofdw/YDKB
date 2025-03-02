import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserStats, getUserGameHistory } from "@/app/lib/user-utils";

// Function to format game result
function formatGameResult(game: any) {
  const winRate = game.correct_answers / game.total_questions;
  return {
    result: winRate >= 0.7 ? 'win' : 'loss',
    date: game.game_date,
    score: game.score,
    correctAnswers: game.correct_answers,
    totalQuestions: game.total_questions
  };
}

export default async function ProfilePage() {
  // Wrap in try/catch to handle potential Clerk errors
  try {
    const auth_result = await auth();
    const userId = auth_result.userId;
    
    // If no user is found, redirect to login
    if (!userId) {
      redirect("/login");
    }

    // Get user details from Clerk
    const res = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });
    
    const user = await res.json();

    // Fetch user-specific stats from Supabase
    const userStats = await getUserStats() || {
      total_games: 0,
      win_rate: 0,
      current_streak: 0,
      last_played_at: new Date().toISOString()
    };

    // Fetch recent game history
    const gameHistory = await getUserGameHistory(5) || [];
    const recentResults = gameHistory.map(formatGameResult);

    // Format date for better display
    const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Define achievements based on stats
    const achievements = [
      { 
        name: "First Win", 
        description: "Win your first game", 
        unlocked: userStats.total_games > 0 && userStats.win_rate > 0 
      },
      { 
        name: "Streak Master", 
        description: "Maintain a 5-day streak", 
        unlocked: userStats.current_streak >= 5 
      },
      { 
        name: "Perfect Score", 
        description: "Win a game without any wrong guesses", 
        unlocked: gameHistory.some(game => 
          game.correct_answers === game.total_questions && game.total_questions > 0
        ) 
      },
    ];

    return (
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                {user.image_url && (
                  <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={user.image_url} 
                      alt={user.first_name || "User"} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-muted-foreground">{user.email_addresses[0]?.email_address}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="font-medium">Member since {memberSince}</Badge>
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    {userStats.current_streak} Day Streak 🔥
                  </Badge>
                </div>
              </div>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md" asChild>
              <Link href="/play">Play Now</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-midnight-navy shadow-md border-0">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg font-medium text-chalk-white">Games Played</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-chalk-white">{userStats.total_games}</p>
              <p className="text-sm text-silver-gray mt-1">Across all difficulty levels</p>
            </CardContent>
          </Card>
          
          <Card className="bg-midnight-navy shadow-md border-0">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg font-medium text-chalk-white">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-chalk-white">{userStats.win_rate?.toFixed(1)}%</p>
              <p className="text-sm text-silver-gray mt-1">Keep improving!</p>
            </CardContent>
          </Card>
          
          <Card className="bg-midnight-navy shadow-md border-0">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg font-medium text-chalk-white">Last Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-medium text-chalk-white">
                {userStats.last_played_at 
                  ? new Date(userStats.last_played_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Never played'
                }
              </p>
              <p className="text-sm text-silver-gray mt-1">Come back daily for streaks!</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-midnight-navy shadow-md border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-chalk-white">Recent Activity</CardTitle>
              <CardDescription className="text-silver-gray">Your latest game results</CardDescription>
            </CardHeader>
            <CardContent>
              {recentResults.length > 0 ? (
                <div className="space-y-4">
                  {recentResults.map((game, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-700 pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${game.result === 'win' ? 'bg-victory-green' : 'bg-penalty-red'}`}></div>
                        <span className="font-medium text-chalk-white">{game.result === 'win' ? 'Victory' : 'Defeat'}</span>
                        <span className="text-sm text-silver-gray">
                          {game.correctAnswers}/{game.totalQuestions} correct
                        </span>
                      </div>
                      <span className="text-sm text-silver-gray">
                        {new Date(game.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-silver-gray">
                  <p>No games played yet</p>
                  <p className="text-sm mt-2">Play your first game to see results here</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="outline" className="w-full text-chalk-white border-gray-700 hover:bg-gray-800" asChild>
                <Link href="/history">View All History</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-midnight-navy shadow-md border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-chalk-white">Achievements</CardTitle>
              <CardDescription className="text-silver-gray">Milestones you've reached</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 border-b border-gray-700 pb-3 last:border-0">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-deep-slate' 
                        : 'bg-gray-700 text-silver-gray'
                    }`}>
                      {achievement.unlocked ? '🏆' : '🔒'}
                    </div>
                    <div>
                      <p className="font-medium text-chalk-white">{achievement.name}</p>
                      <p className="text-sm text-silver-gray">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="outline" className="w-full text-chalk-white border-gray-700 hover:bg-gray-800" asChild>
                <Link href="/achievements">View All Achievements</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in profile page:', error);
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
        <p className="mb-6">There was an error loading your profile information.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }
} 