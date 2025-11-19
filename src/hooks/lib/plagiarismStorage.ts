import { Assignment, Submission, PlagiarismAnalysis } from '@/types/plagiarism';
import * as firebaseService from './firebasePlagiarismService';

// ============================================
// ASSIGNMENT MANAGEMENT
// ============================================

export const saveAssignment = async (assignment: Assignment | Omit<Assignment, 'id'>): Promise<void> => {
  try {
    if ('id' in assignment && assignment.id) {
      // Update existing
      await firebaseService.updateAssignment(assignment.id, assignment);
    } else {
      // Create new
      await firebaseService.saveAssignment(assignment);
    }
  } catch (error) {
    console.error("Error saving assignment:", error);
    throw error;
  }
};

export const getAssignments = async (): Promise<Assignment[]> => {
  return firebaseService.getAssignments();
};

export const getAssignmentById = async (id: string): Promise<Assignment | null> => {
  return firebaseService.getAssignmentById(id);
};

export const getAssignmentsByTeacher = async (teacherId: string): Promise<Assignment[]> => {
  return firebaseService.getAssignmentsByTeacher(teacherId);
};

export const deleteAssignment = async (id: string): Promise<void> => {
  return firebaseService.deleteAssignment(id);
};

// ============================================
// SUBMISSION MANAGEMENT
// ============================================

export const saveSubmission = async (submission: Submission): Promise<void> => {
  try {
    await firebaseService.saveSubmission(submission);
  } catch (error) {
    console.error("Error saving submission:", error);
    throw error;
  }
};

export const getSubmissions = async (): Promise<Submission[]> => {
  return firebaseService.getSubmissions();
};

export const getSubmissionsByAssignment = async (assignmentId: string): Promise<Submission[]> => {
  return firebaseService.getSubmissionsByAssignment(assignmentId);
};

export const getSubmissionsByStudent = async (studentId: string): Promise<Submission[]> => {
  return firebaseService.getSubmissionsByStudent(studentId);
};

export const getSubmission = async (assignmentId: string, studentId: string): Promise<Submission | null> => {
  return firebaseService.getSubmission(assignmentId, studentId);
};

export const deleteSubmission = async (id: string): Promise<void> => {
  return firebaseService.deleteSubmission(id);
};

// ============================================
// PLAGIARISM ANALYSIS MANAGEMENT
// ============================================

export const saveAnalysis = async (analysis: PlagiarismAnalysis): Promise<void> => {
  try {
    if (analysis.id) {
      // Update existing - need to delete and recreate as Firestore doesn't support partial updates here
      await firebaseService.deleteAnalysis(analysis.assignmentId);
      await firebaseService.saveAnalysis(analysis);
    } else {
      await firebaseService.saveAnalysis(analysis);
    }
  } catch (error) {
    console.error("Error saving analysis:", error);
    throw error;
  }
};

export const getAnalyses = async (): Promise<PlagiarismAnalysis[]> => {
  return firebaseService.getAnalyses();
};

export const getAnalysisByAssignment = async (assignmentId: string): Promise<PlagiarismAnalysis | null> => {
  return firebaseService.getAnalysisByAssignment(assignmentId);
};

export const deleteAnalysis = async (assignmentId: string): Promise<void> => {
  return firebaseService.deleteAnalysis(assignmentId);
};

/**
 * Update submission plagiarism score
 */
export const updateSubmissionPlagiarismScore = async (
  submissionId: string,
  plagiarismScore: number,
  matches: any[]
): Promise<void> => {
  return firebaseService.updateSubmissionPlagiarismScore(submissionId, plagiarismScore, matches);
};
