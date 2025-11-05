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
    if (segments.length === 0 || !text) return text;

    // Tokenize text (split into words/tokens)
    const tokenize = (str: string): string[] => {
      return str.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ') // Remove special chars
        .split(/\s+/)
        .filter(token => token.length > 2); // Ignore very short tokens
    };

    // Calculate Jaccard similarity (like TF-IDF concept)
    const calculateTokenSimilarity = (tokens1: string[], tokens2: string[]): number => {
      const set1 = new Set(tokens1);
      const set2 = new Set(tokens2);
      
      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);
      
      return union.size > 0 ? intersection.size / union.size : 0;
    };

    // Dynamic threshold based on overall similarity score
    // Higher overall score = lower threshold = more lines highlighted
    const overallScore = match.overallScore;
    let threshold = 0.4; // Default 40%
    
    if (overallScore >= 0.8) {
      threshold = 0.25; // 80%+ similarity: highlight if 25% token match
    } else if (overallScore >= 0.6) {
      threshold = 0.35; // 60-80% similarity: highlight if 35% token match
    } else if (overallScore >= 0.4) {
      threshold = 0.45; // 40-60% similarity: highlight if 45% token match
    } else {
      threshold = 0.55; // <40% similarity: highlight only if 55% token match
    }

    // Split text into lines
    const lines = text.split('\n');
    const plagiarizedLines = new Set<number>();
    
    // Check each segment against each line using token-based similarity
    segments.forEach((segment) => {
      const matchedText = isFirst ? segment.text1 : segment.text2;
      if (!matchedText || matchedText.trim().length === 0) return;
      
      const matchTokens = tokenize(matchedText);
      if (matchTokens.length === 0) return;
      
      // Check each line
      lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) return;
        
        const lineTokens = tokenize(trimmedLine);
        if (lineTokens.length === 0) return;
        
        // Calculate token-based similarity (TF-IDF style)
        const similarity = calculateTokenSimilarity(lineTokens, matchTokens);
        
        // Highlight if similarity is above dynamic threshold
        if (similarity >= threshold) {
          plagiarizedLines.add(lineIndex);
        }
      });
    });

    // Render lines with highlighting
    return (
      <>
        {lines.map((line, lineIndex) => {
          const isPlagiarized = plagiarizedLines.has(lineIndex);
          
          return (
            <div
              key={lineIndex}
              className={isPlagiarized ? 'bg-yellow-300 dark:bg-yellow-700 -mx-4 px-4 py-0.5 border-l-4 border-yellow-600 font-semibold' : ''}
            >
              {line}
              {lineIndex < lines.length - 1 && '\n'}
            </div>
          );
        })}
      </>
    );
  };

  // Helper function to calculate similarity between two strings
  const calculateLineSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  // Levenshtein distance calculation
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
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
