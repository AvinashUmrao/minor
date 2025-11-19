import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateAssignmentDialog } from '@/components/plagiarism/CreateAssignmentDialog';
import { AssignmentCard } from '@/components/plagiarism/AssignmentCard';
import { PlagiarismDashboard } from '@/components/plagiarism/PlagiarismDashboard';
import { SimilarityVisualization } from '@/components/plagiarism/SimilarityVisualization';
import { Assignment, Submission, PlagiarismMatch, PlagiarismAnalysis } from '@/types/plagiarism';
import {
  getAssignments,
  getSubmissionsByAssignment,
  deleteAssignment,
  saveAnalysis,
  getAnalysisByAssignment,
} from '@/hooks/lib/plagiarismStorage';
import { detectPlagiarism } from '@/hooks/lib/plagiarismDetection';
import { generatePlagiarismReportPDF } from '@/hooks/lib/plagiarismPdfGenerator';
import { FileText, Download, Play, ArrowLeft, Paperclip, Image as ImageIcon } from 'lucide-react';

const TeacherPlagiarismPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analysis, setAnalysis] = useState<PlagiarismAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<PlagiarismMatch | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [thresholdValue, setThresholdValue] = useState<number>(80);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    if (!user) return;

    try {
      setLoadError(null);
      const allAssignments = await getAssignments();
      const teacherAssignments = allAssignments.filter(a => a.createdBy === user.id);
      setAssignments(teacherAssignments);
      
      // Load submission counts for each assignment
      const counts: Record<string, number> = {};
      for (const assignment of teacherAssignments) {
        const subs = await getSubmissionsByAssignment(assignment.id);
        counts[assignment.id] = subs.length;
      }
      setSubmissionCounts(counts);
    } catch (error: any) {
      console.error('Error loading assignments:', error);
      if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        setLoadError('firebase-permissions');
      } else {
        setLoadError('general');
      }
    }
  };

  const handleViewAssignment = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    const subs = await getSubmissionsByAssignment(assignment.id);
    setSubmissions(subs);
    
    const existingAnalysis = await getAnalysisByAssignment(assignment.id);
    setAnalysis(existingAnalysis);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment? All submissions will be lost.')) {
      await deleteAssignment(assignmentId);
      loadAssignments();
      if (selectedAssignment?.id === assignmentId) {
        setSelectedAssignment(null);
      }
    }
  };

  const runPlagiarismAnalysis = async () => {
    if (!selectedAssignment || submissions.length < 2) return;

    setIsAnalyzing(true);

    setTimeout(async () => {
      const matches: PlagiarismMatch[] = [];
      const isCode = selectedAssignment.type === 'code';
      const thresholdDecimal = thresholdValue / 100; // Convert 80 to 0.80

      // Compare all pairs of submissions
      for (let i = 0; i < submissions.length; i++) {
        for (let j = i + 1; j < submissions.length; j++) {
          const sub1 = submissions[i];
          const sub2 = submissions[j];

          const result = detectPlagiarism(sub1.content, sub2.content, isCode);

          const match: PlagiarismMatch = {
            studentId1: sub1.studentId,
            studentName1: sub1.studentName,
            studentId2: sub2.studentId,
            studentName2: sub2.studentName,
            overallScore: result.overallScore,
            algorithms: result.algorithms,
            matchedSegments: result.matchedSegments,
            isFlagged: result.overallScore >= thresholdDecimal, // Use user-defined threshold
          };

          matches.push(match);

          // Update submission plagiarism scores
          sub1.plagiarismScore = Math.max(sub1.plagiarismScore || 0, result.overallScore);
          sub2.plagiarismScore = Math.max(sub2.plagiarismScore || 0, result.overallScore);
          sub1.analyzed = true;
          sub2.analyzed = true;
        }
      }

      const flaggedCount = matches.filter(m => m.isFlagged).length;
      const averageScore = matches.length > 0
        ? matches.reduce((sum, m) => sum + m.overallScore, 0) / matches.length
        : 0;
      const highestScore = matches.length > 0
        ? Math.max(...matches.map(m => m.overallScore))
        : 0;

      const newAnalysis: PlagiarismAnalysis = {
        assignmentId: selectedAssignment.id,
        analyzedAt: new Date().toISOString(),
        totalSubmissions: submissions.length,
        matches,
        statistics: {
          averageScore,
          highestScore,
          flaggedCount,
          uniqueSubmissions: submissions.length - flaggedCount,
        },
      };

      await saveAnalysis(newAnalysis);
      setAnalysis(newAnalysis);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleViewMatch = (match: PlagiarismMatch) => {
    setSelectedMatch(match);
    setShowVisualization(true);
  };

  const handleDownloadReport = () => {
    if (!analysis || !selectedAssignment) return;

    generatePlagiarismReportPDF({
      assignmentId: selectedAssignment.id,
      assignmentTitle: selectedAssignment.title,
      generatedAt: new Date().toISOString(),
      analysis,
      submissions,
    });
  };

  const getSubmission1 = () => {
    if (!selectedMatch) return null;
    return submissions.find(s => s.studentId === selectedMatch.studentId1) || null;
  };

  const getSubmission2 = () => {
    if (!selectedMatch) return null;
    return submissions.find(s => s.studentId === selectedMatch.studentId2) || null;
  };

  if (selectedAssignment) {
    return (
      <div className="container mx-auto pt-24 pb-12 px-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedAssignment(null)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assignments
        </Button>

        <div className="mb-8">
          <Badge variant="outline" className="mb-4">Assignment Details</Badge>
          <h1 className="text-4xl font-bold mb-2">{selectedAssignment.title}</h1>
          <p className="text-muted-foreground text-lg">{selectedAssignment.description}</p>
        </div>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions">
              Submissions ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="analysis">
              Plagiarism Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-4">
            {submissions.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No submissions yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{submission.studentName}</span>
                          {/* Only show similarity score for text/essay assignments, not code */}
                          {submission.plagiarismScore !== undefined && selectedAssignment?.type !== 'code' && (
                            <Badge
                              variant={submission.plagiarismScore >= 0.6 ? 'destructive' : 'secondary'}
                            >
                              {(submission.plagiarismScore * 100).toFixed(1)}% Similarity
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                        
                        {/* Display attachments if any */}
                        {submission.attachments && submission.attachments.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Paperclip className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{submission.attachments.length} file(s) attached</span>
                            </div>
                            <div className="space-y-2">
                              {submission.attachments.map((file) => (
                                <div key={file.id} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                                  {file.type.startsWith('image/') ? (
                                    <ImageIcon className="w-4 h-4" />
                                  ) : (
                                    <FileText className="w-4 h-4" />
                                  )}
                                  <span className="truncate flex-1">{file.name}</span>
                                  <span className="text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Display content if any */}
                        {submission.content && submission.content.trim() && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-xs font-mono line-clamp-3">{submission.content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Plagiarism Detection</h2>
                <p className="text-muted-foreground">
                  {submissions.length < 2
                    ? 'Need at least 2 submissions to run analysis'
                    : `${submissions.length} submissions ready for analysis`}
                </p>
              </div>
              <div className="flex gap-2">
                {analysis && (
                  <Button onClick={handleDownloadReport} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Report
                  </Button>
                )}
                <Button
                  onClick={runPlagiarismAnalysis}
                  disabled={submissions.length < 2 || isAnalyzing}
                  className="gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {analysis ? 'Re-run Analysis' : 'Run Analysis'}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Threshold Input */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium block mb-2">
                    Similarity Threshold (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={thresholdValue}
                      onChange={(e) => setThresholdValue(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                    />
                    <input
                      type="number"
                      min="50"
                      max="100"
                      step="5"
                      value={thresholdValue}
                      onChange={(e) => setThresholdValue(Number(e.target.value))}
                      className="w-20 px-3 py-1.5 text-center border rounded-md"
                    />
                    <span className="text-sm font-semibold text-primary">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Submissions with similarity above {thresholdValue}% will be flagged for review
                  </p>
                </div>
              </div>
            </Card>

            {analysis ? (
              <PlagiarismDashboard matches={analysis.matches} onViewMatch={handleViewMatch} />
            ) : (
              <Card className="p-12 text-center">
                <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Click "Run Analysis" to detect plagiarism
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <SimilarityVisualization
          match={selectedMatch}
          submission1={getSubmission1()}
          submission2={getSubmission2()}
          open={showVisualization}
          onClose={() => setShowVisualization(false)}
        />
      </div>
    );
  }


  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline">Teacher Dashboard</Badge>
          </div>
          <h1 className="text-4xl font-bold mb-2">Plagiarism Detection System</h1>
          <p className="text-muted-foreground text-lg">
            Create assignments and analyze submissions for plagiarism
          </p>
        </div>
        <CreateAssignmentDialog onAssignmentCreated={loadAssignments} />
      </div>

      {loadError === 'firebase-permissions' && (
        <Card className="p-6 bg-destructive/10 border-destructive mb-6">
          <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Firebase Permissions Required
          </h3>
          <p className="text-sm mb-4">
            Please update your Firestore security rules to enable the plagiarism detection system:
          </p>
          <div className="bg-background p-4 rounded-md overflow-x-auto text-xs font-mono mb-4">
            <pre>{`// Add to your Firestore Rules:
match /plagiarism_assignments/{assignmentId} {
  allow read: if request.auth != null;
  allow create, update: if request.auth != null;
  allow delete: if request.auth != null 
              && request.auth.uid == resource.data.createdBy;
}

match /plagiarism_submissions/{submissionId} {
  allow read: if request.auth != null;
  allow create, update: if request.auth != null;
  allow delete: if request.auth != null 
              && request.auth.uid == resource.data.studentId;
}

match /plagiarism_analyses/{analysisId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}`}</pre>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => window.open('https://console.firebase.google.com/', '_blank')} variant="outline">
              Open Firebase Console
            </Button>
            <Button onClick={loadAssignments}>Retry</Button>
          </div>
        </Card>
      )}

      {assignments.length === 0 && !loadError ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No assignments yet</p>
          <CreateAssignmentDialog onAssignmentCreated={loadAssignments} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              submissionCount={submissionCounts[assignment.id] || 0}
              onView={() => handleViewAssignment(assignment)}
              onDelete={() => handleDeleteAssignment(assignment.id)}
              isTeacher={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherPlagiarismPage;
