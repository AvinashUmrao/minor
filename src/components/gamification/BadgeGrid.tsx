import { useState } from "react";
import { BadgeProgress } from "@/types/gamification";
import { BadgeCard } from "./BadgeCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BadgeGridProps {
  badges: BadgeProgress[];
  showFilter?: boolean;
}

export const BadgeGrid = ({ badges, showFilter = true }: BadgeGridProps) => {
  const [selectedBadge, setSelectedBadge] = useState<BadgeProgress | null>(null);
  const [filter, setFilter] = useState<"all" | "earned" | "locked" | "progress">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredBadges = badges.filter((bp) => {
    // Status filter
    if (filter === "earned" && !bp.isUnlocked) return false;
    if (filter === "locked" && (bp.isUnlocked || bp.progress > 0)) return false;
    if (filter === "progress" && (bp.isUnlocked || bp.progress === 0)) return false;

    // Category filter
    if (categoryFilter !== "all" && bp.badge.category !== categoryFilter) return false;

    return true;
  });

  const stats = {
    total: badges.length,
    earned: badges.filter((b) => b.isUnlocked).length,
    inProgress: badges.filter((b) => !b.isUnlocked && b.progress > 0).length,
    locked: badges.filter((b) => !b.isUnlocked && b.progress === 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{stats.earned}</div>
          <div className="text-sm text-muted-foreground">Earned</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{stats.inProgress}</div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{stats.locked}</div>
          <div className="text-sm text-muted-foreground">Locked</div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">{Math.round((stats.earned / stats.total) * 100)}%</div>
          <div className="text-sm text-muted-foreground">Completion</div>
        </div>
      </div>

      {/* Filters */}
      {showFilter && (
        <div className="space-y-4">
          <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="earned">Earned ({stats.earned})</TabsTrigger>
              <TabsTrigger value="progress">In Progress ({stats.inProgress})</TabsTrigger>
              <TabsTrigger value="locked">Locked ({stats.locked})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={categoryFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("all")}
            >
              All
            </Button>
            <Button
              variant={categoryFilter === "achievement" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("achievement")}
            >
              Achievement
            </Button>
            <Button
              variant={categoryFilter === "performance" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("performance")}
            >
              Performance
            </Button>
            <Button
              variant={categoryFilter === "learning" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("learning")}
            >
              Learning
            </Button>
            <Button
              variant={categoryFilter === "social" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("social")}
            >
              Social
            </Button>
          </div>
        </div>
      )}

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badgeProgress) => (
          <BadgeCard
            key={badgeProgress.badge.id}
            badgeProgress={badgeProgress}
            onClick={() => setSelectedBadge(badgeProgress)}
          />
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No badges found with current filters</p>
        </div>
      )}

      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
        <DialogContent>
          {selectedBadge && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-5xl">{selectedBadge.badge.icon}</div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedBadge.badge.name}</DialogTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge>{selectedBadge.badge.rarity}</Badge>
                      <Badge variant="outline">{selectedBadge.badge.category}</Badge>
                    </div>
                  </div>
                </div>
                <DialogDescription className="text-base">
                  {selectedBadge.badge.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-2">How to Earn</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedBadge.badge.requirement}
                  </p>
                </div>

                {!selectedBadge.isUnlocked && (
                  <div>
                    <h4 className="font-semibold mb-2">Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion</span>
                        <span className="font-medium">{Math.round(selectedBadge.progress)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${selectedBadge.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedBadge.isUnlocked && selectedBadge.earnedAt && (
                  <div>
                    <h4 className="font-semibold mb-2">Earned</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedBadge.earnedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
