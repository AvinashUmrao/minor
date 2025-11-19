import { Award, Calendar, TrendingUp, Target, Flame, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getStudentProgress, getImprovementSuggestions } from "@/hooks/lib/gamification";
import { generateProgressPDF } from "@/hooks/lib/pdfGenerator";

export const ProgressHistory = () => {
  const progress = getStudentProgress();
  const suggestions = getImprovementSuggestions(progress);
  
  // Prepare chart data
  const recentQuizzes = progress.quizHistory.slice(-10);
  const accuracyTrendData = recentQuizzes.map((quiz, idx) => ({
    quiz: `Q${idx + 1}`,
    accuracy: quiz.accuracy,
    score: quiz.score,
  }));
  
  const categoryData = [
    { name: 'Low', value: progress.categoryProgression.Low, color: '#ef4444' },
    { name: 'Medium', value: progress.categoryProgression.Medium, color: '#f59e0b' },
    { name: 'Best', value: progress.categoryProgression.Best, color: '#22c55e' },
  ].filter(d => d.value > 0);
  
  const subjectPerformance = progress.quizHistory.reduce((acc, quiz) => {
    if (!acc[quiz.subject]) {
      acc[quiz.subject] = { correct: 0, total: 0 };
    }
    acc[quiz.subject].total++;
    acc[quiz.subject].correct += (quiz.accuracy / 100) * quiz.totalQuestions;
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);
  
  const subjectData = Object.entries(subjectPerformance).map(([subject, data]) => ({
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    accuracy: Math.round((data.correct / data.total) * 100),
  }));
  
  const handleExportPDF = () => {
    generateProgressPDF(progress, suggestions);
  };
  
  const getCategoryColor = (category: string) => {
    if (category === 'Best') return 'text-success';
    if (category === 'Medium') return 'text-warning';
    return 'text-destructive';
  };
  
  const getCategoryIcon = (category: string) => {
    if (category === 'Best') return '🟢';
    if (category === 'Medium') return '🟡';
    return '🔴';
  };
  
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Progress History
            </h1>
            <p className="text-xl text-muted-foreground">
              Track your learning journey and achievements
            </p>
          </div>
          <Button onClick={handleExportPDF} size="lg" variant="hero">
            <Download className="mr-2 h-5 w-5" />
            Export PDF Report
          </Button>
        </div>
        
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-strong">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-primary" />
                <span className="text-3xl font-bold">{progress.totalScore}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Score</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-strong">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-success" />
                <span className="text-3xl font-bold">{progress.averageAccuracy}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Avg Accuracy</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-strong">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8 text-orange-500" />
                <span className="text-3xl font-bold">{progress.currentStreak}</span>
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-strong">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-yellow-500" />
                <span className="text-3xl font-bold">{progress.badges.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Accuracy Trend */}
          <Card className="border-0 shadow-strong">
            <CardHeader>
              <CardTitle>Accuracy Trend</CardTitle>
              <CardDescription>Your performance over last 10 quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={accuracyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quiz" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} name="Accuracy %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Category Distribution */}
          <Card className="border-0 shadow-strong">
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Quizzes by difficulty category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Subject Performance */}
        {subjectData.length > 0 && (
          <Card className="border-0 shadow-strong mb-8">
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
              <CardDescription>Your accuracy across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#22c55e" name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        
        {/* Badges */}
        <Card className="border-0 shadow-strong mb-8">
          <CardHeader>
            <CardTitle>Badges Earned ({progress.badges.length})</CardTitle>
            <CardDescription>Your achievements and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {progress.badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {progress.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 rounded-lg border-2 border-primary/20 bg-primary/5 hover:border-primary/50 transition-all"
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <h4 className="font-semibold text-center mb-1">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      {badge.description}
                    </p>
                    {badge.earnedDate && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(badge.earnedDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No badges earned yet. Keep taking quizzes to unlock achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quiz History */}
        <Card className="border-0 shadow-strong mb-8">
          <CardHeader>
            <CardTitle>Recent Quiz History</CardTitle>
            <CardDescription>Your last 10 quiz attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuizzes.reverse().map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-all"
                >
                  <div className="flex-shrink-0">
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">
                        {quiz.subject.charAt(0).toUpperCase() + quiz.subject.slice(1)} - {quiz.quizType}
                      </h4>
                      <Badge className={getCategoryColor(quiz.category)}>
                        {getCategoryIcon(quiz.category)} {quiz.category}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>{quiz.date}</span>
                      <span>•</span>
                      <span>{quiz.score}/{quiz.totalQuestions} correct</span>
                      <span>•</span>
                      <span>{quiz.accuracy}% accuracy</span>
                      <span>•</span>
                      <span>{Math.floor(quiz.timeTaken / 60)}:{(quiz.timeTaken % 60).toString().padStart(2, '0')} min</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <Progress value={quiz.accuracy} className="w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Improvement Suggestions */}
        <Card className="border-0 shadow-strong bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle>Personalized Suggestions</CardTitle>
            <CardDescription>Tips to improve your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
