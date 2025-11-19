import { useState } from "react";
import { Trophy, Medal, Award, Flame, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLeaderboard, type LeaderboardEntry } from "@/hooks/lib/gamification";

export const Leaderboard = () => {
  const [sortBy, setSortBy] = useState<'score' | 'accuracy' | 'streak' | 'badges'>('score');
  const leaderboard = getLeaderboard(sortBy);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };
  
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/10 text-yellow-700 border-yellow-500';
    if (rank === 2) return 'bg-gray-400/10 text-gray-700 border-gray-400';
    if (rank === 3) return 'bg-amber-600/10 text-amber-700 border-amber-600';
    return 'bg-muted';
  };
  
  const sortOptions = [
    { value: 'score', label: 'Total Score', icon: Target },
    { value: 'accuracy', label: 'Accuracy', icon: TrendingUp },
    { value: 'streak', label: 'Streak', icon: Flame },
    { value: 'badges', label: 'Badges', icon: Award },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Leaderboard
        </h2>
        <p className="text-muted-foreground">
          Compete with top learners and track your progress
        </p>
      </div>
        
      {/* Sort Options */}
      <Card className="border-0 shadow-strong mb-8">
          <CardHeader>
            <CardTitle>Sort By</CardTitle>
            <CardDescription>Choose how to rank students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'outline'}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setSortBy(option.value as typeof sortBy)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
      </Card>
        
      {/* Leaderboard Table */}
      <Card className="border-0 shadow-strong">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Ranked by {sortOptions.find(o => o.value === sortBy)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    entry.userName === 'You'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-16 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">
                        {entry.userName}
                      </h3>
                      {entry.userName === 'You' && (
                        <Badge variant="default" className="ml-2">You</Badge>
                      )}
                      {entry.rank <= 3 && (
                        <Badge className={getRankBadgeColor(entry.rank)}>
                          Top {entry.rank}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {entry.totalScore} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {entry.averageAccuracy.toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {entry.currentStreak} day streak
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {entry.badgeCount} badges
                      </span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="hidden md:flex flex-col items-end">
                    <div className="text-2xl font-bold text-primary">
                      {sortBy === 'score' && entry.totalScore}
                      {sortBy === 'accuracy' && `${entry.averageAccuracy.toFixed(1)}%`}
                      {sortBy === 'streak' && entry.currentStreak}
                      {sortBy === 'badges' && entry.badgeCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.totalQuizzes} quizzes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
      </Card>
        
      {/* Info Card */}
      <Card className="border-0 shadow-medium bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Trophy className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">How to Climb the Leaderboard</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complete more quizzes to increase your total score</li>
                  <li>• Maintain high accuracy to improve your ranking</li>
                  <li>• Build daily streaks for bonus points</li>
                  <li>• Earn badges to showcase your achievements</li>
                </ul>
              </div>
            </div>
          </CardContent>
      </Card>
    </div>
  );
};
