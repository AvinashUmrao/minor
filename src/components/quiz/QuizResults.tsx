import { useEffect, useState } from "react";
import { RotateCcw, ArrowLeft, Award, TrendingUp, Target, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuiz } from "@/contexts/QuizContext";
import { analyzePerformance, topicStrengths, calibrationAssignment, getCategory, getRating } from "@/hooks/lib/adaptive";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface Answer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeTakenSec?: number;
}

interface QuizResultsProps {
  answers: Answer[];
  onRestart: () => void;
}

export const QuizResults = ({ answers, onRestart }: QuizResultsProps) => {
  const { quizState } = useQuiz();
  const questions = quizState?.questions || [];
  const [previousRating] = useState(() => getRating('gate', quizState?.subject));
  
  if (!questions.length) {
    return <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
      <p>No quiz data available</p>
    </div>;
  }
  const getResults = () => {
    const correct = answers.filter(a => a.isCorrect).length;
    const total = answers.length;
    const percentage = Math.round((correct / total) * 100);
    
    const subjectWise = answers.reduce((acc, answer, index) => {
      const question = questions[index];
      if (!acc[question.subject]) {
        acc[question.subject] = { correct: 0, total: 0 };
      }
      acc[question.subject].total++;
      if (answer.isCorrect) {
        acc[question.subject].correct++;
      }
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    const perf = analyzePerformance(
      questions as any,
      answers.map(a => ({ selectedAnswer: a.selectedAnswer, timeTakenSec: a.timeTakenSec || 0 }))
    );

    return { correct, total, percentage, subjectWise, perf };
  };

  const results = getResults();
  const topicsRanked = topicStrengths(
    questions as any,
    answers.map(a => ({ selectedAnswer: a.selectedAnswer })) as any
  );
  const topStrength = topicsRanked[0]?.[0];
  const weakest = topicsRanked[topicsRanked.length - 1]?.[0];
  
  // Get category info
  const isCalibration = quizState?.mode === 'calibration';
  const assignedCategory = isCalibration ? calibrationAssignment(results.correct) : null;
  const currentCategory = getCategory('gate', quizState?.subject);
  const currentRating = getRating('gate', quizState?.subject);

  // Rating change notification removed - user requested to remove this toast
  
  const getCategoryColor = (cat: string) => {
    if (cat === 'Best') return 'bg-success/10 text-success border-success';
    if (cat === 'Medium') return 'bg-warning/10 text-warning border-warning';
    return 'bg-destructive/10 text-destructive border-destructive';
  };
  
  const getCategoryIcon = (cat: string) => {
    if (cat === 'Best') return '🟢';
    if (cat === 'Medium') return '🟡';
    return '🔴';
  };
  
  // Prepare chart data
  const difficultyData = [
    {
      name: 'Easy',
      correct: results.perf.accuracyByDifficulty.Easy.correct,
      incorrect: results.perf.accuracyByDifficulty.Easy.total - results.perf.accuracyByDifficulty.Easy.correct,
      accuracy: results.perf.accuracyByDifficulty.Easy.total ? Math.round((results.perf.accuracyByDifficulty.Easy.correct / results.perf.accuracyByDifficulty.Easy.total) * 100) : 0,
    },
    {
      name: 'Medium',
      correct: results.perf.accuracyByDifficulty.Medium.correct,
      incorrect: results.perf.accuracyByDifficulty.Medium.total - results.perf.accuracyByDifficulty.Medium.correct,
      accuracy: results.perf.accuracyByDifficulty.Medium.total ? Math.round((results.perf.accuracyByDifficulty.Medium.correct / results.perf.accuracyByDifficulty.Medium.total) * 100) : 0,
    },
    {
      name: 'Hard',
      correct: results.perf.accuracyByDifficulty.Hard.correct,
      incorrect: results.perf.accuracyByDifficulty.Hard.total - results.perf.accuracyByDifficulty.Hard.correct,
      accuracy: results.perf.accuracyByDifficulty.Hard.total ? Math.round((results.perf.accuracyByDifficulty.Hard.correct / results.perf.accuracyByDifficulty.Hard.total) * 100) : 0,
    },
  ].filter(d => d.correct + d.incorrect > 0);
  
  const pieData = [
    { name: 'Correct', value: results.correct, color: '#22c55e' },
    { name: 'Incorrect', value: results.total - results.correct, color: '#ef4444' },
  ];
  
  const timeData = results.perf.timePerQuestion.map((time, idx) => ({
    question: `Q${idx + 1}`,
    time: time || 1, // Minimum 1 second for display
  }));
  
  const totalTime = results.perf.timePerQuestion.reduce((a, b) => a + (b || 0), 0);
  const avgTime = totalTime > 0 ? Math.round(totalTime / results.perf.timePerQuestion.length) : 0;
  
  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            {isCalibration ? 'Calibration Test Completed' : 'Quiz Completed'}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Your Results
          </h1>
          <p className="text-xl text-muted-foreground">
            {isCalibration 
              ? 'Your skill level has been assessed'
              : 'Here\'s how you performed on the adaptive quiz'
            }
          </p>
        </div>
        
        {/* Category Assignment (Calibration Only) */}
        {isCalibration && assignedCategory && (
          <Card className={`border-2 shadow-strong mb-8 ${getCategoryColor(assignedCategory)}`}>
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">{getCategoryIcon(assignedCategory)}</div>
              <CardTitle className="text-3xl">Category Assigned: {assignedCategory}</CardTitle>
              <CardDescription className="text-base mt-2">
                {assignedCategory === 'Best' && 'Excellent! You\'ll be challenged with advanced questions.'}
                {assignedCategory === 'Medium' && 'Good start! You\'ll get a balanced mix of questions.'}
                {assignedCategory === 'Low' && 'No worries! We\'ll help you build strong fundamentals.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">{currentRating}</div>
                  <div className="text-sm text-muted-foreground">Starting Rating</div>
                </div>
                <div className="p-4 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {assignedCategory === 'Best' && '60% Hard'}
                    {assignedCategory === 'Medium' && '40% Medium'}
                    {assignedCategory === 'Low' && '70% Easy'}
                  </div>
                  <div className="text-sm text-muted-foreground">Next Quiz Focus</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Card */}
        <Card className="border-0 shadow-strong mb-8">
          <CardHeader className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              results.percentage >= 80 ? 'bg-success/10 text-success' :
              results.percentage >= 60 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
            }`}>
              {results.percentage >= 80 ? <Award className="w-10 h-10" /> :
               results.percentage >= 60 ? <TrendingUp className="w-10 h-10" /> : <Target className="w-10 h-10" />}
            </div>
            <CardTitle className="text-3xl font-bold">{results.percentage}%</CardTitle>
            <CardDescription>
              {results.correct} out of {results.total} questions correct
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-accent/50 rounded-xl">
                <div className="text-2xl font-bold text-success mb-2">{results.correct}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div className="p-4 bg-accent/50 rounded-xl">
                <div className="text-2xl font-bold text-destructive mb-2">{results.total - results.correct}</div>
                <div className="text-sm text-muted-foreground">Wrong Answers</div>
              </div>
              <div className="p-4 bg-accent/50 rounded-xl">
                <div className="text-2xl font-bold text-primary mb-2">{results.percentage}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Analytics */}
        <Card className="border-0 shadow-medium mb-8">
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
            <CardDescription>Visual breakdown of your quiz performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pie Chart - Overall Score */}
              <div>
                <h3 className="font-semibold mb-4 text-center">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Bar Chart - Difficulty Analysis */}
              <div>
                <h3 className="font-semibold mb-4 text-center">Accuracy by Difficulty</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="correct" fill="#22c55e" name="Correct" />
                    <Bar dataKey="incorrect" fill="#ef4444" name="Incorrect" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Line Chart - Time Analysis */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4 text-center flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                Time Taken Per Question
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-accent/30 rounded-lg">
                  <div className="text-lg font-bold text-primary">{avgTime}s</div>
                  <div className="text-xs text-muted-foreground">Average Time</div>
                </div>
                <div className="p-3 bg-accent/30 rounded-lg">
                  <div className="text-lg font-bold text-primary">{Math.min(...results.perf.timePerQuestion.filter(t => t > 0))}s</div>
                  <div className="text-xs text-muted-foreground">Fastest</div>
                </div>
                <div className="p-3 bg-accent/30 rounded-lg">
                  <div className="text-lg font-bold text-primary">{Math.max(...results.perf.timePerQuestion)}s</div>
                  <div className="text-xs text-muted-foreground">Slowest</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Analysis */}
        <Card className="border-0 shadow-medium mb-8">
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
            <CardDescription>See how you performed in different topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results.subjectWise).map(([subject, data]) => {
                const subjectPercentage = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={subject} className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                    <div>
                      <div className="font-medium">{subject}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.correct}/{data.total} correct
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={subjectPercentage} className="w-24" />
                      <span className="font-bold text-sm w-12">{subjectPercentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card className="border-0 shadow-medium mb-8">
          <CardHeader>
            <CardTitle>Improvement Suggestions</CardTitle>
            <CardDescription>Based on your performance, here are our recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.percentage < 60 && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">Focus on Fundamentals</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider reviewing basic concepts and practicing more foundational problems before attempting advanced topics.
                  </p>
                </div>
              )}
              
              {Object.entries(results.subjectWise).map(([subject, data]) => {
                const subjectPercentage = (data.correct / data.total) * 100;
                if (subjectPercentage < 50) {
                  return (
                    <div key={subject} className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <h4 className="font-medium text-warning mb-2">Improve {subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        You scored {Math.round(subjectPercentage)}% in {subject}. Focus on this topic with additional study materials and practice.
                      </p>
                    </div>
                  );
                }
                return null;
              })}

              {results.percentage >= 80 && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <h4 className="font-medium text-success mb-2">Excellent Performance!</h4>
                  <p className="text-sm text-muted-foreground">
                    Great job! You're well-prepared. Continue practicing with more advanced topics and previous year papers.
                  </p>
                </div>
              )}

              <div className="p-4 bg-accent/30 rounded-lg">
                <h4 className="font-medium mb-2">📊 Personalized Recommendations</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Strength:</strong> {topStrength || 'N/A'} - Keep practicing to maintain this edge!</p>
                  <p><strong>Needs Work:</strong> {weakest || 'N/A'} - Focus your study sessions here.</p>
                  <p><strong>Difficulty Focus:</strong> 
                    {results.perf.accuracyByDifficulty.Easy.total > 0 && ` Easy (${Math.round((results.perf.accuracyByDifficulty.Easy.correct / results.perf.accuracyByDifficulty.Easy.total) * 100)}%)`}
                    {results.perf.accuracyByDifficulty.Medium.total > 0 && ` • Medium (${Math.round((results.perf.accuracyByDifficulty.Medium.correct / results.perf.accuracyByDifficulty.Medium.total) * 100)}%)`}
                    {results.perf.accuracyByDifficulty.Hard.total > 0 && ` • Hard (${Math.round((results.perf.accuracyByDifficulty.Hard.correct / results.perf.accuracyByDifficulty.Hard.total) * 100)}%)`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onRestart} variant="hero" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" />
            Take Quiz Again
          </Button>
          <Link to="/gate">
            <Button variant="outline" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to GATE Course
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
