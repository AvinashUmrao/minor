// Modular Question Bank Structure
// Easy to extend with new subjects, topics, and questions

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: Difficulty;
  topic: string;
  subject: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

// ==================== SUBJECTS ====================

export const subjects: Subject[] = [
  {
    id: 'algorithms',
    name: 'Algorithms',
    description: 'Algorithm design, analysis, and optimization',
    topics: [
      { id: 'searching', name: 'Searching', description: 'Binary search, linear search' },
      { id: 'sorting', name: 'Sorting', description: 'Merge sort, quick sort, heap sort' },
      { id: 'graphs', name: 'Graph Algorithms', description: 'BFS, DFS, Dijkstra, MST' },
      { id: 'dp', name: 'Dynamic Programming', description: 'Memoization, tabulation' },
      { id: 'greedy', name: 'Greedy Algorithms', description: 'Optimal substructure' },
    ],
  },
  {
    id: 'data-structures',
    name: 'Data Structures',
    description: 'Fundamental data structures and their operations',
    topics: [
      { id: 'arrays', name: 'Arrays & Strings', description: 'Array operations, string manipulation' },
      { id: 'linked-lists', name: 'Linked Lists', description: 'Singly, doubly, circular lists' },
      { id: 'stacks-queues', name: 'Stacks & Queues', description: 'LIFO and FIFO structures' },
      { id: 'trees', name: 'Trees', description: 'Binary trees, BST, AVL, heaps' },
      { id: 'hash-tables', name: 'Hash Tables', description: 'Hashing, collision resolution' },
    ],
  },
  {
    id: 'dbms',
    name: 'Database Management',
    description: 'Database concepts, SQL, normalization',
    topics: [
      { id: 'sql', name: 'SQL Queries', description: 'SELECT, JOIN, subqueries' },
      { id: 'normalization', name: 'Normalization', description: '1NF, 2NF, 3NF, BCNF' },
      { id: 'transactions', name: 'Transactions', description: 'ACID properties, concurrency' },
      { id: 'indexing', name: 'Indexing', description: 'B-trees, B+ trees' },
    ],
  },
  {
    id: 'os',
    name: 'Operating Systems',
    description: 'Process management, memory, file systems',
    topics: [
      { id: 'processes', name: 'Process Management', description: 'Scheduling, synchronization' },
      { id: 'memory', name: 'Memory Management', description: 'Paging, segmentation' },
      { id: 'deadlock', name: 'Deadlock', description: 'Prevention, avoidance, detection' },
      { id: 'file-systems', name: 'File Systems', description: 'Directory structure, allocation' },
    ],
  },
  {
    id: 'networks',
    name: 'Computer Networks',
    description: 'Network protocols, layers, security',
    topics: [
      { id: 'osi-model', name: 'OSI Model', description: '7 layers of networking' },
      { id: 'tcp-ip', name: 'TCP/IP', description: 'Transport and network protocols' },
      { id: 'routing', name: 'Routing', description: 'Routing algorithms and protocols' },
      { id: 'security', name: 'Network Security', description: 'Encryption, firewalls' },
    ],
  },
];

// ==================== QUESTION BANK ====================

export const questionBank: Question[] = [
  // ========== ALGORITHMS - SEARCHING ==========
  {
    id: 1,
    question: "What is the time complexity of binary search in a sorted array?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correctAnswer: 1,
    explanation: "Binary search divides the search space in half at each step, resulting in O(log n) time complexity.",
    difficulty: "Easy",
    topic: "searching",
    subject: "algorithms",
  },
  {
    id: 2,
    question: "In binary search, what is the worst-case number of comparisons for an array of size n?",
    options: ["n", "log₂(n)", "⌈log₂(n)⌉ + 1", "n/2"],
    correctAnswer: 2,
    explanation: "The worst case requires ⌈log₂(n)⌉ + 1 comparisons, where we keep dividing until we reach a single element.",
    difficulty: "Medium",
    topic: "searching",
    subject: "algorithms",
  },
  {
    id: 3,
    question: "Which searching algorithm is optimal for searching in a rotated sorted array?",
    options: ["Linear search", "Modified binary search", "Jump search", "Exponential search"],
    correctAnswer: 1,
    explanation: "Modified binary search can find the pivot point and then search in the appropriate half, maintaining O(log n) complexity.",
    difficulty: "Hard",
    topic: "searching",
    subject: "algorithms",
  },

  // ========== ALGORITHMS - SORTING ==========
  {
    id: 4,
    question: "Which sorting algorithm has the best average case time complexity?",
    options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
    correctAnswer: 2,
    explanation: "Merge Sort has O(n log n) time complexity in all cases (best, average, and worst).",
    difficulty: "Easy",
    topic: "sorting",
    subject: "algorithms",
  },
  {
    id: 5,
    question: "What is the space complexity of in-place Quick Sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    explanation: "In-place Quick Sort uses O(log n) space for the recursion stack in the average case.",
    difficulty: "Medium",
    topic: "sorting",
    subject: "algorithms",
  },
  {
    id: 6,
    question: "Which sorting algorithm is stable and has O(n) best-case time complexity?",
    options: ["Quick Sort", "Heap Sort", "Insertion Sort", "Selection Sort"],
    correctAnswer: 2,
    explanation: "Insertion Sort is stable and has O(n) best-case complexity when the array is already sorted.",
    difficulty: "Hard",
    topic: "sorting",
    subject: "algorithms",
  },

  // ========== ALGORITHMS - GRAPHS ==========
  {
    id: 7,
    question: "Dijkstra's algorithm cannot handle which type of edges?",
    options: ["Positive weighted edges", "Zero weighted edges", "Negative weighted edges", "All of the above"],
    correctAnswer: 2,
    explanation: "Dijkstra's algorithm assumes non-negative edge weights to guarantee optimality.",
    difficulty: "Medium",
    topic: "graphs",
    subject: "algorithms",
  },
  {
    id: 8,
    question: "What is the time complexity of BFS for a graph with V vertices and E edges?",
    options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"],
    correctAnswer: 2,
    explanation: "BFS visits each vertex once and explores each edge once, giving O(V + E) complexity.",
    difficulty: "Easy",
    topic: "graphs",
    subject: "algorithms",
  },
  {
    id: 9,
    question: "Which algorithm finds the shortest path in a graph with negative edge weights?",
    options: ["Dijkstra", "Bellman-Ford", "Prim's", "Kruskal's"],
    correctAnswer: 1,
    explanation: "Bellman-Ford algorithm can handle negative weights and detect negative cycles.",
    difficulty: "Hard",
    topic: "graphs",
    subject: "algorithms",
  },

  // ========== DATA STRUCTURES - STACKS & QUEUES ==========
  {
    id: 10,
    question: "Which data structure uses LIFO (Last In First Out) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    explanation: "Stack follows LIFO principle where the last element inserted is the first one to be removed.",
    difficulty: "Easy",
    topic: "stacks-queues",
    subject: "data-structures",
  },
  {
    id: 11,
    question: "What is the time complexity of enqueue and dequeue operations in a queue using linked list?",
    options: ["O(1) for both", "O(n) for both", "O(1) enqueue, O(n) dequeue", "O(n) enqueue, O(1) dequeue"],
    correctAnswer: 0,
    explanation: "Both operations can be done in O(1) time using pointers to front and rear.",
    difficulty: "Medium",
    topic: "stacks-queues",
    subject: "data-structures",
  },
  {
    id: 12,
    question: "How can you implement a queue using two stacks efficiently?",
    options: ["Not possible", "Amortized O(1) per operation", "O(n) per operation", "O(log n) per operation"],
    correctAnswer: 1,
    explanation: "Using two stacks, we can achieve amortized O(1) time for both enqueue and dequeue operations.",
    difficulty: "Hard",
    topic: "stacks-queues",
    subject: "data-structures",
  },

  // ========== DATA STRUCTURES - TREES ==========
  {
    id: 13,
    question: "In a binary tree, what is the maximum number of nodes at level k?",
    options: ["2^k", "2^(k-1)", "2^(k+1)", "k^2"],
    correctAnswer: 0,
    explanation: "At level k in a binary tree, there can be at most 2^k nodes (considering root at level 0).",
    difficulty: "Medium",
    topic: "trees",
    subject: "data-structures",
  },
  {
    id: 14,
    question: "Which traversal of a BST yields a sorted sequence?",
    options: ["Preorder", "Inorder", "Postorder", "Level order"],
    correctAnswer: 1,
    explanation: "Inorder traversal of a BST visits nodes in non-decreasing key order.",
    difficulty: "Easy",
    topic: "trees",
    subject: "data-structures",
  },
  {
    id: 15,
    question: "What is the time complexity of searching in a balanced BST?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    explanation: "In a balanced BST, the height is O(log n), so search takes O(log n) time.",
    difficulty: "Hard",
    topic: "trees",
    subject: "data-structures",
  },

  // ========== DATA STRUCTURES - HEAPS ==========
  {
    id: 16,
    question: "Which data structure is best for implementing a priority queue?",
    options: ["Stack", "Queue", "Heap", "Deque"],
    correctAnswer: 2,
    explanation: "Heaps provide efficient insertion and extraction of the highest (or lowest) priority element.",
    difficulty: "Easy",
    topic: "trees",
    subject: "data-structures",
  },
  {
    id: 17,
    question: "What is the time complexity of building a heap from n elements?",
    options: ["O(n)", "O(n log n)", "O(log n)", "O(n²)"],
    correctAnswer: 0,
    explanation: "Building a heap using the bottom-up approach takes O(n) time.",
    difficulty: "Medium",
    topic: "trees",
    subject: "data-structures",
  },
  {
    id: 18,
    question: "In a min-heap, which property must be satisfied?",
    options: ["Parent ≥ Children", "Parent ≤ Children", "Left child < Right child", "All leaves are at same level"],
    correctAnswer: 1,
    explanation: "In a min-heap, every parent node must be less than or equal to its children.",
    difficulty: "Hard",
    topic: "trees",
    subject: "data-structures",
  },

  // ========== ALGORITHMS - DYNAMIC PROGRAMMING ==========
  {
    id: 19,
    question: "What is the space complexity of the recursive fibonacci function?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    correctAnswer: 1,
    explanation: "The recursive fibonacci function has O(n) space complexity due to the recursion call stack.",
    difficulty: "Medium",
    topic: "dp",
    subject: "algorithms",
  },
  {
    id: 20,
    question: "Which technique is used in dynamic programming to avoid redundant calculations?",
    options: ["Recursion", "Memoization", "Iteration", "Backtracking"],
    correctAnswer: 1,
    explanation: "Memoization stores previously computed results to avoid redundant calculations.",
    difficulty: "Easy",
    topic: "dp",
    subject: "algorithms",
  },
  {
    id: 21,
    question: "What is the time complexity of solving 0/1 Knapsack using DP?",
    options: ["O(n)", "O(n²)", "O(n*W)", "O(2^n)"],
    correctAnswer: 2,
    explanation: "The DP solution for 0/1 Knapsack has O(n*W) time complexity, where n is items and W is capacity.",
    difficulty: "Hard",
    topic: "dp",
    subject: "algorithms",
  },

  // ========== ALGORITHMS - GREEDY ==========
  {
    id: 22,
    question: "Which problem can be solved optimally using a greedy approach?",
    options: ["0/1 Knapsack", "Fractional Knapsack", "Longest Common Subsequence", "Edit Distance"],
    correctAnswer: 1,
    explanation: "Fractional Knapsack can be solved optimally using a greedy approach by selecting items with highest value/weight ratio.",
    difficulty: "Easy",
    topic: "greedy",
    subject: "algorithms",
  },
  {
    id: 23,
    question: "What is the time complexity of Huffman coding algorithm?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    correctAnswer: 1,
    explanation: "Huffman coding uses a priority queue and takes O(n log n) time for n characters.",
    difficulty: "Medium",
    topic: "greedy",
    subject: "algorithms",
  },
  {
    id: 24,
    question: "Which property must a problem have to be solved using greedy approach?",
    options: ["Overlapping subproblems", "Optimal substructure", "Both A and B", "Neither A nor B"],
    correctAnswer: 1,
    explanation: "Greedy algorithms require optimal substructure but not necessarily overlapping subproblems.",
    difficulty: "Hard",
    topic: "greedy",
    subject: "algorithms",
  },

  // ========== DBMS - SQL ==========
  {
    id: 25,
    question: "Which SQL clause is used to filter the results of a query based on a condition?",
    options: ["WHERE", "FILTER", "HAVING", "GROUP BY"],
    correctAnswer: 0,
    explanation: "The WHERE clause is used to filter rows before any grouping occurs.",
    difficulty: "Easy",
    topic: "sql",
    subject: "dbms",
  },
  {
    id: 26,
    question: "What is the primary difference between the WHERE and HAVING clauses in SQL?",
    options: ["WHERE filters rows, HAVING filters groups", "WHERE filters groups, HAVING filters rows", "Both are identical", "WHERE is for strings, HAVING is for numbers"],
    correctAnswer: 0,
    explanation: "WHERE filters rows before they are grouped (using GROUP BY), while HAVING filters groups after the GROUP BY clause is applied.",
    difficulty: "Medium",
    topic: "sql",
    subject: "dbms",
  },
  {
    id: 27,
    question: "Which type of SQL JOIN returns all rows from the left table and the matched rows from the right table?",
    options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "FULL JOIN"],
    correctAnswer: 2,
    explanation: "A LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table, and the matched records from the right table. The result is NULL from the right side if there is no match.",
    difficulty: "Medium",
    topic: "sql",
    subject: "dbms",
  },
  {
    id: 28,
    question: "What is a 'correlated subquery' in SQL?",
    options: [
      "A subquery that is executed once before the outer query",
      "A subquery that depends on the outer query for its values",
      "A subquery that returns multiple rows",
      "A subquery used only in the WHERE clause"
    ],
    correctAnswer: 1,
    explanation: "A correlated subquery is a subquery that is evaluated once for each row processed by the outer query, as it references columns from the outer query.",
    difficulty: "Hard",
    topic: "sql",
    subject: "dbms",
  },

  // ========== DBMS - NORMALIZATION ==========
  {
    id: 29,
    question: "What is the primary goal of First Normal Form (1NF)?",
    options: ["Eliminate partial dependencies", "Eliminate transitive dependencies", "Ensure all attributes are atomic", "Ensure no update anomalies"],
    correctAnswer: 2,
    explanation: "1NF requires that all columns in a table contain atomic (indivisible) values and that there are no repeating groups.",
    difficulty: "Easy",
    topic: "normalization",
    subject: "dbms",
  },
  {
    id: 30,
    question: "A relation is in 3NF if it is in 2NF and has no...?",
    options: ["Partial dependencies", "Transitive dependencies", "Multi-valued dependencies", "Atomic values"],
    correctAnswer: 1,
    explanation: "Third Normal Form (3NF) builds on 2NF by removing transitive dependencies (where a non-key attribute depends on another non-key attribute).",
    difficulty: "Medium",
    topic: "normalization",
    subject: "dbms",
  },
  {
    id: 31,
    question: "Boyce-Codd Normal Form (BCNF) is stricter than 3NF because it handles anomalies arising from...?",
    options: [
      "Multiple candidate keys",
      "Partial dependencies",
      "Transitive dependencies",
      "Non-atomic values"
    ],
    correctAnswer: 0,
    explanation: "BCNF is a stricter version of 3NF. It addresses anomalies that 3NF doesn't handle, typically when a table has multiple overlapping candidate keys.",
    difficulty: "Hard",
    topic: "normalization",
    subject: "dbms",
  },

  // ========== DBMS - TRANSACTIONS ==========
  {
    id: 32,
    question: "What does the 'A' in ACID properties of a transaction stand for?",
    options: ["Atomicity", "Accuracy", "Availability", "Authentication"],
    correctAnswer: 0,
    explanation: "Atomicity ensures that a transaction is treated as a single, indivisible unit—it either completes fully or not at all.",
    difficulty: "Easy",
    topic: "transactions",
    subject: "dbms",
  },
  {
    id: 33,
    question: "Which ACID property ensures that concurrent transactions do not interfere with each other?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correctAnswer: 2,
    explanation: "Isolation ensures that the execution of one transaction is isolated from that of other concurrent transactions, preventing issues like dirty reads.",
    difficulty: "Medium",
    topic: "transactions",
    subject: "dbms",
  },

  // ========== OS - PROCESS MANAGEMENT ==========
  {
    id: 34,
    question: "What is a 'process' in an Operating System?",
    options: ["A file on disk", "A program in execution", "A hardware component", "A kernel function"],
    correctAnswer: 1,
    explanation: "A process is an instance of a computer program that is being executed. It includes the program code, data, and a Process Control Block (PCB).",
    difficulty: "Easy",
    topic: "processes",
    subject: "os",
  },
  {
    id: 35,
    question: "What is the primary difference between a process and a thread?",
    options: ["Threads share memory, processes do not", "Processes share memory, threads do not", "Threads are heavyweight, processes are lightweight", "Only processes can execute code"],
    correctAnswer: 0,
    explanation: "Threads within the same process share the same memory space (code, data, heap), while processes have their own separate, independent memory spaces.",
    difficulty: "Medium",
    topic: "processes",
    subject: "os",
  },
  {
    id: 36,
    question: "Which CPU scheduling algorithm can potentially lead to starvation of low-priority processes?",
    options: ["First-Come, First-Served (FCFS)", "Shortest Job First (SJF) (Preemptive)", "Priority Scheduling", "Round Robin"],
    correctAnswer: 2,
    explanation: "In Priority Scheduling, a steady stream of high-priority processes can prevent low-priority processes from ever running (starvation). Aging is a technique to prevent this.",
    difficulty: "Hard",
    topic: "processes",
    subject: "os",
  },

  // ========== OS - MEMORY MANAGEMENT ==========
  {
    id: 37,
    question: "What is 'paging' in memory management?",
    options: ["Swapping entire processes to disk", "A form of external fragmentation", "Dividing logical memory into fixed-size blocks", "A CPU scheduling technique"],
    correctAnswer: 2,
    explanation: "Paging is a memory management scheme that divides logical memory into fixed-size blocks called pages, and physical memory into frames.",
    difficulty: "Easy",
    topic: "memory",
    subject: "os",
  },
  {
    id: 38,
    question: "What is internal fragmentation?",
    options: ["Memory wasted inside an allocated block", "Total memory wasted in the system", "Memory holes between allocated blocks", "Memory allocated to the OS"],
    correctAnswer: 0,
    explanation: "Internal fragmentation occurs when memory is allocated in fixed-size blocks, and the allocated block is larger than the requested memory, wasting space *inside* the block.",
    difficulty: "Medium",
    topic: "memory",
    subject: "os",
  },

  // ========== OS - DEADLOCK ==========
  {
    id: 39,
    question: "Which of these is NOT one of the four necessary conditions for a deadlock?",
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
    correctAnswer: 2,
    explanation: "The four conditions are Mutual Exclusion, Hold and Wait, Circular Wait, and No Preemption. Preemption (taking a resource away) is a way to *prevent* deadlock.",
    difficulty: "Medium",
    topic: "deadlock",
    subject: "os",
  },
  {
    id: 40,
    question: "The Banker's algorithm is used for...?",
    options: ["Deadlock prevention", "Deadlock detection", "Deadlock avoidance", "Deadlock recovery"],
    correctAnswer: 2,
    explanation: "The Banker's algorithm is a deadlock avoidance algorithm. It checks if granting a resource request will lead to a 'safe state' before allocating it.",
    difficulty: "Hard",
    topic: "deadlock",
    subject: "os",
  },
  
  // ========== NETWORKS - OSI MODEL ==========
  {
    id: 41,
    question: "Which layer of the OSI model is responsible for routing and logical addressing (IP addresses)?",
    options: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
    correctAnswer: 2,
    explanation: "The Network Layer (Layer 3) handles routing, logical addressing (like IP addresses), and path determination across networks.",
    difficulty: "Easy",
    topic: "osi-model",
    subject: "networks",
  },
  {
    id: 42,
    question: "Which layer of the OSI model provides reliable, end-to-end communication using TCP?",
    options: ["Session Layer", "Transport Layer", "Network Layer", "Application Layer"],
    correctAnswer: 1,
    explanation: "The Transport Layer (Layer 4) provides services like connection-oriented communication (TCP) and connectionless communication (UDP) for end-to-end data transfer.",
    difficulty: "Medium",
    topic: "osi-model",
    subject: "networks",
  },

  // ========== NETWORKS - TCP/IP ==========
  {
    id: 43,
    question: "What is the primary difference between TCP and UDP?",
    options: ["TCP is connectionless, UDP is connection-oriented", "TCP is faster, UDP is slower", "TCP is reliable, UDP is unreliable", "TCP is for video, UDP is for websites"],
    correctAnswer: 2,
    explanation: "TCP is a reliable, connection-oriented protocol that guarantees delivery and order. UDP is an unreliable, connectionless protocol that prioritizes speed over accuracy.",
    difficulty: "Easy",
    topic: "tcp-ip",
    subject: "networks",
  },
  {
    id: 44,
    question: "What are the steps of the TCP three-way handshake?",
    options: ["SYN, ACK, FIN", "SYN, SYN-ACK, ACK", "REQ, ACK, SYN", "SYN, SYN-ACK, FIN"],
    correctAnswer: 1,
    explanation: "The three-way handshake establishes a TCP connection: 1. Client sends SYN (Synchronize), 2. Server sends SYN-ACK (Synchronize-Acknowledge), 3. Client sends ACK (Acknowledge).",
    difficulty: "Medium",
    topic: "tcp-ip",
    subject: "networks",
  },

  // ========== NETWORKS - SECURITY ==========
  {
    id: 45,
    question: "What is the primary function of a network firewall?",
    options: ["To speed up internet connection", "To monitor and filter network traffic", "To encrypt all data", "To store website data"],
    correctAnswer: 1,
    explanation: "A firewall acts as a barrier, monitoring and filtering incoming and outgoing network traffic based on a set of predefined security rules.",
    difficulty: "Easy",
    topic: "security",
    subject: "networks",
  },
  {
    id: 46,
    question: "What is the key difference between symmetric and asymmetric encryption?",
    options: ["Symmetric uses one key, Asymmetric uses two keys", "Symmetric uses two keys, Asymmetric uses one key", "Symmetric is for networks, Asymmetric is for files", "Symmetric is less secure"],
    correctAnswer: 0,
    explanation: "Symmetric encryption uses a single shared key for both encryption and decryption. Asymmetric encryption (public-key cryptography) uses a pair of keys: a public key and a private key.",
    difficulty: "Medium",
    topic: "security",
    subject: "networks",
  },

  // ========== DATA STRUCTURES - HASH TABLES ==========
  {
    id: 47,
    question: "What is a 'hash collision' in a hash table?",
    options: ["When the hash table is full", "When two different keys produce the same hash value", "When a key is not found", "When the hash function is slow"],
    correctAnswer: 1,
    explanation: "A collision occurs when the hash function maps two or more different keys to the same index (bucket) in the hash table.",
    difficulty: "Easy",
    topic: "hash-tables",
    subject: "data-structures",
  },
  {
    id: 48,
    question: "What is the worst-case time complexity for search in a hash table using separate chaining?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 2,
    explanation: "In the worst case, all keys hash to the same bucket. This degenerates the hash table into a single linked list, and searching it takes O(n) time.",
    difficulty: "Hard",
    topic: "hash-tables",
    subject: "data-structures",
  },
  
  // ========== DATA STRUCTURES - ARRAYS & LINKED LISTS ==========
  {
    id: 49,
    question: "What is the time complexity to access an element in an array by its index?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 0,
    explanation: "Array elements can be accessed directly using their index in constant time, O(1), due to contiguous memory allocation.",
    difficulty: "Easy",
    topic: "arrays",
    subject: "data-structures",
  },
  {
    id: 50,
    question: "What is a primary advantage of a linked list over a dynamic array?",
    options: ["Constant time access (O(1)) to any element", "Efficient insertion/deletion at any position", "Better cache locality", "Uses less memory overhead"],
    correctAnswer: 1,
    explanation: "Linked lists excel at efficient insertion and deletion in the middle of the list (O(1) if you already have a pointer to the node), as it only requires updating pointers, unlike arrays which require shifting elements (O(n)).",
    difficulty: "Medium",
    topic: "linked-lists",
    subject: "data-structures",
  },
];

// ==================== HELPER FUNCTIONS ====================

export const getSubjectById = (subjectId: string): Subject | undefined => {
  return subjects.find(s => s.id === subjectId);
};

export const getTopicsBySubject = (subjectId: string): Topic[] => {
  const subject = getSubjectById(subjectId);
  return subject?.topics || [];
};

export const getQuestionsBySubject = (subjectId: string): Question[] => {
  return questionBank.filter(q => q.subject === subjectId);
};

export const getQuestionsByTopic = (subjectId: string, topicId: string): Question[] => {
  return questionBank.filter(q => q.subject === subjectId && q.topic === topicId);
};

export const getQuestionsByDifficulty = (questions: Question[], difficulty: Difficulty): Question[] => {
  return questions.filter(q => q.difficulty === difficulty);
};

export const getRandomQuestions = (questions: Question[], count: number): Question[] => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
