import { db } from "@/firebase";
import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { Assignment, Submission, PlagiarismAnalysis } from "@/types/plagiarism";

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Remove undefined values from an object (Firebase doesn't support undefined)
 */
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// ============================================
// ASSIGNMENT MANAGEMENT
// ============================================

/**
 * Create a new assignment
 */
export const saveAssignment = async (assignment: Omit<Assignment, "id">): Promise<string> => {
  try {
    const assignmentsRef = collection(db, "plagiarism_assignments");
    const newAssignment = sanitizeData({
      ...assignment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const docRef = await addDoc(assignmentsRef, newAssignment);
    return docRef.id;
  } catch (error) {
    console.error("Error saving assignment:", error);
    throw error;
  }
};

/**
 * Update an existing assignment
 */
export const updateAssignment = async (id: string, updates: Partial<Assignment>): Promise<void> => {
  try {
    const assignmentRef = doc(db, "plagiarism_assignments", id);
    await setDoc(assignmentRef, sanitizeData({
      ...updates,
      updatedAt: serverTimestamp(),
    }), { merge: true });
  } catch (error) {
    console.error("Error updating assignment:", error);
    throw error;
  }
};

/**
 * Get all assignments
 */
export const getAssignments = async (): Promise<Assignment[]> => {
  try {
    const assignmentsRef = collection(db, "plagiarism_assignments");
    const q = query(assignmentsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Assignment));
  } catch (error) {
    console.error("Error getting assignments:", error);
    return [];
  }
};

/**
 * Get a single assignment by ID
 */
export const getAssignmentById = async (id: string): Promise<Assignment | null> => {
  try {
    const assignmentRef = doc(db, "plagiarism_assignments", id);
    const snapshot = await getDoc(assignmentRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Assignment;
  } catch (error) {
    console.error("Error getting assignment:", error);
    return null;
  }
};

/**
 * Get assignments by teacher
 */
export const getAssignmentsByTeacher = async (teacherId: string): Promise<Assignment[]> => {
  try {
    const assignmentsRef = collection(db, "plagiarism_assignments");
    const q = query(
      assignmentsRef,
      where("createdBy", "==", teacherId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Assignment));
  } catch (error) {
    console.error("Error getting teacher assignments:", error);
    return [];
  }
};

/**
 * Delete an assignment and all its submissions
 */
export const deleteAssignment = async (id: string): Promise<void> => {
  try {
    // Delete assignment
    const assignmentRef = doc(db, "plagiarism_assignments", id);
    await deleteDoc(assignmentRef);

    // Delete all related submissions
    const submissionsRef = collection(db, "plagiarism_submissions");
    const q = query(submissionsRef, where("assignmentId", "==", id));
    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete analysis
    const analysisRef = collection(db, "plagiarism_analyses");
    const aq = query(analysisRef, where("assignmentId", "==", id));
    const aSnapshot = await getDocs(aq);

    const deleteAnalysisPromises = aSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteAnalysisPromises);
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw error;
  }
};

// ============================================
// SUBMISSION MANAGEMENT
// ============================================

/**
 * Save or update a submission
 */
export const saveSubmission = async (submission: Omit<Submission, "id">): Promise<string> => {
  try {
    const submissionsRef = collection(db, "plagiarism_submissions");

    // Check if submission already exists
    const q = query(
      submissionsRef,
      where("assignmentId", "==", submission.assignmentId),
      where("studentId", "==", submission.studentId)
    );
    const existing = await getDocs(q);

    if (existing.docs.length > 0) {
      // Update existing submission
      const docRef = existing.docs[0].ref;
      await setDoc(docRef, sanitizeData({
        ...submission,
        updatedAt: serverTimestamp(),
      }), { merge: true });
      return existing.docs[0].id;
    } else {
      // Create new submission
      const newSubmission = sanitizeData({
        ...submission,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const docRef = await addDoc(submissionsRef, newSubmission);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving submission:", error);
    throw error;
  }
};

/**
 * Get all submissions
 */
export const getSubmissions = async (): Promise<Submission[]> => {
  try {
    const submissionsRef = collection(db, "plagiarism_submissions");
    const q = query(submissionsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Submission));
  } catch (error) {
    console.error("Error getting submissions:", error);
    return [];
  }
};

/**
 * Get submissions by assignment
 */
export const getSubmissionsByAssignment = async (assignmentId: string): Promise<Submission[]> => {
  try {
    const submissionsRef = collection(db, "plagiarism_submissions");
    const q = query(
      submissionsRef,
      where("assignmentId", "==", assignmentId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Submission));
  } catch (error) {
    console.error("Error getting assignment submissions:", error);
    return [];
  }
};

/**
 * Get submissions by student
 */
export const getSubmissionsByStudent = async (studentId: string): Promise<Submission[]> => {
  try {
    const submissionsRef = collection(db, "plagiarism_submissions");
    const q = query(
      submissionsRef,
      where("studentId", "==", studentId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Submission));
  } catch (error) {
    console.error("Error getting student submissions:", error);
    return [];
  }
};

/**
 * Get a specific submission
 */
export const getSubmission = async (
  assignmentId: string,
  studentId: string
): Promise<Submission | null> => {
  try {
    const submissionsRef = collection(db, "plagiarism_submissions");
    const q = query(
      submissionsRef,
      where("assignmentId", "==", assignmentId),
      where("studentId", "==", studentId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Submission;
  } catch (error) {
    console.error("Error getting submission:", error);
    return null;
  }
};

/**
 * Delete a submission
 */
export const deleteSubmission = async (id: string): Promise<void> => {
  try {
    const submissionRef = doc(db, "plagiarism_submissions", id);
    await deleteDoc(submissionRef);
  } catch (error) {
    console.error("Error deleting submission:", error);
    throw error;
  }
};

// ============================================
// PLAGIARISM ANALYSIS MANAGEMENT
// ============================================

/**
 * Save plagiarism analysis
 */
export const saveAnalysis = async (analysis: Omit<PlagiarismAnalysis, "id">): Promise<string> => {
  try {
    const analysesRef = collection(db, "plagiarism_analyses");

    // Check if analysis already exists
    const q = query(
      analysesRef,
      where("assignmentId", "==", analysis.assignmentId)
    );
    const existing = await getDocs(q);

    if (existing.docs.length > 0) {
      // Update existing analysis
      const docRef = existing.docs[0].ref;
      await setDoc(docRef, sanitizeData({
        ...analysis,
        updatedAt: serverTimestamp(),
      }), { merge: true });
      return existing.docs[0].id;
    } else {
      // Create new analysis
      const newAnalysis = sanitizeData({
        ...analysis,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const docRef = await addDoc(analysesRef, newAnalysis);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving analysis:", error);
    throw error;
  }
};

/**
 * Get all analyses
 */
export const getAnalyses = async (): Promise<PlagiarismAnalysis[]> => {
  try {
    const analysesRef = collection(db, "plagiarism_analyses");
    const q = query(analysesRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as unknown as PlagiarismAnalysis));
  } catch (error) {
    console.error("Error getting analyses:", error);
    return [];
  }
};

/**
 * Get analysis by assignment
 */
export const getAnalysisByAssignment = async (
  assignmentId: string
): Promise<PlagiarismAnalysis | null> => {
  try {
    const analysesRef = collection(db, "plagiarism_analyses");
    const q = query(
      analysesRef,
      where("assignmentId", "==", assignmentId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as unknown as PlagiarismAnalysis;
  } catch (error) {
    console.error("Error getting analysis:", error);
    return null;
  }
};

/**
 * Delete analysis
 */
export const deleteAnalysis = async (assignmentId: string): Promise<void> => {
  try {
    const analysesRef = collection(db, "plagiarism_analyses");
    const q = query(
      analysesRef,
      where("assignmentId", "==", assignmentId)
    );
    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting analysis:", error);
    throw error;
  }
};

/**
 * Update submission plagiarism score
 */
export const updateSubmissionPlagiarismScore = async (
  submissionId: string,
  plagiarismScore: number,
  matches: any[]
): Promise<void> => {
  try {
    const submissionRef = doc(db, "plagiarism_submissions", submissionId);
    await setDoc(submissionRef, {
      plagiarismScore,
      matches,
      analyzedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error updating plagiarism score:", error);
    throw error;
  }
};
