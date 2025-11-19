import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useFirebaseQuiz } from "@/hooks/useFirebaseQuiz";
import { getCategoryPerformance, CategoryPerformance } from "@/hooks/lib/firebaseUserService";
import {
  Trophy,
  TrendingUp,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  BarChart3,
  Users,
} from "lucide-react";

const CategoryDashboard = () => {
  const { category } = useParams<{ category: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { quizHistory, loading } = useFirebaseQuiz();
  const [categoryPerf, setCategoryPerf] = useState<CategoryPerformance | null>(null);
  const [loadingPerf, setLoadingPerf] = useState(true);

  const categoryName = category?.toUpperCase() || "GATE";
  const categoryKey = category?.toLowerCase() as 'gate' | 'jee' | 'cat';

  useEffect(() => {
    const loadCategoryPerformance = async () => {
      if (!user) return;
      
      setLoadingPerf(true);
      const perf = await getCategoryPerformance(user.id, categoryKey);
      setCategoryPerf(perf);
      setLoadingPerf(false);
    };

    loadCategoryPerformance();
  }, [user, categoryKey]);

  // Refresh data every 3 seconds to sync across devices
  useEffect(() => {
    if (!user || !categoryKey) return;
    
    const interval = setInterval(async () => {
      const perf = await getCategoryPerformance(user.id, categoryKey);
      setCategoryPerf(perf);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [user, categoryKey]);

  // Filter quiz history for this category
  const categoryQuizzes = quizHistory.filter(
    (quiz) => quiz.examType.toLowerCase() === categoryKey
  );

  const recentQuizzes = categoryQuizzes.slice(0, 10);

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please login to view your dashboard</p>
            <Button onClick={() => navigate('/auth')}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || loadingPerf) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your {categoryName} dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryBadgeVariant = (cat: string) => {
    if (cat === 'good') return 'default';
    if (cat === 'average') return 'secondary';
    return 'destructive';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 1800) return 'text-purple-600 dark:text-purple-400';
    if (rating >= 1400) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 1000) return 'text-green-600 dark:text-green-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <Badge variant="outline" className="mb-4">{categoryName} Dashboard</Badge>
        <h1 className="text-4xl font-bold mb-2">Your {categoryName} Performance</h1>
        <p className="text-muted-foreground text-lg">
          Track your progress and improve your {categoryName} preparation
        </p>
      </div>

      {/* Performance Overview */}
      {categoryPerf ? (
        <>
          {/* Rating & Category Card */}
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Rating */}
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${getRatingColor(categoryPerf.rating)}`} />
                  <div className={`text-3xl font-bold ${getRatingColor(categoryPerf.rating)}`}>
                    {categoryPerf.rating}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Current Rating</div>
                  <div className="text-xs text-muted-foreground">Peak: {categoryPerf.peakRating}</div>
                </div>

                {/* Category */}
                <div className="text-center p-4 bg-gradient-to-br from-accent/30 to-accent/10 rounded-lg">
                  <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <Badge variant={getCategoryBadgeVariant(categoryPerf.category)} className="text-lg px-4 py-1">
                    {categoryPerf.category.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-2">Category</div>
                </div>

                {/* Accuracy */}
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-3xl font-bold text-green-600">
                    {categoryPerf.overallAccuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
                </div>

                {/* Quizzes */}
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-3xl font-bold text-blue-600">
                    {categoryPerf.totalQuizzes}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Quizzes Taken</div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Questions Attempted</div>
                  <div className="text-2xl font-bold">{categoryPerf.totalQuestionsAttempted}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Correct Answers</div>
                  <div className="text-2xl font-bold text-green-600">{categoryPerf.totalCorrectAnswers}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Active</div>
                  <div className="text-sm font-medium">
                    {new Date(categoryPerf.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button
              size="lg"
              variant="hero"
              className="w-full"
              onClick={() => navigate(`/${categoryKey}`)}
            >
              <Target className="w-5 h-5 mr-2" />
              {categoryPerf.hasCompletedInitialTest ? 'Take Quiz' : 'Take Initial Quiz'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => navigate('/progress')}
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Overall Progress
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => {
                navigate('/progress');
                // Trigger leaderboard tab after navigation
                setTimeout(() => {
                  const leaderboardTab = document.querySelector('[value="leaderboard"]') as HTMLElement;
                  leaderboardTab?.click();
                }, 100);
              }}
            >
              <Users className="w-5 h-5 mr-2" />
              View Leaderboard
            </Button>
          </div>

          {/* Recent Quiz History */}
          {recentQuizzes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentQuizzes.map((quiz, idx) => (
                    <div
                      key={quiz.id || idx}
                      className="flex items-center justify-between p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          quiz.accuracy >= 75 ? 'bg-green-100 dark:bg-green-900' :
                          quiz.accuracy >= 50 ? 'bg-yellow-100 dark:bg-yellow-900' :
                          'bg-red-100 dark:bg-red-900'
                        }`}>
                          {quiz.accuracy >= 50 ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{quiz.subject} - {quiz.quizType}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(quiz.timestamp?.seconds * 1000 || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-lg">{quiz.score}/{quiz.totalQuestions}</div>
                          <div className="text-sm text-muted-foreground">{quiz.accuracy.toFixed(0)}%</div>
                        </div>
                        <Badge
                          variant={quiz.ratingChange > 0 ? 'default' : 'destructive'}
                          className="min-w-[60px] justify-center"
                        >
                          {quiz.ratingChange > 0 ? '+' : ''}{quiz.ratingChange}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Quizzes Message */}
          {recentQuizzes.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Quizzes Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your {categoryName} preparation journey by taking your first quiz!
                </p>
                <Button onClick={() => navigate(`/${categoryKey}`)}>
                  Take Initial Quiz
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No data available for {categoryName}</p>
            <Button onClick={() => navigate(`/${categoryKey}`)}>
              Start {categoryName} Preparation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryDashboard;
