import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AssignmentCard } from '@/components/plagiarism/AssignmentCard';
import { SubmissionForm } from '@/components/plagiarism/SubmissionForm';
import { Assignment } from '@/types/plagiarism';
import { getAssignments, getSubmission } from '@/hooks/lib/plagiarismStorage';
import { FileText, ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const StudentPlagiarismPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  const [assignmentStatuses, setAssignmentStatuses] = useState<{ [key: string]: any }>({});
  const [existingSubmission, setExistingSubmission] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    const allAssignments = await getAssignments();
    setAssignments(allAssignments);
  };

  const handleViewAssignment = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    if (user) {
      const submission = await getSubmission(assignment.id, user.id);
      setExistingSubmission(submission);
    }
    setShowSubmissionDialog(true);
  };

  const handleSubmissionComplete = () => {
    setShowSubmissionDialog(false);
    setSelectedAssignment(null);
    loadAssignments();
  };

  const getSubmissionStatus = async (assignment: Assignment) => {
    if (!user) return null;

    const submission = await getSubmission(assignment.id, user.id);
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now;

    if (submission) {
      return {
        status: 'submitted',
        icon: CheckCircle,
        color: 'text-green-600',
        label: 'Submitted',
      };
    } else if (isOverdue) {
      return {
        status: 'overdue',
        icon: AlertCircle,
        color: 'text-red-600',
        label: 'Overdue',
      };
    } else {
      return {
        status: 'pending',
        icon: Clock,
        color: 'text-yellow-600',
        label: 'Pending',
      };
    }
  };

  // Update assignment statuses when assignments change
  useEffect(() => {
    const updateStatuses = async () => {
      const statuses: { [key: string]: any } = {};
      for (const assignment of assignments) {
        statuses[assignment.id] = await getSubmissionStatus(assignment);
      }
      setAssignmentStatuses(statuses);
    };
    
    updateStatuses();
  }, [assignments, user]);

  const groupedAssignments = {
    pending: assignments.filter(a => assignmentStatuses[a.id]?.status === 'pending'),
    submitted: assignments.filter(a => assignmentStatuses[a.id]?.status === 'submitted'),
    overdue: assignments.filter(a => assignmentStatuses[a.id]?.status === 'overdue'),
  };


  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline">Student Dashboard</Badge>
        </div>
        <h1 className="text-4xl font-bold mb-2">My Assignments</h1>
        <p className="text-muted-foreground text-lg">
          View and submit your assignments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{groupedAssignments.pending.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{groupedAssignments.submitted.length}</p>
              <p className="text-sm text-muted-foreground">Submitted</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{groupedAssignments.overdue.length}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </Card>
      </div>

      {assignments.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No assignments available</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Pending Assignments */}
          {groupedAssignments.pending.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-yellow-600" />
                Pending Assignments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedAssignments.pending.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onView={() => handleViewAssignment(assignment)}
                    isTeacher={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Submitted Assignments */}
          {groupedAssignments.submitted.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Submitted Assignments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedAssignments.submitted.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onView={() => handleViewAssignment(assignment)}
                    isTeacher={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Overdue Assignments */}
          {groupedAssignments.overdue.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                Overdue Assignments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedAssignments.overdue.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onView={() => handleViewAssignment(assignment)}
                    isTeacher={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submission Dialog */}
      <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAssignment && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">
                      {selectedAssignment.title}
                    </DialogTitle>
                    <p className="text-muted-foreground">{selectedAssignment.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSubmissionDialog(false)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Assignment Details */}
                <Card className="p-4 bg-muted">
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                  <div className="flex gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Due Date:</span>{' '}
                      <span className="font-medium">
                        {new Date(selectedAssignment.dueDate).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Score:</span>{' '}
                      <span className="font-medium">{selectedAssignment.maxScore}</span>
                    </div>
                  </div>
                </Card>

                {/* Submission Form */}
                <SubmissionForm
                  assignment={selectedAssignment}
                  existingSubmission={existingSubmission}
                  onSubmitted={handleSubmissionComplete}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentPlagiarismPage;
