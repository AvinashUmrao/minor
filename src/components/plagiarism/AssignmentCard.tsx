import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Assignment } from '@/types/plagiarism';
import { FileText, Code, FileImage, File, Calendar, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface AssignmentCardProps {
  assignment: Assignment;
  submissionCount?: number;
  onView: () => void;
  onDelete?: () => void;
  isTeacher?: boolean;
}

const typeIcons = {
  text: FileText,
  code: Code,
  pdf: File,
  image: FileImage,
};

const typeColors = {
  text: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  code: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  pdf: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  image: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export const AssignmentCard = ({ 
  assignment, 
  submissionCount = 0, 
  onView, 
  onDelete,
  isTeacher = false 
}: AssignmentCardProps) => {
  const Icon = typeIcons[assignment.type];
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-3 rounded-lg ${typeColors[assignment.type]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{assignment.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {assignment.description}
            </p>
          </div>
        </div>
        {isTeacher && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="gap-1">
          <Calendar className="w-3 h-3" />
          Due: {format(dueDate, 'MMM dd, yyyy')}
        </Badge>
        {isOverdue && (
          <Badge variant="destructive">Overdue</Badge>
        )}
        {isTeacher && (
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" />
            {submissionCount} Submissions
          </Badge>
        )}
        <Badge variant="outline">
          Max Score: {assignment.maxScore}
        </Badge>
      </div>

      <Button onClick={onView} className="w-full">
        {isTeacher ? 'View Submissions' : 'View Assignment'}
      </Button>
    </Card>
  );
};
