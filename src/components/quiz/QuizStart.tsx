import { useState, useEffect } from "react";
import { Brain, ArrowLeft, Clock, BookOpen, List, Target, TrendingUp, Flame, Award, Trophy, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategory, getRating } from "@/hooks/lib/adaptive";
import { subjects as gateSubjects, getTopicsBySubject as gateGetTopicsBySubject } from "@/data/questionBank";
import { useStreak } from "@/hooks/useStreak";
import { useBadges } from "@/hooks/useBadges";
import { useRating } from "@/hooks/useRating";
import { useFirebaseQuiz } from "@/hooks/useFirebaseQuiz";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProgress } from "@/hooks/lib/userProgressService";

interface Subject {
  id: string;
  name: string;
  description: string;
  topics?: Array<{ id: string; name: string; description: string }>;
}

interface QuizStartProps {
  onStart: (quizType: 'topic' | 'subject' | 'full', duration: number, subject?: string, topic?: string) => void;
  examName?: string;
  subjects?: Subject[];
  getTopicsBySubject?: (subjectId: string) => Array<{ id: string; name: string; description: string }>;
}

export const QuizStart = ({ 
  onStart, 
  examName = 'GATE',
  subjects = gateSubjects,
  getTopicsBySubject = gateGetTopicsBySubject
}: QuizStartProps) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'topic' | 'subject' | 'full'>('full');
  const [duration, setDuration] = useState(15);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || 'algorithms');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [needsInitialTest, setNeedsInitialTest] = useState(false);
  const [recommendedDifficulty, setRecommendedDifficulty] = useState<{ easy: number; medium: number; hard: number } | null>(null);
  
  const currentCategory = getCategory('gate', selectedSubject);
  const currentRating = getRating('gate', selectedSubject);
  const availableTopics = getTopicsBySubject(selectedSubject);
  
  // Use new gamification hooks for consistent data
  const { streak, isLoading: streakLoading } = useStreak();
  const { stats: badgeStats, isLoading: badgesLoading } = useBadges();
  const { rating, isLoading: ratingLoading } = useRating();
  
  // Firebase integration
  const { userProfile, checkNeedsInitialTest, getRecommendedDifficulty } = useFirebaseQuiz();
  
  // Set first topic when subject changes
  useEffect(() => {
    if (availableTopics.length > 0 && !selectedTopic) {
      setSelectedTopic(availableTopics[0].id);
    }
  }, [selectedSubject, availableTopics, selectedTopic]);
  
  // Check if user needs initial test based on real quiz data
  useEffect(() => {
    const checkQuizStatus = async () => {
      if (user) {
        const progress = await getUserProgress(user.id);
        const hasQuizzes = progress && progress.totalQuizzesTaken > 0;
        setNeedsInitialTest(!hasQuizzes);
        
        // Set recommended difficulty based on rating if user has taken quizzes
        if (hasQuizzes && progress) {
          const rating = progress.currentRating;
          // Calculate difficulty mix based on rating
          if (rating < 1300) {
            setRecommendedDifficulty({ easy: 0.6, medium: 0.3, hard: 0.1 });
          } else if (rating < 1600) {
            setRecommendedDifficulty({ easy: 0.3, medium: 0.5, hard: 0.2 });
          } else {
            setRecommendedDifficulty({ easy: 0.1, medium: 0.3, hard: 0.6 });
          }
        }
      }
    };
    checkQuizStatus();
  }, [user]);

  const quizTypes = [
    {
      id: 'full' as const,
      title: 'Full Syllabus Test',
      description: 'Comprehensive test covering all subjects',
      questions: 15,
      duration: 25,
      icon: Brain,
    },
    {
      id: 'subject' as const,
      title: 'Subject-wise Test',
      description: 'Test your knowledge in a specific subject',
      questions: 12,
      duration: 20,
      icon: List,
    },
    {
      id: 'topic' as const,
      title: 'Topic-wise Test',
      description: 'Focus on a specific topic within the subject',
      questions: 6,
      duration: 10,
      icon: BookOpen,
    },
  ];

  const handleTypeChange = (type: 'topic' | 'subject' | 'full') => {
    setSelectedType(type);
    const selected = quizTypes.find(qt => qt.id === type);
    if (selected) {
      setDuration(selected.duration);
    }
  };
  
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    const topics = getTopicsBySubject(subjectId);
    if (topics.length > 0) {
      setSelectedTopic(topics[0].id);
    }
  };

  const handleStart = () => {
    if (selectedType === 'full') {
      onStart(selectedType, duration);
    } else if (selectedType === 'topic') {
      onStart(selectedType, duration, selectedSubject, selectedTopic);
    } else {
      onStart(selectedType, duration, selectedSubject);
    }
  };

  
  const getCategoryColor = (cat: string) => {
    if (cat === 'Best') return 'text-success';
    if (cat === 'Medium') return 'text-warning';
    return 'text-destructive';
  };
  
  const getCategoryIcon = (cat: string) => {
    if (cat === 'Best') return '🟢';
    if (cat === 'Medium') return '🟡';
    return '🔴';
  };

  const selectedQuizType = quizTypes.find(qt => qt.id === selectedType);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">{examName} Adaptive Quiz</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Start Your Quiz
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose your test type and begin your adaptive learning journey
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/progress">
              <Button variant="outline" size="sm">
                <Target className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Subject Selection (only for subject-wise and topic-wise) */}
        {(selectedType === 'subject' || selectedType === 'topic') && (
          <Card className="border-0 shadow-strong mb-8">
            <CardHeader>
              <CardTitle>Select Subject</CardTitle>
              <CardDescription>Choose the subject you want to practice</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div>
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-xs text-muted-foreground">{subject.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Test Type Selection */}
        <Card className="border-0 shadow-strong mb-8">
          <CardHeader>
            <CardTitle>Select Test Type</CardTitle>
            <CardDescription>Choose how you want to be tested</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedType} onValueChange={(value) => handleTypeChange(value as 'topic' | 'subject' | 'full')}>
              <div className="space-y-4">
                {quizTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedType === type.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleTypeChange(type.id)}
                    >
                      <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={type.id} className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">{type.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {type.description}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {type.questions} Questions
                            </span>
                            <span className="text-muted-foreground">
                              {type.duration} Minutes
                            </span>
                          </div>
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Topic Selection (only for topic-wise) */}
        {selectedType === 'topic' && (
          <Card className="border-0 shadow-strong mb-8">
            <CardHeader>
              <CardTitle>Select Topic</CardTitle>
              <CardDescription>Choose a specific topic to practice</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {availableTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      <div>
                        <div className="font-medium">{topic.name}</div>
                        <div className="text-xs text-muted-foreground">{topic.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Initial Test Info - Only for first-time users */}
        {user && needsInitialTest && (
          <Card className="max-w-2xl mx-auto border-2 border-primary shadow-strong mb-8 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-primary mb-2">Welcome! Take Your First Quiz</h4>
                  <p className="text-sm text-muted-foreground">
                    This is your first quiz. It contains mixed difficulty questions to assess your level and personalize future quizzes for you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Difficulty Info */}
        {user && !needsInitialTest && recommendedDifficulty && userProfile && (
          <Card className="max-w-2xl mx-auto border-0 shadow-medium mb-8 bg-accent/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Personalized Difficulty Mix</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Based on your <span className="font-semibold">{userProfile.currentCategory}</span> category and recent performance:
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-success">{Math.round(recommendedDifficulty.easy * 100)}%</div>
                      <div className="text-xs text-muted-foreground">Easy</div>
                    </div>
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-warning">{Math.round(recommendedDifficulty.medium * 100)}%</div>
                      <div className="text-xs text-muted-foreground">Medium</div>
                    </div>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-destructive">{Math.round(recommendedDifficulty.hard * 100)}%</div>
                      <div className="text-xs text-muted-foreground">Hard</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Details */}
        <Card className="max-w-2xl mx-auto border-0 shadow-strong mb-8">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              {selectedQuizType && <selectedQuizType.icon className="w-8 h-8 text-white" />}
            </div>
            <CardTitle className="text-2xl">Quiz Details</CardTitle>
            <CardDescription>Everything you need to know before starting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-accent/50 rounded-xl">
                <div className="text-2xl font-bold text-primary mb-2">
                  {selectedQuizType?.questions}
                </div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="p-4 bg-accent/50 rounded-xl">
                <div className="text-2xl font-bold text-warning mb-2">
                  <Clock className="w-6 h-6 mx-auto mb-1" />
                  {duration}
                </div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
              <div className="p-4 bg-accent/50 rounded-xl">
                <div className="text-2xl font-bold text-success mb-2">
                  {needsInitialTest ? 'Mixed' : 'Adaptive'}
                </div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-center">Topics Covered:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">Data Structures</Badge>
                <Badge variant="secondary">Algorithms</Badge>
                <Badge variant="secondary">Time Complexity</Badge>
                <Badge variant="secondary">Problem Solving</Badge>
              </div>
            </div>

            <div className="bg-accent/30 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Quiz Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Mark questions for review</li>
                <li>✓ Navigate between questions freely</li>
                <li>✓ View summary before submission</li>
                <li>✓ Get detailed explanations for each answer</li>
                <li>✓ Track your performance with analytics</li>
              </ul>
            </div>

            <div className="text-center space-y-4">
              <Button onClick={handleStart} size="lg" variant="hero" className="w-full">
                <Brain className="mr-2 h-5 w-5" />
                {needsInitialTest ? 'Take Initial Quiz' : 'Start Adaptive Quiz'}
              </Button>
              
              <Link to="/gate">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to GATE Course
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
