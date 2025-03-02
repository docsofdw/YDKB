import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';

// This would be replaced with actual data from Supabase
const MOCK_LEADERBOARD = [
  { 
    id: '1', 
    name: 'Jane Smith', 
    username: 'janesmith', 
    imageUrl: 'https://i.pravatar.cc/150?img=1',
    stats: {
      daily: { score: 95, streak: 7, rank: 1 },
      weekly: { score: 450, streak: 7, rank: 2 },
      allTime: { score: 2450, streak: 12, rank: 3 }
    }
  },
  { 
    id: '2', 
    name: 'John Doe', 
    username: 'johndoe', 
    imageUrl: 'https://i.pravatar.cc/150?img=2',
    stats: {
      daily: { score: 85, streak: 3, rank: 2 },
      weekly: { score: 520, streak: 5, rank: 1 },
      allTime: { score: 3200, streak: 15, rank: 1 }
    }
  },
  { 
    id: '3', 
    name: 'Alex Johnson', 
    username: 'alexj', 
    imageUrl: 'https://i.pravatar.cc/150?img=3',
    stats: {
      daily: { score: 75, streak: 2, rank: 3 },
      weekly: { score: 380, streak: 4, rank: 3 },
      allTime: { score: 2800, streak: 10, rank: 2 }
    }
  },
  { 
    id: '4', 
    name: 'You', 
    username: 'currentuser', 
    imageUrl: '',
    stats: {
      daily: { score: 70, streak: 1, rank: 4 },
      weekly: { score: 320, streak: 3, rank: 4 },
      allTime: { score: 1800, streak: 8, rank: 4 }
    }
  },
];

export default function FriendsLeaderboard() {
  const [timeFrame, setTimeFrame] = useState('daily');
  
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center font-bold">{rank}</span>;
    }
  };

  const sortedLeaderboard = [...MOCK_LEADERBOARD].sort((a, b) => {
    return a.stats[timeFrame as keyof typeof a.stats].rank - b.stats[timeFrame as keyof typeof b.stats].rank;
  });

  return (
    <div className="friends-leaderboard">
      <Card>
        <CardHeader>
          <CardTitle>Friends Leaderboard</CardTitle>
          <Tabs 
            defaultValue="daily" 
            className="w-full" 
            onValueChange={(value) => setTimeFrame(value)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="allTime">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {sortedLeaderboard.map((player) => {
              const stats = player.stats[timeFrame as keyof typeof player.stats];
              const isCurrentUser = player.username === 'currentuser';
              
              return (
                <li 
                  key={player.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(stats.rank)}
                    </div>
                    <Avatar>
                      <AvatarImage src={player.imageUrl} alt={player.name} />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">@{player.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{stats.score} pts</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.streak} day streak
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 