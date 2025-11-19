import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Bell, List, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { jeeData } from "@/data/sampleData";

const Jee = () => {
  const [activeTab, setActiveTab] = useState("study-material");

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">JEE Preparation</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Joint Entrance Examination</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete preparation resources for JEE Main and Advanced. Your gateway to IITs, NITs, and top engineering colleges.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="study-material" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Study Material</span>
            </TabsTrigger>
            <TabsTrigger value="papers" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Previous Papers</span>
            </TabsTrigger>
            <TabsTrigger value="updates" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Updates</span>
            </TabsTrigger>
            <TabsTrigger value="syllabus" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Syllabus</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="study-material">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">JEE Study Materials</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jeeData.studyMaterial.map((material) => (
                  <Card key={material.id} className="hover:shadow-medium transition-all">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{material.title}</h3>
                      <p className="text-muted-foreground mb-4">{material.description}</p>
                      <div className="flex items-center justify-between text-sm mb-4">
                        <Badge variant="secondary">{material.type}</Badge>
                        <span className="text-muted-foreground">{material.lessons} lessons</span>
                      </div>
                      <Button className="w-full" asChild>
                        <a href={material.downloadUrl} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="papers">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">JEE Previous Year Papers</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {jeeData.previousPapers.map((paper) => (
                  <Card key={paper.id}>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">{paper.title}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Questions:</span>
                          <span className="font-medium">{paper.questions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Marks:</span>
                          <span className="font-medium">{paper.marks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{paper.duration}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={paper.downloadUrl} target="_blank" rel="noopener noreferrer">
                          Download Paper
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="updates">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Latest Updates & Announcements</h2>
              <div className="space-y-4">
                {jeeData.updates.map((update) => (
                  <Card key={update.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          update.type === 'Important' ? 'bg-destructive' :
                          update.type === 'Update' ? 'bg-warning' : 'bg-success'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={
                              update.type === 'Important' ? 'destructive' :
                              update.type === 'Update' ? 'default' : 'secondary'
                            }>
                              {update.type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{update.date}</span>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{update.title}</h3>
                          <p className="text-muted-foreground">{update.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="syllabus">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">JEE Syllabus 2025</h2>
              <div className="grid gap-6">
                {Object.entries(jeeData.syllabus).map(([subject, topics]) => (
                  <Card key={subject}>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        {subject}
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {topics.map((topic, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
                            <span className="text-sm font-medium">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4">JEE Practice Quizzes</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Test your knowledge with our comprehensive JEE quiz system. Choose from topic-wise, subject-wise, or full syllabus tests.
              </p>
              <Link to="/jee/quiz">
                <Button size="lg">Start Quiz</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Jee;
