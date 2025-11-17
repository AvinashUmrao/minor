import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlagiarismMatch, Submission } from '@/types/plagiarism';
import { AlertTriangle, TrendingUp, BarChart3, Activity } from 'lucide-react';

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

    // Normalize text for comparison (remove extra spaces, keep structure)
    const normalize = (str: string): string => {
      return str.trim().replace(/\s+/g, ' ').toLowerCase();
    };

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

    // Calculate exact string similarity (for identical/near-identical lines)
    const calculateExactSimilarity = (str1: string, str2: string): number => {
      const norm1 = normalize(str1);
      const norm2 = normalize(str2);
      
      if (norm1 === norm2) return 1.0; // Exact match
      
      // Check if one contains the other (for partial matches)
      if (norm1.includes(norm2) || norm2.includes(norm1)) {
        return Math.min(norm1.length, norm2.length) / Math.max(norm1.length, norm2.length);
      }
      
      return 0;
    };

    // Dynamic threshold based on overall similarity score
    // Higher overall score = lower threshold = more lines highlighted
    const overallScore = match.overallScore;
    let threshold = 0.4; // Default 40%
    
    if (overallScore >= 0.8) {
      threshold = 0.20; // 80%+ similarity: highlight if 20% token match
    } else if (overallScore >= 0.6) {
      threshold = 0.30; // 60-80% similarity: highlight if 30% token match
    } else if (overallScore >= 0.4) {
      threshold = 0.40; // 40-60% similarity: highlight if 40% token match
    } else {
      threshold = 0.50; // <40% similarity: highlight only if 50% token match
    }

    // Get all lines from both submissions for direct comparison
    const lines = text.split('\n');
    const otherText = isFirst ? submission2?.content : submission1?.content;
    const otherLines = otherText ? otherText.split('\n') : [];
    
    const plagiarizedLines = new Set<number>();
    
    // STEP 1: Direct line-by-line comparison (for exact/near-exact matches)
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) return;
      
      // Check against all lines in the other submission
      for (const otherLine of otherLines) {
        const trimmedOther = otherLine.trim();
        if (trimmedOther.length === 0) continue;
        
        const exactSim = calculateExactSimilarity(trimmedLine, trimmedOther);
        
        // If exact match or 80%+ similarity, definitely highlight
        if (exactSim >= 0.80) {
          plagiarizedLines.add(lineIndex);
          break; // Found match, move to next line
        }
      }
    });
    
    // STEP 2: Token-based matching for segments (for structural similarity)
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

  // Calculate line-by-line similarity for heatmap
  const calculateLineMatchData = () => {
    const lines1 = submission1.content.split('\n');
    const lines2 = submission2.content.split('\n');
    
    const matchData: { line: number; similarity: number; matched: boolean }[] = [];
    
    lines1.forEach((line1, index) => {
      const trimmed1 = line1.trim();
      if (trimmed1.length === 0) {
        matchData.push({ line: index + 1, similarity: 0, matched: false });
        return;
      }
      
      let maxSimilarity = 0;
      let hasMatch = false;
      
      lines2.forEach((line2) => {
        const trimmed2 = line2.trim();
        if (trimmed2.length === 0) return;
        
        const similarity = calculateLineSimilarity(trimmed1, trimmed2);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
        }
        if (similarity >= 0.8) {
          hasMatch = true;
        }
      });
      
      matchData.push({ line: index + 1, similarity: maxSimilarity, matched: hasMatch });
    });
    
    return matchData;
  };

  // Calculate similarity distribution
  const calculateSimilarityDistribution = () => {
    const matchData = calculateLineMatchData();
    const ranges = {
      exact: 0,      // 90-100%
      high: 0,       // 70-89%
      medium: 0,     // 40-69%
      low: 0,        // 1-39%
      none: 0        // 0%
    };
    
    matchData.forEach(({ similarity }) => {
      if (similarity >= 0.9) ranges.exact++;
      else if (similarity >= 0.7) ranges.high++;
      else if (similarity >= 0.4) ranges.medium++;
      else if (similarity > 0) ranges.low++;
      else ranges.none++;
    });
    
    return ranges;
  };

  const lineMatchData = calculateLineMatchData();
  const distribution = calculateSimilarityDistribution();
  const totalLines = lineMatchData.length;
  const matchedLines = lineMatchData.filter(d => d.matched).length;
  const matchPercentage = totalLines > 0 ? (matchedLines / totalLines * 100) : 0;

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

          {/* Visual Analytics Section */}
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-lg">Visual Analytics</h3>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-medium text-muted-foreground">Total Lines</p>
                </div>
                <p className="text-2xl font-bold">{totalLines}</p>
                <p className="text-xs text-muted-foreground mt-1">in submission 1</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <p className="text-xs font-medium text-muted-foreground">Matched Lines</p>
                </div>
                <p className="text-2xl font-bold">{matchedLines}</p>
                <p className="text-xs text-muted-foreground mt-1">{matchPercentage.toFixed(1)}% of code</p>
              </Card>
              
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-xs font-medium text-muted-foreground">Unique Lines</p>
                </div>
                <p className="text-2xl font-bold">{totalLines - matchedLines}</p>
                <p className="text-xs text-muted-foreground mt-1">{(100 - matchPercentage).toFixed(1)}% unique</p>
              </Card>
            </div>

            {/* Similarity Distribution Bar Chart */}
            <Card className="p-4 mb-6">
              <h4 className="font-semibold mb-3 text-sm">Similarity Distribution</h4>
              <div className="space-y-3">
                {/* Exact Match (90-100%) */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Exact Match (90-100%)</span>
                    <span className="text-muted-foreground">{distribution.exact} lines ({(distribution.exact/totalLines*100).toFixed(1)}%)</span>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 flex items-center justify-end px-2 text-xs text-white font-bold"
                      style={{ width: `${(distribution.exact/totalLines*100)}%` }}
                    >
                      {distribution.exact > 0 && `${distribution.exact}`}
                    </div>
                  </div>
                </div>

                {/* High Similarity (70-89%) */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">High Similarity (70-89%)</span>
                    <span className="text-muted-foreground">{distribution.high} lines ({(distribution.high/totalLines*100).toFixed(1)}%)</span>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 flex items-center justify-end px-2 text-xs text-white font-bold"
                      style={{ width: `${(distribution.high/totalLines*100)}%` }}
                    >
                      {distribution.high > 0 && `${distribution.high}`}
                    </div>
                  </div>
                </div>

                {/* Medium Similarity (40-69%) */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Medium Similarity (40-69%)</span>
                    <span className="text-muted-foreground">{distribution.medium} lines ({(distribution.medium/totalLines*100).toFixed(1)}%)</span>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 flex items-center justify-end px-2 text-xs text-white font-bold"
                      style={{ width: `${(distribution.medium/totalLines*100)}%` }}
                    >
                      {distribution.medium > 0 && `${distribution.medium}`}
                    </div>
                  </div>
                </div>

                {/* Low Similarity (1-39%) */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">Low Similarity (1-39%)</span>
                    <span className="text-muted-foreground">{distribution.low} lines ({(distribution.low/totalLines*100).toFixed(1)}%)</span>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 flex items-center justify-end px-2 text-xs text-white font-bold"
                      style={{ width: `${(distribution.low/totalLines*100)}%` }}
                    >
                      {distribution.low > 0 && `${distribution.low}`}
                    </div>
                  </div>
                </div>

                {/* No Match (0%) */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">No Match (0%)</span>
                    <span className="text-muted-foreground">{distribution.none} lines ({(distribution.none/totalLines*100).toFixed(1)}%)</span>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 flex items-center justify-end px-2 text-xs text-white font-bold"
                      style={{ width: `${(distribution.none/totalLines*100)}%` }}
                    >
                      {distribution.none > 0 && `${distribution.none}`}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Line-by-Line Match Heatmap */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3 text-sm">Line-by-Line Similarity Heatmap</h4>
              <p className="text-xs text-muted-foreground mb-3">Each block represents a line of code. Hover to see details.</p>
              
              <div className="flex flex-wrap gap-1 max-h-64 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded">
                {lineMatchData.map((data, index) => {
                  let color = 'bg-green-500'; // No match
                  let tooltip = `Line ${data.line}: No match (0%)`;
                  
                  if (data.similarity >= 0.9) {
                    color = 'bg-red-600';
                    tooltip = `Line ${data.line}: Exact match (${(data.similarity * 100).toFixed(0)}%)`;
                  } else if (data.similarity >= 0.7) {
                    color = 'bg-orange-500';
                    tooltip = `Line ${data.line}: High similarity (${(data.similarity * 100).toFixed(0)}%)`;
                  } else if (data.similarity >= 0.4) {
                    color = 'bg-yellow-500';
                    tooltip = `Line ${data.line}: Medium similarity (${(data.similarity * 100).toFixed(0)}%)`;
                  } else if (data.similarity > 0) {
                    color = 'bg-blue-400';
                    tooltip = `Line ${data.line}: Low similarity (${(data.similarity * 100).toFixed(0)}%)`;
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`w-3 h-3 ${color} rounded-sm cursor-pointer hover:ring-2 hover:ring-white transition-all`}
                      title={tooltip}
                    />
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                  <span>Exact (90-100%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                  <span>High (70-89%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                  <span>Medium (40-69%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                  <span>Low (1-39%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span>None (0%)</span>
                </div>
              </div>
            </Card>

            {/* Similarity Trend Graph */}
            <Card className="p-4 mt-4">
              <h4 className="font-semibold mb-3 text-sm">Similarity Trend Graph</h4>
              <p className="text-xs text-muted-foreground mb-3">Visual representation of line-by-line similarity scores</p>
              
              <div className="relative h-32 bg-gray-50 dark:bg-gray-900 rounded overflow-hidden">
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* Grid lines */}
                  <line x1="0" y1="25%" x2="100%" y2="25%" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                  <line x1="0" y1="75%" x2="100%" y2="75%" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                  
                  {/* Similarity line graph */}
                  <polyline
                    points={lineMatchData.map((data, index) => {
                      const x = (index / (lineMatchData.length - 1)) * 100;
                      const y = 100 - (data.similarity * 100);
                      return `${x}%,${y}%`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                  />
                  
                  {/* Threshold line at 80% */}
                  <line x1="0" y1="20%" x2="100%" y2="20%" stroke="rgb(239, 68, 68)" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                </svg>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 text-[10px] text-muted-foreground">100%</div>
                <div className="absolute left-0 top-1/4 text-[10px] text-muted-foreground">75%</div>
                <div className="absolute left-0 top-1/2 text-[10px] text-muted-foreground">50%</div>
                <div className="absolute left-0 top-3/4 text-[10px] text-muted-foreground">25%</div>
                <div className="absolute left-0 bottom-0 text-[10px] text-muted-foreground">0%</div>
                
                {/* Threshold label */}
                <div className="absolute left-8 top-[18%] text-[10px] text-red-500 font-semibold">← 80% Threshold</div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
