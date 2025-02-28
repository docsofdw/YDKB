import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

// Function to fetch user stats from database (mock for now)
async function getUserStats(userId: string) {
  // In a real app, you would fetch this data from your database
  // For now, we'll return mock data but pretend it's user-specific
  return {
    streak: 7,
    totalGamesPlayed: 42,
    winRate: 68,
    lastActive: new Date(),
    recentResults: [
      { result: "win", date: "2023-06-01" },
      { result: "win", date: "2023-06-02" },
      { result: "loss", date: "2023-06-03" },
      { result: "win", date: "2023-06-04" },
      { result: "win", date: "2023-06-05" },
    ],
    achievements: [
      { name: "First Win", description: "Win your first game", unlocked: true },
      { name: "Streak Master", description: "Maintain a 5-day streak", unlocked: true },
      { name: "Perfect Score", description: "Win a game without any wrong guesses", unlocked: false },
    ]
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

    // Fetch user-specific stats
    const userStats = await getUserStats(userId);

    // Format date for better display
    const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.imageUrl && (
                  <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={user.imageUrl} 
                      alt={user.firstName || "User"} 
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
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-muted-foreground">{user.emailAddresses[0]?.emailAddress}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="font-medium">Member since {memberSince}</Badge>
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    {userStats.streak} Day Streak 🔥
                  </Badge>
                </div>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md" asChild>
              <Link href="/play">Play Now</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-700">Games Played</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{userStats.totalGamesPlayed}</p>
              <p className="text-sm text-muted-foreground">Across all difficulty levels</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-700">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{userStats.winRate}%</p>
              <p className="text-sm text-muted-foreground">Keep improving!</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-gray-700">Last Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-medium">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-sm text-muted-foreground">Come back daily for streaks!</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest game results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userStats.recentResults.map((game, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${game.result === 'win' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium">{game.result === 'win' ? 'Victory' : 'Defeat'}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(game.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All History</Button>
            </CardFooter>
          </Card>

          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Milestones you've reached</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userStats.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 border-b pb-3 last:border-0">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-amber-300 to-amber-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {achievement.unlocked ? '🏆' : '🔒'}
                    </div>
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Achievements</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in profile page:", error);
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>We couldn't load your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Please try again later or contact support if the issue persists.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
} 