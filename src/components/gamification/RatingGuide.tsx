import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle2, TrendingUp, BookOpen, Target } from "lucide-react";
import { SubjectRating } from "@/types/gamification";

interface RatingGuideProps {
  tips: string[];
  subjectRatings: SubjectRating[];
  currentRating: number;
}

export const RatingGuide = ({ tips, subjectRatings, currentRating }: RatingGuideProps) => {
  const actionItems = [
    { id: 1, text: "Complete daily quiz", done: false },
    { id: 2, text: "Maintain 7-day streak", done: false },
    { id: 3, text: "Attempt 3 Medium difficulty quizzes", done: false },
    { id: 4, text: "Review incorrect answers", done: false },
  ];

  const weakestSubject = subjectRatings.length > 0
    ? subjectRatings.reduce((min, sr) => (sr.rating < min.rating ? sr : min))
    : null;

  return (
    <div className="space-y-6">
      {/* Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Personalized Improvement Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Items Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Daily Action Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={item.done}
                className="w-4 h-4 rounded"
                readOnly
              />
              <span className={item.done ? "line-through text-muted-foreground" : ""}>
                {item.text}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Subject Performance */}
      {subjectRatings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Subject-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subjectRatings.map((sr) => (
              <div key={sr.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{sr.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {sr.quizzesTaken} quizzes • {Math.round(sr.accuracy * 100)}% accuracy
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{sr.rating}</div>
                    {sr.subject === weakestSubject?.subject && (
                      <Badge variant="outline" className="text-xs">Needs Work</Badge>
                    )}
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((sr.rating / 2000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rating Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            How Rating is Calculated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-accent/30 rounded-lg font-mono text-sm space-y-1">
            <div>Rating = Base (1000)</div>
            <div className="ml-4">+ Quiz Performance (0-500)</div>
            <div className="ml-4">+ Accuracy Bonus (0-200)</div>
            <div className="ml-4">+ Streak Bonus (0-100)</div>
            <div className="ml-4">+ Consistency Bonus (0-100)</div>
            <div className="ml-4">- Penalty for wrong answers</div>
          </div>
          <p className="text-sm text-muted-foreground">
            Your rating is calculated based on multiple factors including quiz performance,
            accuracy, consistency, and maintaining streaks. Focus on all areas for maximum growth!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
