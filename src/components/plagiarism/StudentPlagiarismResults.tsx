import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Submission } from '@/types/plagiarism';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface StudentPlagiarismResultsProps {
  submission: Submission;
}

export const StudentPlagiarismResults = ({ submission }: StudentPlagiarismResultsProps) => {
  if (!submission.analyzed || !submission.plagiarismScore) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Info className="w-5 h-5" />
          <p>Your submission is being analyzed. Results will be available soon.</p>
        </div>
      </Card>
    );
  }

  const score = submission.plagiarismScore;
  const isHighSimilarity = score >= 0.6;
  const isMediumSimilarity = score >= 0.3 && score < 0.6;

  // Highlight matching parts in the code
  const highlightCode = (text: string) => {
    if (!submission.matchedSegments || submission.matchedSegments.length === 0) {
      return text;
    }

    // Collect all matched texts
    const matches: string[] = [];
    submission.matchedSegments.forEach((segment) => {
      if (segment && segment.trim().length > 0) {
        matches.push(segment);
      }
    });

    if (matches.length === 0) return text;

    // Sort matches by length (longest first)
    matches.sort((a, b) => b.length - a.length);

    // Build highlighted text
    const parts: (string | JSX.Element)[] = [];
    let remainingText = text;
    let keyCounter = 0;

    // Process text and highlight matches
    while (remainingText.length > 0) {
      let foundMatch = false;
      
      for (const matchText of matches) {
        const index = remainingText.indexOf(matchText);
        
        if (index === 0) {
          // Found a match at the start
          parts.push(
            <mark
              key={`highlight-${keyCounter++}`}
              className="bg-yellow-300 dark:bg-yellow-700 px-1 rounded font-semibold"
            >
              {matchText}
            </mark>
          );
          remainingText = remainingText.substring(matchText.length);
          foundMatch = true;
          break;
        }
      }
      
      if (!foundMatch) {
        // No match at start, add one character and continue
        parts.push(remainingText[0]);
        remainingText = remainingText.substring(1);
      }
    }

    return <>{parts}</>;
  };

  return (
    <div className="space-y-6">
      {/* Similarity Score Card */}
      <Card className={`p-6 ${isHighSimilarity ? 'border-2 border-red-500' : isMediumSimilarity ? 'border-2 border-yellow-500' : 'border-2 border-green-500'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isHighSimilarity ? (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              ) : isMediumSimilarity ? (
                <Info className="w-6 h-6 text-yellow-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
              <h3 className="text-xl font-semibold">Plagiarism Analysis Results</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {isHighSimilarity
                ? 'High similarity detected with other submissions'
                : isMediumSimilarity
                ? 'Moderate similarity detected with other submissions'
                : 'Low similarity - Your work appears original'}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${isHighSimilarity ? 'text-red-600' : isMediumSimilarity ? 'text-yellow-600' : 'text-green-600'}`}>
              {(score * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Similarity Score</p>
          </div>
        </div>
      </Card>

      {/* Matched Segments Info */}
      {submission.matchedSegments && submission.matchedSegments.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Matched Segments</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {submission.matchedSegments.length} similar segment{submission.matchedSegments.length !== 1 ? 's' : ''} found in your submission.
            These parts are highlighted in yellow below.
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {submission.matchedSegments.map((segment, index) => (
              <Card key={index} className="p-3 bg-yellow-50 dark:bg-yellow-950">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline">Segment {index + 1}</Badge>
                </div>
                <div className="text-xs font-mono bg-white dark:bg-gray-900 p-2 rounded">
                  "{segment}"
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Your Submission with Highlighting */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Your Submission (with highlighted matches)</h3>
        <div className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
          {highlightCode(submission.content)}
        </div>
      </Card>

      {/* Recommendations */}
      {isHighSimilarity && (
        <Card className="p-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                Important Notice
              </h4>
              <p className="text-sm text-red-800 dark:text-red-200">
                High similarity has been detected in your submission. Please ensure your work is original.
                If you've used external sources, make sure to cite them properly. Consider revising your
                submission to make it more unique.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
