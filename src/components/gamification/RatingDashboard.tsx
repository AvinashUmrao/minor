import { UserRating, RatingBreakdown, RatingMilestone } from "@/types/gamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Award, Target } from "lucide-react";
import { cn } from "@/hooks/lib/utils";

interface RatingDashboardProps {
  rating: UserRating;
  breakdown: RatingBreakdown;
  milestones: RatingMilestone[];
}

export const RatingDashboard = ({ rating, breakdown, milestones }: RatingDashboardProps) => {
  const getTrendIcon = () => {
    if (rating.trend === "improving") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (rating.trend === "declining") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (rating.trend === "improving") return "text-green-600";
    if (rating.trend === "declining") return "text-red-600";
    return "text-gray-600";
  };

  const currentMilestone = milestones.find((m) => !m.isAchieved) || milestones[milestones.length - 1];

  return (
    <div className="space-y-6 mt-[1cm]">
      {/* Current Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Your Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-5xl font-bold">{rating.current}</div>
              <div className="flex items-center gap-2 mt-2">
                {getTrendIcon()}
                <span className={cn("text-sm font-medium", getTrendColor())}>
                  {rating.trend.charAt(0).toUpperCase() + rating.trend.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-2">
                Peak: <span className="font-semibold">{rating.peak}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Top <span className="font-semibold">{rating.percentile}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Base Rating</span>
            <span className="font-semibold">+{breakdown.base}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Quiz Performance</span>
            <span className="font-semibold text-green-600">+{breakdown.quizPerformance}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Accuracy Bonus</span>
            <span className="font-semibold text-blue-600">+{breakdown.accuracyBonus}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Streak Bonus</span>
            <span className="font-semibold text-orange-600">+{breakdown.streakBonus}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Consistency Bonus</span>
            <span className="font-semibold text-purple-600">+{breakdown.consistencyBonus}</span>
          </div>
          {breakdown.penalty > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Penalty</span>
              <span className="font-semibold text-red-600">-{breakdown.penalty}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-semibold">Total Rating</span>
            <span className="text-xl font-bold">{breakdown.total}</span>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rating Milestones</CardTitle>
            <Badge variant="outline">
              {milestones.filter((m) => m.isAchieved).length}/{milestones.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.rating} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {milestone.isAchieved ? (
                    <Award className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Target className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-semibold">{milestone.title}</div>
                    <div className="text-xs text-muted-foreground">{milestone.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{milestone.rating}</div>
                  {!milestone.isAchieved && (
                    <div className="text-xs text-muted-foreground">
                      {Math.round(milestone.progress)}%
                    </div>
                  )}
                </div>
              </div>
              {!milestone.isAchieved && milestone.progress > 0 && (
                <Progress value={milestone.progress} className="h-2" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Next Milestone */}
      {currentMilestone && !currentMilestone.isAchieved && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <div className="font-semibold">Next Goal: {currentMilestone.title}</div>
                <div className="text-sm text-muted-foreground">
                  {currentMilestone.rating - rating.current} points to go!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
