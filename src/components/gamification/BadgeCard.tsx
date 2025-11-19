import { BadgeProgress } from "@/types/gamification";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, Check } from "lucide-react";
import { cn } from "@/hooks/lib/utils";

interface BadgeCardProps {
  badgeProgress: BadgeProgress;
  onClick?: () => void;
}

export const BadgeCard = ({ badgeProgress, onClick }: BadgeCardProps) => {
  const { badge, progress, isUnlocked, earnedAt } = badgeProgress;

  const rarityColors = {
    common: "bg-gray-500",
    rare: "bg-blue-500",
    epic: "bg-purple-500",
    legendary: "bg-yellow-500",
  };

  const rarityBorderColors = {
    common: "border-gray-300",
    rare: "border-blue-300",
    epic: "border-purple-300",
    legendary: "border-yellow-300",
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer",
        isUnlocked ? rarityBorderColors[badge.rarity] : "opacity-60",
        !isUnlocked && "grayscale"
      )}
      onClick={onClick}
    >
      {/* Rarity indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1",
          rarityColors[badge.rarity]
        )}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="text-4xl">{badge.icon}</div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={isUnlocked ? "default" : "secondary"} className="text-xs">
              {badge.rarity}
            </Badge>
            {isUnlocked && (
              <div className="flex items-center gap-1 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-xs font-medium">Unlocked</span>
              </div>
            )}
            {!isUnlocked && progress === 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span className="text-xs">Locked</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {badge.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{badge.requirement}</span>
            {!isUnlocked && (
              <span className="font-medium">{Math.round(progress)}%</span>
            )}
          </div>

          {!isUnlocked && progress > 0 && (
            <Progress value={progress} className="h-2" />
          )}

          {isUnlocked && earnedAt && (
            <p className="text-xs text-muted-foreground">
              Earned on {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
