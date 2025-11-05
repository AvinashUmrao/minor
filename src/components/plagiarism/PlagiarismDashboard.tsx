import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlagiarismMatch } from '@/types/plagiarism';
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';

interface PlagiarismDashboardProps {
  matches: PlagiarismMatch[];
  onViewMatch: (match: PlagiarismMatch) => void;
}

export const PlagiarismDashboard = ({ matches, onViewMatch }: PlagiarismDashboardProps) => {
  const flaggedMatches = matches.filter(m => m.isFlagged);
  const averageScore = matches.length > 0
    ? matches.reduce((sum, m) => sum + m.overallScore, 0) / matches.length
    : 0;

  const getSeverityColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600 bg-red-50 dark:bg-red-950';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
    return 'text-green-600 bg-green-50 dark:bg-green-950';
  };

  const getSeverityLabel = (score: number) => {
    if (score >= 0.7) return 'High Risk';
    if (score >= 0.4) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{matches.length}</p>
              <p className="text-sm text-muted-foreground">Total Comparisons</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{flaggedMatches.length}</p>
              <p className="text-sm text-muted-foreground">Flagged Matches</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(averageScore * 100).toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Avg Similarity</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Similarity Matches</h3>
        {matches.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-muted-foreground">No plagiarism detected</p>
          </Card>
        ) : (
          matches
            .sort((a, b) => b.overallScore - a.overallScore)
            .map((match, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{match.studentName1}</span>
                      <span className="text-muted-foreground">↔</span>
                      <span className="font-medium">{match.studentName2}</span>
                      {match.isFlagged && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Flagged
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {/* Overall Similarity Score */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-32">Similarity Score:</span>
                        <Progress value={match.overallScore * 100} className="flex-1" />
                        <Badge className={getSeverityColor(match.overallScore)}>
                          {(match.overallScore * 100).toFixed(1)}%
                        </Badge>
                      </div>

                      {/* Show matched segments count */}
                      <div className="text-sm text-muted-foreground">
                        {match.matchedSegments.length} similar segment{match.matchedSegments.length !== 1 ? 's' : ''} found
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewMatch(match)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </Button>
                </div>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};
