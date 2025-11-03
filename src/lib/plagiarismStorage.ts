import { Assignment, Submission, PlagiarismAnalysis } from '@/types/plagiarism';

const STORAGE_KEYS = {
  ASSIGNMENTS: 'plagiarism_assignments',
  SUBMISSIONS: 'plagiarism_submissions',
  ANALYSES: 'plagiarism_analyses',
  CURRENT_USER: 'plagiarism_current_user',
  USER_ROLE: 'plagiarism_user_role',
};

// ============================================
// USER MANAGEMENT
// ============================================

export const setCurrentUser = (userId: string, userName: string, role: 'teacher' | 'student') => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ userId, userName, role }));
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
};

export const getCurrentUser = (): { userId: string; userName: string; role: 'teacher' | 'student' } | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const getUserRole = (): 'teacher' | 'student' | null => {
  return localStorage.getItem(STORAGE_KEYS.USER_ROLE) as 'teacher' | 'student' | null;
};

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

export const initializeSampleData = (): void => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    // Set default teacher user
    setCurrentUser('teacher1', 'Dr. Sarah Johnson', 'teacher');
  }
  
  const assignments = getAssignments();
  const submissions = getSubmissions();
  
  if (assignments.length === 0) {
    // Create sample assignments
    const sampleAssignments: Assignment[] = [
      {
        id: 'assign1',
        title: 'Introduction to Data Structures',
        description: 'Write an essay explaining the importance of data structures in computer science.',
        type: 'text',
        createdBy: 'teacher1',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxScore: 100,
        instructions: 'Write a minimum of 500 words discussing various data structures, their use cases, and time complexities.',
      },
      {
        id: 'assign2',
        title: 'Implement Binary Search',
        description: 'Implement a binary search algorithm in JavaScript/TypeScript.',
        type: 'code',
        createdBy: 'teacher1',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        maxScore: 100,
        instructions: 'Implement an efficient binary search function with proper error handling.',
        codeLanguage: 'javascript',
      },
    ];
    
    sampleAssignments.forEach(saveAssignment);
  }

  // Add sample submissions if none exist
  if (submissions.length === 0) {
    const sampleSubmissions: Submission[] = [
      // Text Assignment Submissions (assign1)
      {
        id: 'sub1',
        assignmentId: 'assign1',
        studentId: 'student1',
        studentName: 'Alex Thompson',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted',
        content: 'Data structures are fundamental components in computer science that organize and store data efficiently. Arrays provide constant-time access to elements, making them ideal for scenarios requiring quick lookups. Linked lists offer dynamic memory allocation and efficient insertion and deletion operations. Hash tables enable fast data retrieval through key-value pairs, with average O(1) time complexity. Trees, particularly binary search trees, maintain sorted data and support efficient searching, insertion, and deletion. Graphs represent complex relationships between entities and are essential for network analysis and pathfinding algorithms. The choice of data structure significantly impacts program performance and scalability.',
        analyzed: false,
      },
      {
        id: 'sub2',
        assignmentId: 'assign1',
        studentId: 'student2',
        studentName: 'Emma Wilson',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted',
        content: 'Data structures are fundamental building blocks in computer science that help organize and store data in an efficient manner. Arrays allow constant-time access to elements, which makes them perfect for situations requiring fast lookups. Linked lists provide dynamic memory allocation with efficient insertion and deletion capabilities. Hash tables enable rapid data retrieval using key-value pairs, achieving average O(1) time complexity. Trees, especially binary search trees, keep data sorted and support efficient searching, insertion, and deletion operations. Graphs represent intricate relationships between entities and are crucial for network analysis and pathfinding algorithms. Selecting the appropriate data structure greatly affects program performance and scalability.',
        analyzed: false,
      },
      {
        id: 'sub3',
        assignmentId: 'assign1',
        studentId: 'student3',
        studentName: 'Michael Chen',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted',
        content: 'Understanding data structures is crucial for writing efficient code. Stacks follow the Last-In-First-Out principle and are used in function call management and expression evaluation. Queues implement First-In-First-Out ordering, essential for task scheduling and breadth-first search algorithms. Priority queues maintain elements based on priority levels, useful in scheduling and pathfinding. Heaps provide efficient access to minimum or maximum elements, commonly used in heap sort and priority queues. Tries optimize string searching and prefix matching operations. B-trees enable efficient disk-based storage and retrieval in databases. Understanding these structures allows developers to choose the most appropriate solution for specific problems.',
        analyzed: false,
      },
      {
        id: 'sub4',
        assignmentId: 'assign1',
        studentId: 'student4',
        studentName: 'Sarah Martinez',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted',
        content: 'Data structures form the backbone of efficient programming. Different structures serve different purposes. Arrays store elements in contiguous memory locations. Linked lists use nodes with pointers. Hash tables map keys to values. Trees organize data hierarchically. Graphs connect nodes with edges. Each structure has unique time and space complexities. Choosing the right data structure depends on the specific requirements of the application, including access patterns, memory constraints, and performance needs. Mastering data structures is essential for any computer science professional.',
        analyzed: false,
      },

      // Code Assignment Submissions (assign2)
      {
        id: 'sub5',
        assignmentId: 'assign2',
        studentId: 'student1',
        studentName: 'Alex Thompson',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted',
        content: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// Test cases
console.log(binarySearch([1, 2, 3, 4, 5, 6, 7, 8, 9], 5)); // Output: 4
console.log(binarySearch([1, 2, 3, 4, 5], 10)); // Output: -1`,
        analyzed: false,
      },
      {
        id: 'sub6',
        assignmentId: 'assign2',
        studentId: 'student2',
        studentName: 'Emma Wilson',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted',
        content: `function binarySearch(array, value) {
  let start = 0;
  let end = array.length - 1;
  
  while (start <= end) {
    const middle = Math.floor((start + end) / 2);
    
    if (array[middle] === value) {
      return middle;
    } else if (array[middle] < value) {
      start = middle + 1;
    } else {
      end = middle - 1;
    }
  }
  
  return -1;
}

// Testing the function
console.log(binarySearch([1, 2, 3, 4, 5, 6, 7, 8, 9], 5)); // Returns: 4
console.log(binarySearch([1, 2, 3, 4, 5], 10)); // Returns: -1`,
        analyzed: false,
      },
      {
        id: 'sub7',
        assignmentId: 'assign2',
        studentId: 'student3',
        studentName: 'Michael Chen',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted',
        content: `function binarySearch(arr, target) {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error('Invalid input: array must be non-empty');
  }
  
  let low = 0;
  let high = arr.length - 1;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midValue = arr[mid];
    
    if (midValue === target) {
      return mid;
    }
    
    if (midValue < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  return -1;
}

// Example usage
const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15];
console.log(binarySearch(sortedArray, 7)); // 3
console.log(binarySearch(sortedArray, 4)); // -1`,
        analyzed: false,
      },
      {
        id: 'sub8',
        assignmentId: 'assign2',
        studentId: 'student4',
        studentName: 'Sarah Martinez',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'submitted',
        content: `const binarySearch = (nums, target) => {
  let leftIndex = 0;
  let rightIndex = nums.length - 1;
  
  while (leftIndex <= rightIndex) {
    let midIndex = Math.floor((leftIndex + rightIndex) / 2);
    
    if (nums[midIndex] === target) {
      return midIndex;
    } else if (nums[midIndex] < target) {
      leftIndex = midIndex + 1;
    } else {
      rightIndex = midIndex - 1;
    }
  }
  
  return -1;
};

// Test the function
const testArray = [2, 4, 6, 8, 10, 12, 14];
console.log(binarySearch(testArray, 8)); // 3
console.log(binarySearch(testArray, 5)); // -1`,
        analyzed: false,
      },
    ];
    
    sampleSubmissions.forEach(saveSubmission);
  }
};
