export type AssignmentType = 'text' | 'code' | 'pdf' | 'image';
export type SubmissionStatus = 'pending' | 'submitted' | 'analyzed' | 'flagged';
export type UserRole = 'teacher' | 'student';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  createdBy: string; // teacher id
  createdAt: string;
  dueDate: string;
  maxScore: number;
  instructions: string;
  attachments?: string[]; // URLs or base64
  allowedFileTypes?: string[];
  codeLanguage?: string; // for code assignments
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: SubmissionStatus;
  content: string; // text or code content
  attachments?: FileAttachment[];
  plagiarismScore?: number;
  analyzed: boolean;
  matchedSegments?: string[]; // Array of matched text segments for student view
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded
  uploadedAt: string;
}

export interface PlagiarismMatch {
  studentId1: string;
  studentName1: string;
  studentId2: string;
  studentName2: string;
  overallScore: number;
  algorithms: {
    jaccard: number;
    cosine: number;
    tfidf: number;
    levenshtein: number;
    lcs: number;
    semantic?: number;
    ast?: number;
    cfg?: number;
    winnowing?: number;
  };
  matchedSegments: MatchedSegment[];
  isFlagged: boolean;
}

export interface MatchedSegment {
  text1: string;
  text2: string;
  startIndex1: number;
  endIndex1: number;
  startIndex2: number;
  endIndex2: number;
  similarity: number;
}

export interface PlagiarismAnalysis {
  assignmentId: string;
  analyzedAt: string;
  totalSubmissions: number;
  matches: PlagiarismMatch[];
  statistics: {
    averageScore: number;
    highestScore: number;
    flaggedCount: number;
    uniqueSubmissions: number;
  };
}

export interface PlagiarismReport {
  assignmentId: string;
  assignmentTitle: string;
  generatedAt: string;
  analysis: PlagiarismAnalysis;
  submissions: Submission[];
}

export interface CodeAnalysisResult {
  astSimilarity: number;
  cfgSimilarity: number;
  winnowingScore: number;
  structuralPatterns: string[];
  variableRenamingDetected: boolean;
}
