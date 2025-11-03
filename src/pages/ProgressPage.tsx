import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { StreakCalendar } from "@/components/gamification/StreakCalendar";
import { RatingDashboard } from "@/components/gamification/RatingDashboard";
import { RatingGuide } from "@/components/gamification/RatingGuide";
import { useBadges } from "@/hooks/useBadges";
import { useStreak } from "@/hooks/useStreak";
import { useRating } from "@/hooks/useRating";
import { Trophy, Flame, TrendingUp, LayoutDashboard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { generateProgressReportPDF } from "@/lib/progressPdfGenerator";
import { initializeSampleActivityData } from "@/lib/streakUtils";

const ProgressPage = () => {
  const { allBadges, stats: badgeStats, isLoading: badgesLoading } = useBadges();
  const { streak, stats: streakStats, calendarData, isLoading: streakLoading, refreshStreak } = useStreak();
  const { rating, breakdown, milestones, tips, isLoading: ratingLoading } = useRating();

  const isLoading = badgesLoading || streakLoading || ratingLoading;

  // Initialize sample data if no activity exists
  useEffect(() => {
    if (!streakLoading && calendarData.length > 0) {
      const hasAnyActivity = calendarData.some(day => day.activityCount > 0);
      if (!hasAnyActivity) {
        initializeSampleActivityData();
        refreshStreak();
      }
    }
  }, [streakLoading, calendarData, refreshStreak]);

  const handleDownloadPDF = () => {
    try {
      generateProgressReportPDF({
        badges: allBadges,
        badgeStats,
        streak,
        streakStats,
        calendarData,
        rating,
        breakdown,
        milestones,
        tips
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <Badge variant="outline" className="mb-4">Your Progress</Badge>
          <h1 className="text-4xl font-bold mb-2">Track Your Journey</h1>
          <p className="text-muted-foreground text-lg">
            Monitor your achievements, streaks, and rating improvements
          </p>
        </div>
        <Button onClick={handleDownloadPDF} size="lg" className="gap-2">
          <Download className="w-5 h-5" />
          Download PDF Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-6 rounded-lg border">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold">{badgeStats.earned}</div>
              <div className="text-sm text-muted-foreground">Badges Earned</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 p-6 rounded-lg border">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold">{streak.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg border">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{rating.current}</div>
              <div className="text-sm text-muted-foreground">Current Rating</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 p-6 rounded-lg border">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{streakStats.totalActiveDays}</div>
              <div className="text-sm text-muted-foreground">Active Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="rating">Rating</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <RatingDashboard
              rating={rating}
              breakdown={breakdown}
              milestones={milestones}
            />
            <div className="space-y-6">
              <StreakCalendar
                calendarData={calendarData}
                currentStreak={streak.currentStreak}
                longestStreak={streak.longestStreak}
                totalActiveDays={streakStats.totalActiveDays}
              />
            </div>
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <BadgeGrid badges={allBadges} showFilter={true} />
        </TabsContent>

        {/* Streak Tab */}
        <TabsContent value="streak">
          <StreakCalendar
            calendarData={calendarData}
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
            totalActiveDays={streakStats.totalActiveDays}
          />
        </TabsContent>

        {/* Rating Tab */}
        <TabsContent value="rating" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <RatingDashboard
              rating={rating}
              breakdown={breakdown}
              milestones={milestones}
            />
            <RatingGuide
              tips={tips}
              subjectRatings={rating.subjectRatings}
              currentRating={rating.current}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
