import { Assignment, Submission, PlagiarismAnalysis } from '@/types/plagiarism';

const STORAGE_KEYS = {
  ASSIGNMENTS: 'plagiarism_assignments',
  SUBMISSIONS: 'plagiarism_submissions',
  ANALYSES: 'plagiarism_analyses',
};

// User management now handled by AuthContext - no localStorage user tracking needed

// ============================================
// ASSIGNMENT MANAGEMENT
// ============================================

export const saveAssignment = (assignment: Assignment): void => {
  const assignments = getAssignments();
  const existingIndex = assignments.findIndex(a => a.id === assignment.id);
  
  if (existingIndex >= 0) {
    assignments[existingIndex] = assignment;
  } else {
    assignments.push(assignment);
  }
  
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
};

export const getAssignments = (): Assignment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  return data ? JSON.parse(data) : [];
};

export const getAssignmentById = (id: string): Assignment | null => {
  const assignments = getAssignments();
  return assignments.find(a => a.id === id) || null;
};

export const getAssignmentsByTeacher = (teacherId: string): Assignment[] => {
  const assignments = getAssignments();
  return assignments.filter(a => a.createdBy === teacherId);
};

export const deleteAssignment = (id: string): void => {
  const assignments = getAssignments().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  
  // Also delete related submissions
  const submissions = getSubmissions().filter(s => s.assignmentId !== id);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
};

// ============================================
// SUBMISSION MANAGEMENT
// ============================================

export const saveSubmission = (submission: Submission): void => {
  const submissions = getSubmissions();
  const existingIndex = submissions.findIndex(
    s => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId
  );
  
  if (existingIndex >= 0) {
    submissions[existingIndex] = submission;
  } else {
    submissions.push(submission);
  }
  
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
};

export const getSubmissions = (): Submission[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  return data ? JSON.parse(data) : [];
};

export const getSubmissionsByAssignment = (assignmentId: string): Submission[] => {
  const submissions = getSubmissions();
  return submissions.filter(s => s.assignmentId === assignmentId);
};

export const getSubmissionsByStudent = (studentId: string): Submission[] => {
  const submissions = getSubmissions();
  return submissions.filter(s => s.studentId === studentId);
};

export const getSubmission = (assignmentId: string, studentId: string): Submission | null => {
  const submissions = getSubmissions();
  return submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId) || null;
};

export const deleteSubmission = (id: string): void => {
  const submissions = getSubmissions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
};

// ============================================
// PLAGIARISM ANALYSIS MANAGEMENT
// ============================================

export const saveAnalysis = (analysis: PlagiarismAnalysis): void => {
  const analyses = getAnalyses();
  const existingIndex = analyses.findIndex(a => a.assignmentId === analysis.assignmentId);
  
  if (existingIndex >= 0) {
    analyses[existingIndex] = analysis;
  } else {
    analyses.push(analysis);
  }
  
  localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));
};

export const getAnalyses = (): PlagiarismAnalysis[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ANALYSES);
  return data ? JSON.parse(data) : [];
};

export const getAnalysisByAssignment = (assignmentId: string): PlagiarismAnalysis | null => {
  const analyses = getAnalyses();
  return analyses.find(a => a.assignmentId === assignmentId) || null;
};

export const deleteAnalysis = (assignmentId: string): void => {
  const analyses = getAnalyses().filter(a => a.assignmentId !== assignmentId);
  localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));
};

// ============================================
// INITIALIZATION
// ============================================
// Demo data initialization removed - system now uses real user data from Firebase Auth
