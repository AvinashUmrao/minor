import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { StreakCalendar } from "@/components/gamification/StreakCalendar";
import { RatingGuide } from "@/components/gamification/RatingGuide";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { useBadges } from "@/hooks/useBadges";
import { useStreak } from "@/hooks/useStreak";
import { useRating } from "@/hooks/useRating";
import { Trophy, Flame, TrendingUp, Download, User, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { generateProgressReportPDF } from "@/lib/progressPdfGenerator";
import { initializeSampleActivityData } from "@/lib/streakUtils";
import { useFirebaseQuiz } from "@/hooks/useFirebaseQuiz";
import { useAuth } from "@/contexts/AuthContext";

const ProgressPage = () => {
  const { user } = useAuth();
  const { allBadges, stats: badgeStats, isLoading: badgesLoading } = useBadges();
  const { streak, stats: streakStats, calendarData, isLoading: streakLoading, refreshStreak } = useStreak();
  const { rating, breakdown, milestones, tips, isLoading: ratingLoading } = useRating();
  const { userProfile, quizHistory, loading: firebaseLoading } = useFirebaseQuiz();

  const isLoading = badgesLoading || streakLoading || ratingLoading || firebaseLoading;

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
        tips,
        // Pass Firebase user profile data for accurate rating
        userProfile: userProfile ? {
          currentRating: userProfile.currentRating,
          peakRating: userProfile.peakRating,
          currentCategory: userProfile.currentCategory,
          totalQuizzes: userProfile.totalQuizzes,
          totalQuestionsAttempted: userProfile.totalQuestionsAttempted,
          totalCorrectAnswers: userProfile.totalCorrectAnswers,
          overallAccuracy: userProfile.overallAccuracy,
        } : undefined
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
    <div className="container mx-auto py-12 px-4 pt-24">
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

      {/* Overall Performance Card - Firebase Data */}
      {user && userProfile && (
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold text-primary">{userProfile.currentRating}</div>
                <div className="text-sm text-muted-foreground mt-1">Current Rating</div>
                <div className="text-xs text-muted-foreground">Peak: {userProfile.peakRating}</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-accent/30 to-accent/10 rounded-lg">
                <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                <Badge variant={userProfile.currentCategory === 'good' ? 'default' : userProfile.currentCategory === 'average' ? 'secondary' : 'destructive'} className="text-lg px-4 py-1">
                  {userProfile.currentCategory.toUpperCase()}
                </Badge>
                <div className="text-sm text-muted-foreground mt-2">Category</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{userProfile.overallAccuracy.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{userProfile.totalQuizzes}</div>
                <div className="text-sm text-muted-foreground mt-1">Quizzes Taken</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div>
                <div className="text-sm text-muted-foreground">Questions Attempted</div>
                <div className="text-2xl font-bold">{userProfile.totalQuestionsAttempted}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
                <div className="text-2xl font-bold text-green-600">{userProfile.totalCorrectAnswers}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Member Since</div>
                <div className="text-sm font-medium">{new Date(userProfile.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats - Gamification Only */}
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

        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 p-6 rounded-lg border">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{streakStats.totalActiveDays}</div>
              <div className="text-sm text-muted-foreground">Active Days</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const leaderboardTab = document.querySelector('[value="leaderboard"]') as HTMLElement;
            leaderboardTab?.click();
          }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-6 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-purple-600" />
            <div className="text-left">
              <div className="text-lg font-bold">View Leaderboard</div>
              <div className="text-sm text-muted-foreground">See Rankings</div>
            </div>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="rating">Rating</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-1 gap-6">
            <StreakCalendar
              calendarData={calendarData}
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
              totalActiveDays={streakStats.totalActiveDays}
            />
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
          <RatingGuide
            tips={tips}
            subjectRatings={rating.subjectRatings}
            currentRating={rating.current}
          />
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
