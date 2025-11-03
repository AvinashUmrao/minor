import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlagiarismMatch, Submission } from '@/types/plagiarism';
import { AlertTriangle } from 'lucide-react';

interface SimilarityVisualizationProps {
  match: PlagiarismMatch | null;
  submission1: Submission | null;
  submission2: Submission | null;
  open: boolean;
  onClose: () => void;
}

export const SimilarityVisualization = ({
  match,
  submission1,
  submission2,
  open,
  onClose,
}: SimilarityVisualizationProps) => {
  if (!match || !submission1 || !submission2) return null;

  const highlightMatches = (text: string, segments: typeof match.matchedSegments, isFirst: boolean) => {
    if (segments.length === 0) return text;

    const words = text.split(' ');
    const highlighted: JSX.Element[] = [];
    let currentIndex = 0;

    segments.forEach((segment, segIndex) => {
      const startIdx = isFirst ? segment.startIndex1 : segment.startIndex2;
      const endIdx = isFirst ? segment.endIndex1 : segment.endIndex2;

      // Add non-highlighted words before this segment
      for (let i = currentIndex; i < startIdx; i++) {
        highlighted.push(
          <span key={`normal-${i}`}>{words[i]} </span>
        );
      }

      // Add highlighted segment
      for (let i = startIdx; i < endIdx; i++) {
        highlighted.push(
          <mark
            key={`highlight-${segIndex}-${i}`}
            className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
          >
            {words[i]}{' '}
          </mark>
        );
      }

      currentIndex = endIdx;
    });

    // Add remaining non-highlighted words
    for (let i = currentIndex; i < words.length; i++) {
      highlighted.push(
        <span key={`normal-${i}`}>{words[i]} </span>
      );
    }

    return <>{highlighted}</>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Similarity Analysis
            {match.isFlagged && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Flagged
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Similarity Score</p>
                <p className="text-3xl font-bold">{(match.overallScore * 100).toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Matched Segments</p>
                <p className="text-2xl font-semibold">{match.matchedSegments.length}</p>
              </div>
            </div>
          </Card>

          {/* Algorithm Scores */}
          <div>
            <h3 className="font-semibold mb-3">Algorithm Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Jaccard</p>
                <p className="text-lg font-bold">{(match.algorithms.jaccard * 100).toFixed(1)}%</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Cosine</p>
                <p className="text-lg font-bold">{(match.algorithms.cosine * 100).toFixed(1)}%</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">TF-IDF</p>
                <p className="text-lg font-bold">{(match.algorithms.tfidf * 100).toFixed(1)}%</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">Levenshtein</p>
                <p className="text-lg font-bold">{(match.algorithms.levenshtein * 100).toFixed(1)}%</p>
              </Card>
              <Card className="p-3">
                <p className="text-xs text-muted-foreground">LCS</p>
                <p className="text-lg font-bold">{(match.algorithms.lcs * 100).toFixed(1)}%</p>
              </Card>
              {match.algorithms.semantic !== undefined && (
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Semantic</p>
                  <p className="text-lg font-bold">{(match.algorithms.semantic * 100).toFixed(1)}%</p>
                </Card>
              )}
              {match.algorithms.ast !== undefined && (
                <>
                  <Card className="p-3">
                    <p className="text-xs text-muted-foreground">AST</p>
                    <p className="text-lg font-bold">{(match.algorithms.ast * 100).toFixed(1)}%</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-muted-foreground">Winnowing</p>
                    <p className="text-lg font-bold">{(match.algorithms.winnowing! * 100).toFixed(1)}%</p>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          <div>
            <h3 className="font-semibold mb-3">Side-by-Side Comparison</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="mb-3 pb-3 border-b">
                  <p className="font-semibold">{match.studentName1}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(submission1.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  {highlightMatches(submission1.content, match.matchedSegments, true)}
                </div>
              </Card>

              <Card className="p-4">
                <div className="mb-3 pb-3 border-b">
                  <p className="font-semibold">{match.studentName2}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(submission2.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  {highlightMatches(submission2.content, match.matchedSegments, false)}
                </div>
              </Card>
            </div>
          </div>

          {/* Matched Segments Details */}
          {match.matchedSegments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Matched Segments ({match.matchedSegments.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {match.matchedSegments.map((segment, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Segment {index + 1}</Badge>
                      <Badge>{(segment.similarity * 100).toFixed(0)}% Match</Badge>
                    </div>
                    <div className="text-xs bg-yellow-50 dark:bg-yellow-950 p-2 rounded font-mono">
                      "{segment.text1}"
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
