import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { StreakCalendar } from "@/components/gamification/StreakCalendar";
import { RatingGuide } from "@/components/gamification/RatingGuide";
import { DynamicLeaderboard } from "@/components/leaderboard/DynamicLeaderboard";
import { useBadges } from "@/hooks/useBadges";
import { useStreak } from "@/hooks/useStreak";
import { useRating } from "@/hooks/useRating";
import { Trophy, Flame, TrendingUp, Download, User, Target, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { generateProgressReportPDF } from "@/hooks/lib/progressPdfGenerator";
import { getUserProgress, getActivityCalendar } from "@/hooks/lib/userProgressService";
import { useAuth } from "@/contexts/AuthContext";
import { UserProgress } from "@/types/userProgress";
import { UserStreak, UserRating } from "@/types/gamification";
import { determineCategory } from "@/hooks/lib/firebaseUserService";

const ProgressPage = () => {
  const { user, isTeacher } = useAuth();
  
  // Safely load hooks with fallbacks
  let allBadges: any[] = [];
  let badgeStats = { total: 0, earned: 0, locked: 0, inProgress: 0 };
  let streak: UserStreak = {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: "",
    activityHistory: [],
    freezesRemaining: 1,
    totalActiveDays: 0,
  };
  let rating: UserRating = {
    current: 1200,
    peak: 1200,
    history: [],
    subjectRatings: [],
    percentile: 50,
    trend: "stable",
  };
  let breakdown: any = {};
  let milestones: any[] = [];
  let tips: any[] = [];
  
  try {
    const badgesData = useBadges();
    allBadges = badgesData?.allBadges || [];
    badgeStats = badgesData?.stats || badgeStats;
  } catch (e) {
    console.warn('Badges hook failed:', e);
  }
  
  try {
    const streakData = useStreak();
    streak = streakData?.streak || streak;
  } catch (e) {
    console.warn('Streak hook failed:', e);
  }
  
  try {
    const ratingData = useRating();
    rating = ratingData?.rating || rating;
    breakdown = ratingData?.breakdown || breakdown;
    milestones = ratingData?.milestones || [];
    tips = ratingData?.tips || [];
  } catch (e) {
    console.warn('Rating hook failed:', e);
  }
  
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [realCalendarData, setRealCalendarData] = useState<any[]>([]);

  const isLoading = false;

  // Load user progress and activity calendar
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    // Fetch fresh data from Firebase
    const progress = await getUserProgress(user.id);
    setUserProgress(progress);
    
    // Get real activity calendar data
    const activityData = getActivityCalendar(user.id);
    setRealCalendarData(activityData);
  };

  // Refresh data every 5 seconds to catch quiz updates from any device
  useEffect(() => {
    if (!user) return;
    
    // Load immediately
    loadUserData();
    
    const interval = setInterval(() => {
      loadUserData();
    }, 3000); // Reduced to 3 seconds for faster sync
    
    return () => clearInterval(interval);
  }, [user]);

  const handleDownloadPDF = () => {
    try {
      if (!userProgress) {
        alert('Please take a quiz first to generate your report!');
        return;
      }
      
      const overallAccuracy = userProgress.totalQuestionsAttempted > 0 
        ? (userProgress.correctAnswers / userProgress.totalQuestionsAttempted) * 100 
        : 0;
      const currentCategory = userProgress.totalQuestionsAttempted > 0
        ? determineCategory(overallAccuracy, userProgress.correctAnswers, userProgress.totalQuestionsAttempted)
        : 'average';
      
      generateProgressReportPDF({
        badges: allBadges,
        badgeStats,
        streak,
        streakStats: {
          currentStreak: userProgress.currentStreak,
          longestStreak: userProgress.longestStreak,
          totalActiveDays: userProgress.activeDays,
          thisMonthActiveDays: 0,
          averageActivitiesPerDay: 0,
        },
        calendarData: realCalendarData,
        rating,
        breakdown,
        milestones,
        tips,
        userProfile: {
          currentRating: userProgress.currentRating,
          peakRating: userProgress.highestRating,
          currentCategory,
          totalQuizzes: userProgress.totalQuizzesTaken,
          totalQuestionsAttempted: userProgress.totalQuestionsAttempted,
          totalCorrectAnswers: userProgress.correctAnswers,
          overallAccuracy,
        }
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  // Show message if user is not logged in
  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 pt-24">
        <Card className="p-12 text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view your progress dashboard
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

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

      {/* Overall Performance Card - Real User Data */}
      {user && userProgress && (
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
                <div className="text-3xl font-bold text-primary">{userProgress.currentRating}</div>
                <div className="text-sm text-muted-foreground mt-1">Current Rating</div>
                <div className="text-xs text-muted-foreground">Peak: {userProgress.highestRating}</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-accent/30 to-accent/10 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{userProgress.activeDays}</div>
                <div className="text-sm text-muted-foreground mt-1">Active Days</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {userProgress.totalQuestionsAttempted > 0 
                    ? ((userProgress.correctAnswers / userProgress.totalQuestionsAttempted) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{userProgress.totalQuizzesTaken}</div>
                <div className="text-sm text-muted-foreground mt-1">Quizzes Taken</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div>
                <div className="text-sm text-muted-foreground">Questions Attempted</div>
                <div className="text-2xl font-bold">{userProgress.totalQuestionsAttempted}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
                <div className="text-2xl font-bold text-green-600">{userProgress.correctAnswers}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
                <div className="text-2xl font-bold text-orange-600">{userProgress.currentStreak} 🔥</div>
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
              <div className="text-2xl font-bold">{userProgress?.currentStreak || 0}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 p-6 rounded-lg border">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{userProgress?.activeDays || 0}</div>
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
        <TabsList className={isTeacher ? "grid w-full grid-cols-4" : "grid w-full grid-cols-3"}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          {isTeacher && <TabsTrigger value="rating">Rating</TabsTrigger>}
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-1 gap-6">
            <StreakCalendar
              calendarData={realCalendarData}
              currentStreak={userProgress?.currentStreak || 0}
              longestStreak={userProgress?.longestStreak || 0}
              totalActiveDays={userProgress?.activeDays || 0}
            />
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <BadgeGrid badges={allBadges} showFilter={true} />
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
          <DynamicLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
