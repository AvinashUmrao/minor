import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Assignment, Submission, FileAttachment } from '@/types/plagiarism';
import { saveSubmission } from '@/hooks/lib/plagiarismStorage';
import { Send, CheckCircle, Upload, X, FileText, Image as ImageIcon, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { StudentPlagiarismResults } from './StudentPlagiarismResults';

interface SubmissionFormProps {
  assignment: Assignment;
  existingSubmission?: Submission | null;
  onSubmitted: () => void;
}

export const SubmissionForm = ({ assignment, existingSubmission, onSubmitted }: SubmissionFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState(existingSubmission?.content || '');
  const [attachments, setAttachments] = useState<FileAttachment[]>(existingSubmission?.attachments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) return;

    const submission: Submission = {
      id: existingSubmission?.id || `sub_${Date.now()}`,
      assignmentId: assignment.id,
      studentId: user.id,
      studentName: user.name,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      content,
      attachments,
      analyzed: false,
    };

    await saveSubmission(submission);
    
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitted();
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError('');

    Array.from(files).forEach(file => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File ${file.name} is too large. Max size is 5MB.`);
        return;
      }

      // Check file type based on assignment type
      const validTypes: { [key: string]: string[] } = {
        pdf: ['application/pdf'],
        image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        text: ['text/plain', 'application/pdf'],
        code: ['text/plain', 'application/pdf'],
      };

      const allowedTypes = validTypes[assignment.type] || [];
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        setUploadError(`Invalid file type for ${file.name}. Please upload ${assignment.type} files.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        const newAttachment: FileAttachment = {
          id: `file_${Date.now()}_${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
          uploadedAt: new Date().toISOString(),
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    return FileText;
  };

  const isAlreadySubmitted = !!existingSubmission;
  const requiresFile = assignment.type === 'pdf' || assignment.type === 'image';
  const canSubmit = requiresFile ? attachments.length > 0 : content.trim().length > 0;
  const hasResults = existingSubmission?.analyzed && existingSubmission?.plagiarismScore !== undefined;

  // Show results view if requested
  if (showResults && existingSubmission) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowResults(false)}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Back to Submission
        </Button>
        <StudentPlagiarismResults submission={existingSubmission} />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload Section */}
        {(assignment.type === 'pdf' || assignment.type === 'image') && (
          <div>
            <Label htmlFor="file-upload" className="mb-2 block">
              Upload {assignment.type === 'pdf' ? 'PDF' : 'Image'} File(s)
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
                accept={assignment.type === 'pdf' ? '.pdf' : 'image/*'}
                multiple
                className="hidden"
                disabled={isSubmitting}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">
                  {assignment.type === 'pdf' ? 'PDF files' : 'JPG, PNG, GIF, WEBP'} (Max 5MB per file)
                </p>
              </label>
            </div>
            {uploadError && (
              <p className="text-sm text-red-600 mt-2">{uploadError}</p>
            )}
          </div>
        )}

        {/* Uploaded Files Display */}
        {attachments.length > 0 && (
          <div>
            <Label className="mb-2 block">Uploaded Files ({attachments.length})</Label>
            <div className="space-y-2">
              {attachments.map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <Card key={file.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <FileIcon className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(file.id)}
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Text/Code Input Section */}
        {(assignment.type === 'text' || assignment.type === 'code') && (
          <div>
            <Label htmlFor="content">
              {assignment.type === 'code' ? 'Your Code' : 'Your Answer'}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                assignment.type === 'code'
                  ? '// Write your code here...'
                  : 'Write your answer here...'
              }
              rows={15}
              className="font-mono text-sm"
              required
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {content.length} characters
            </p>
          </div>
        )}

        {/* Optional: Additional notes for file uploads */}
        {(assignment.type === 'pdf' || assignment.type === 'image') && (
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add any additional notes or comments..."
              rows={4}
              className="text-sm"
              disabled={isSubmitting}
            />
          </div>
        )}

        {isAlreadySubmitted && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Already Submitted
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                You can update your submission until the due date
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center gap-2">
          {hasResults && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResults(true)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              View Plagiarism Results
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {isAlreadySubmitted ? 'Update Submission' : 'Submit Assignment'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
