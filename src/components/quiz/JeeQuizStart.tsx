import { useState, useEffect } from "react";
import { Brain, ArrowLeft, Clock, BookOpen, List, Target, TrendingUp, Flame, Award, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategory, getRating } from "@/lib/adaptive";
import { jeeSubjects, getJeeTopicsBySubject } from "@/data/jeeQuestionBank";
import { getStreakData, getEarnedBadges } from "@/lib/gamification";

interface JeeQuizStartProps {
  onStart: (quizType: 'topic' | 'subject' | 'full', duration: number, subject?: string, topic?: string) => void;
}

export const JeeQuizStart = ({ onStart }: JeeQuizStartProps) => {
  const [selectedType, setSelectedType] = useState<'topic' | 'subject' | 'full'>('full');
  const [duration, setDuration] = useState(15);
  const [selectedSubject, setSelectedSubject] = useState<string>('physics');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  
  const currentCategory = getCategory('jee', selectedSubject);
  const currentRating = getRating('jee', selectedSubject);
  const availableTopics = getJeeTopicsBySubject(selectedSubject);
  const streakData = getStreakData();
  const badges = getEarnedBadges();
  
  // Set first topic when subject changes
  useEffect(() => {
    if (availableTopics.length > 0 && !selectedTopic) {
      setSelectedTopic(availableTopics[0].id);
    }
  }, [selectedSubject, availableTopics, selectedTopic]);

  const quizTypes = [
    {
      id: 'full' as const,
      title: 'Full Syllabus Test',
      description: 'Comprehensive test covering Physics, Chemistry, and Mathematics',
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
    const topics = getJeeTopicsBySubject(subjectId);
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
          <Badge variant="outline" className="mb-4">JEE Adaptive Quiz</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Start Your JEE Quiz
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
                  {jeeSubjects.map((subject) => (
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
        {selectedType === 'topic' && availableTopics.length > 0 && (
          <Card className="border-0 shadow-strong mb-8">
            <CardHeader>
              <CardTitle>Select Topic</CardTitle>
              <CardDescription>Choose a specific topic to focus on</CardDescription>
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

        {/* Quiz Summary & Actions */}
        <Card className="border-0 shadow-strong bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to Start?</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• {selectedQuizType?.questions} questions</p>
                  <p>• {selectedQuizType?.duration} minutes duration</p>
                  <p>• Adaptive difficulty based on your performance</p>
                </div>
              </div>
              <Clock className="w-12 h-12 text-primary opacity-50" />
            </div>
            
            <div className="flex gap-4">
              <Button onClick={handleStart} size="lg" className="flex-1">
                Start Adaptive Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link to="/jee">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to JEE Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
