import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getGlobalLeaderboard } from '@/lib/userProgressService';
import { LeaderboardEntry } from '@/types/userProgress';
import { Trophy, Medal, Award, TrendingUp, Target, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const DynamicLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'quizzes' | 'accuracy'>('rating');

  useEffect(() => {
    loadLeaderboard();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [sortBy]);

  const loadLeaderboard = () => {
    let data = getGlobalLeaderboard();
    
    // Sort based on selected criteria
    if (sortBy === 'quizzes') {
      data.sort((a, b) => b.totalQuizzes - a.totalQuizzes);
    } else if (sortBy === 'accuracy') {
      data.sort((a, b) => b.accuracy - a.accuracy);
    }
    
    // Reassign ranks after sorting
    data.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    setLeaderboard(data);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    if (rank === 3) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2100) return 'text-red-600 dark:text-red-400';
    if (rating >= 1800) return 'text-purple-600 dark:text-purple-400';
    if (rating >= 1500) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 1300) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (leaderboard.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Rankings Yet</h3>
        <p className="text-muted-foreground mb-4">
          Be the first to take a quiz and appear on the leaderboard!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Global Leaderboard</h2>
          <p className="text-muted-foreground">Compete with students worldwide</p>
        </div>
        
        {/* Sort Options */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('rating')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Rating
          </Button>
          <Button
            variant={sortBy === 'quizzes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('quizzes')}
          >
            <Target className="w-4 h-4 mr-2" />
            Quizzes
          </Button>
          <Button
            variant={sortBy === 'accuracy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('accuracy')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Accuracy
          </Button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const isCurrentUser = user && entry.userId === user.id;
          
          return (
            <Card
              key={entry.userId}
              className={`p-4 transition-all hover:shadow-md ${
                isCurrentUser ? 'border-2 border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-16 flex items-center justify-center">
                  {getRankIcon(entry.rank || index + 1)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">
                      {entry.userName}
                      {isCurrentUser && (
                        <Badge variant="default" className="ml-2 text-xs">You</Badge>
                      )}
                    </h3>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1">
                    {entry.badges.slice(0, 3).map((badge, i) => (
                      <span key={i} className="text-xs">
                        {badge}
                      </span>
                    ))}
                    {entry.badges.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{entry.badges.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  {/* Rating */}
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getRatingColor(entry.rating)}`}>
                      {entry.rating}
                    </div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>

                  {/* Quizzes */}
                  <div className="text-center hidden sm:block">
                    <div className="text-lg font-semibold">{entry.totalQuizzes}</div>
                    <div className="text-xs text-muted-foreground">Quizzes</div>
                  </div>

                  {/* Accuracy */}
                  <div className="text-center hidden md:block">
                    <div className="text-lg font-semibold">{entry.accuracy}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>

                  {/* Active Days */}
                  <div className="text-center hidden lg:block">
                    <div className="text-lg font-semibold">{entry.activeDays}</div>
                    <div className="text-xs text-muted-foreground">Days</div>
                  </div>
                </div>

                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <Badge className={getRankBadgeColor(entry.rank || index + 1)}>
                    Rank #{entry.rank || index + 1}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Footer Info */}
      {user && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Your Position:</strong> {leaderboard.find(e => e.userId === user.id)?.rank || 'Not ranked yet'}
              {' • '}
              Take more quizzes to climb the ranks!
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
