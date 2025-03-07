import * as React from "react";
import { cn } from "@/app/lib/utils";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Player type definition
export interface Player {
  id: string;
  name: string;
  score: number;
  trend: "up" | "down" | "neutral";
  rank: number;
  avatar?: string;
  gamesPlayed: number;
  winRate: number;
}

const trendIcons = {
  up: <TrendingUp className="w-4 h-4 text-emerald-500" />,
  down: <TrendingDown className="w-4 h-4 text-red-500" />,
  neutral: <Minus className="w-4 h-4 text-gray-400" />
};

export interface GameLeaderboardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  players: Player[];
  maxDisplay?: number;
}

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3
    }
  }
};

export function GameLeaderboard({
  title = "You Don't Know Ball Leaderboard",
  players,
  maxDisplay = 10,
  className,
  ...props
}: GameLeaderboardProps) {
  const displayPlayers = players.slice(0, maxDisplay);

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Header */}
      <div className="grid grid-cols-12 px-6 py-4 text-sm font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700/30">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-4">Player</div>
        <div className="col-span-2 text-center">Score</div>
        <div className="col-span-2 text-center">Games</div>
        <div className="col-span-2 text-center">Win Rate</div>
        <div className="col-span-1 text-center">Trend</div>
      </div>
      
      {/* Player rows */}
      <motion.div
        variants={tableVariants}
        initial="hidden"
        animate="visible"
        className="divide-y divide-gray-700/30"
      >
        {displayPlayers.map((player) => (
          <motion.div 
            key={player.id}
            variants={rowVariants}
            className="grid grid-cols-12 px-6 py-4 items-center hover:bg-surface/30 transition-colors"
          >
            {/* Rank with medal for top 3 */}
            <div className="col-span-1 text-center font-bold">
              {player.rank <= 3 ? (
                <span className="inline-block">
                  {player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : "🥉"}
                </span>
              ) : (
                <span className="text-gray-400">{player.rank}</span>
              )}
            </div>
            
            {/* Player name with avatar */}
            <div className="col-span-4 flex items-center gap-3">
              {player.avatar ? (
                <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-gray-700/30">
                  <img src={player.avatar} alt={player.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-surface/50 border-2 border-gray-700/30 flex items-center justify-center text-gray-400">
                  {player.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-100">{player.name}</p>
                <p className="text-xs text-gray-400">Player</p>
              </div>
            </div>
            
            {/* Score */}
            <div className="col-span-2 text-center">
              <span className="font-mono font-bold text-primary-green">
                {player.score.toLocaleString()}
              </span>
            </div>
            
            {/* Games Played */}
            <div className="col-span-2 text-center">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface/30 border border-gray-700/30 text-gray-100">
                🏀 {player.gamesPlayed}
              </span>
            </div>
            
            {/* Win Rate */}
            <div className="col-span-2 text-center">
              <span className={cn(
                "font-medium",
                player.winRate >= 70 ? "text-emerald-400" : 
                player.winRate >= 50 ? "text-blue-400" : 
                "text-orange-400"
              )}>
                {player.winRate}%
              </span>
            </div>
            
            {/* Trend indicator */}
            <div className="col-span-1 text-center">
              {trendIcons[player.trend]}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 