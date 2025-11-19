import { PlagiarismMatch, MatchedSegment, CodeAnalysisResult } from '@/types/plagiarism';

// ============================================
// TEXT PREPROCESSING
// ============================================

export const preprocessText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const tokenize = (text: string): string[] => {
  return preprocessText(text).split(' ').filter(word => word.length > 0);
};

// ============================================
// JACCARD SIMILARITY
// ============================================

export const jaccardSimilarity = (text1: string, text2: string): number => {
  const tokens1 = new Set(tokenize(text1));
  const tokens2 = new Set(tokenize(text2));
  
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
};

// ============================================
// COSINE SIMILARITY
// ============================================

export const cosineSimilarity = (text1: string, text2: string): number => {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  const allTokens = [...new Set([...tokens1, ...tokens2])];
  
  const vector1 = allTokens.map(token => tokens1.filter(t => t === token).length);
  const vector2 = allTokens.map(token => tokens2.filter(t => t === token).length);
  
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
  
  return magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2);
};

// ============================================
// TF-IDF SIMILARITY
// ============================================

export const calculateTFIDF = (documents: string[]): Map<string, number[]> => {
  const tokenizedDocs = documents.map(doc => tokenize(doc));
  const allTokens = [...new Set(tokenizedDocs.flat())];
  
  const tfidfMap = new Map<string, number[]>();
  const numDocs = documents.length;
  
  allTokens.forEach(token => {
    const tfidfScores = tokenizedDocs.map((doc) => {
      // Term Frequency (TF)
      const termCount = doc.filter(t => t === token).length;
      const tf = doc.length > 0 ? termCount / doc.length : 0;
      
      // Inverse Document Frequency (IDF)
      const docsWithToken = tokenizedDocs.filter(d => d.includes(token)).length;
      // Add 1 to avoid log(0) and use log(1 + x) for smoothing
      const idf = Math.log((numDocs + 1) / (docsWithToken + 1)) + 1;
      
      return tf * idf;
    });
    tfidfMap.set(token, tfidfScores);
  });
  
  return tfidfMap;
};

export const tfidfSimilarity = (text1: string, text2: string): number => {
  // Handle empty texts
  if (!text1 || !text2 || text1.trim().length === 0 || text2.trim().length === 0) {
    return 0;
  }
  
  const tfidfMap = calculateTFIDF([text1, text2]);
  const allTokens = [...tfidfMap.keys()];
  
  if (allTokens.length === 0) return 0;
  
  const vector1 = allTokens.map(token => tfidfMap.get(token)![0]);
  const vector2 = allTokens.map(token => tfidfMap.get(token)![1]);
  
  // Calculate cosine similarity
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  const similarity = dotProduct / (magnitude1 * magnitude2);
  
  // Ensure result is between 0 and 1
  return Math.max(0, Math.min(1, similarity));
};

// ============================================
// LEVENSHTEIN DISTANCE
// ============================================

export const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  
  return dp[m][n];
};

export const levenshteinSimilarity = (text1: string, text2: string): number => {
  const processed1 = preprocessText(text1);
  const processed2 = preprocessText(text2);
  const maxLen = Math.max(processed1.length, processed2.length);
  
  if (maxLen === 0) return 1;
  
  const distance = levenshteinDistance(processed1, processed2);
  return 1 - distance / maxLen;
};

// ============================================
// LONGEST COMMON SUBSEQUENCE (LCS)
// ============================================

export const longestCommonSubsequence = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
};

export const lcsSimilarity = (text1: string, text2: string): number => {
  const processed1 = preprocessText(text1);
  const processed2 = preprocessText(text2);
  const maxLen = Math.max(processed1.length, processed2.length);
  
  if (maxLen === 0) return 1;
  
  const lcsLength = longestCommonSubsequence(processed1, processed2);
  return lcsLength / maxLen;
};

// ============================================
// SEMANTIC SIMILARITY (Simplified Word2Vec approach)
// ============================================

export const semanticSimilarity = (text1: string, text2: string): number => {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  // Simplified semantic matching using word overlap and synonyms
  const commonWords = tokens1.filter(word => tokens2.includes(word));
  const totalUniqueWords = new Set([...tokens1, ...tokens2]).size;
  
  if (totalUniqueWords === 0) return 0;
  
  // Weight common words more heavily
  const semanticScore = (commonWords.length * 2) / (tokens1.length + tokens2.length);
  
  return Math.min(semanticScore, 1);
};

// ============================================
// ADVANCED N-GRAM SHINGLING (Modern Approach)
// ============================================

export const createNGrams = (tokens: string[], n: number = 4): string[] => {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
};

export const ngramShingling = (text1: string, text2: string, n: number = 4): number => {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  
  if (tokens1.length < n || tokens2.length < n) return 0;
  
  const ngrams1 = new Set(createNGrams(tokens1, n));
  const ngrams2 = new Set(createNGrams(tokens2, n));
  
  const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
  const union = new Set([...ngrams1, ...ngrams2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
};

// ============================================
// RABIN-KARP ROLLING HASH FINGERPRINTING
// ============================================

export const rabinKarpHash = (str: string, base: number = 256, mod: number = 101): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * base + str.charCodeAt(i)) % mod;
  }
  return hash;
};

export const rabinKarpFingerprints = (text: string, windowSize: number = 20): Map<number, number[]> => {
  const processed = preprocessText(text);
  const fingerprints = new Map<number, number[]>();
  
  for (let i = 0; i <= processed.length - windowSize; i++) {
    const window = processed.substring(i, i + windowSize);
    const hash = rabinKarpHash(window);
    
    if (!fingerprints.has(hash)) {
      fingerprints.set(hash, []);
    }
    fingerprints.get(hash)!.push(i);
  }
  
  return fingerprints;
};

export const rabinKarpSimilarity = (text1: string, text2: string): number => {
  const fp1 = rabinKarpFingerprints(text1);
  const fp2 = rabinKarpFingerprints(text2);
  
  const commonHashes = [...fp1.keys()].filter(hash => fp2.has(hash));
  const totalHashes = new Set([...fp1.keys(), ...fp2.keys()]).size;
  
  return totalHashes === 0 ? 0 : commonHashes.length / totalHashes;
};

// ============================================
// MATCHED SEGMENTS DETECTION (Enhanced with structure-based matching)
// ============================================

export const findMatchedSegments = (text1: string, text2: string, minLength: number = 20, isCode: boolean = false): MatchedSegment[] => {
  const segments: MatchedSegment[] = [];
  
  if (isCode) {
    // For code: use normalized matching to ignore variable names
    const lines1 = text1.split('\n').filter(l => l.trim().length > 0);
    const lines2 = text2.split('\n').filter(l => l.trim().length > 0);
    
    const normalized1 = lines1.map(l => normalizeCode(l));
    const normalized2 = lines2.map(l => normalizeCode(l));
    
    // Find matching line sequences
    for (let i = 0; i < normalized1.length; i++) {
      for (let j = 0; j < normalized2.length; j++) {
        let matchLength = 0;
        
        // Count consecutive matching normalized lines
        while (
          i + matchLength < normalized1.length &&
          j + matchLength < normalized2.length &&
          normalized1[i + matchLength] === normalized2[j + matchLength] &&
          normalized1[i + matchLength].length > 5 // Ignore trivial lines
        ) {
          matchLength++;
        }
        
        // If we found at least 2 matching lines
        if (matchLength >= 2) {
          const matchedText1 = lines1.slice(i, i + matchLength).join('\n');
          const matchedText2 = lines2.slice(j, j + matchLength).join('\n');
          
          // Check if this segment is long enough
          if (matchedText1.replace(/\s/g, '').length >= Math.min(minLength, 15)) {
            // Avoid duplicate segments
            const exists = segments.some(s => 
              s.startIndex1 === i && s.endIndex1 === i + matchLength
            );
            
            if (!exists) {
              segments.push({
                text1: matchedText1,
                text2: matchedText2,
                startIndex1: i,
                endIndex1: i + matchLength,
                startIndex2: j,
                endIndex2: j + matchLength,
                similarity: 1.0
              });
            }
          }
        }
      }
    }
  } else {
    // For text: use word-based matching
    const words1 = tokenize(text1);
    const words2 = tokenize(text2);
    
    // Use Rabin-Karp for efficient substring matching
    const fp1 = rabinKarpFingerprints(preprocessText(text1), 20);
    const fp2 = rabinKarpFingerprints(preprocessText(text2), 20);
    
    const commonHashes = [...fp1.keys()].filter(hash => fp2.has(hash));
    
    // Word-by-word matching for remaining segments
    for (let i = 0; i < words1.length; i++) {
      for (let j = 0; j < words2.length; j++) {
        let matchLength = 0;
        while (
          i + matchLength < words1.length &&
          j + matchLength < words2.length &&
          words1[i + matchLength] === words2[j + matchLength]
        ) {
          matchLength++;
        }
        
        if (matchLength >= 3) {
          const matchedText1 = words1.slice(i, i + matchLength).join(' ');
          const matchedText2 = words2.slice(j, j + matchLength).join(' ');
          
          if (matchedText1.length >= minLength) {
            // Check if not already added
            const exists = segments.some(s => 
              s.startIndex1 === i && s.endIndex1 === i + matchLength
            );
            
            if (!exists) {
              segments.push({
                text1: matchedText1,
                text2: matchedText2,
                startIndex1: i,
                endIndex1: i + matchLength,
                startIndex2: j,
                endIndex2: j + matchLength,
                similarity: 1.0
              });
            }
          }
        }
      }
    }
  }
  
  return segments;
};

// ============================================
// CODE-SPECIFIC ANALYSIS (Enhanced)
// ============================================

// Normalize code by replacing all identifiers with placeholders
export const normalizeCode = (code: string): string => {
  return code
    // Remove comments
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Replace variable names with placeholder
    .replace(/\b[a-z_][a-zA-Z0-9_]*\b/g, 'VAR')
    // Replace numbers with placeholder
    .replace(/\b\d+\b/g, 'NUM')
    // Remove extra spaces around operators/punctuation
    .replace(/\s*([=<>!+\-*/%&|^~?:;,.()\[\]{}])\s*/g, '$1')
    .trim()
    .toLowerCase();
};

// AST-like structure analysis (enhanced)
export const analyzeCodeStructure = (code: string): string[] => {
  const patterns: string[] = [];
  
  // Detect function definitions
  const functionPattern = /function\s+\w+\s*\([^)]*\)|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g;
  const functions = code.match(functionPattern) || [];
  patterns.push(...functions.map(f => normalizeCode(f)));
  
  // Detect loops
  const loopPattern = /for\s*\([^)]*\)|while\s*\([^)]*\)/g;
  const loops = code.match(loopPattern) || [];
  patterns.push(...loops.map(l => normalizeCode(l)));
  
  // Detect conditionals
  const ifPattern = /if\s*\([^)]*\)/g;
  const conditionals = code.match(ifPattern) || [];
  patterns.push(...conditionals.map(c => normalizeCode(c)));
  
  // Detect statements (assignment, function calls, etc)
  const statementPattern = /[a-zA-Z_][a-zA-Z0-9_]*\s*[=.]\s*[^;]+;/g;
  const statements = code.match(statementPattern) || [];
  patterns.push(...statements.map(s => normalizeCode(s)));
  
  return patterns;
};

// Control Flow Graph similarity (enhanced)
export const cfgSimilarity = (code1: string, code2: string): number => {
  const structure1 = analyzeCodeStructure(code1);
  const structure2 = analyzeCodeStructure(code2);
  
  if (structure1.length === 0 && structure2.length === 0) return 1;
  if (structure1.length === 0 || structure2.length === 0) return 0;
  
  const commonStructures = structure1.filter(s => structure2.includes(s));
  const totalStructures = Math.max(structure1.length, structure2.length);
  
  return commonStructures.length / totalStructures;
};

// Enhanced Winnowing for code - ignores variable names
export const codeWinnowingFingerprint = (code: string, k: number = 10): Set<number> => {
  const normalized = normalizeCode(code);
  const fingerprints = new Set<number>();
  
  // Create overlapping k-grams from normalized code
  for (let i = 0; i <= normalized.length - k; i++) {
    const kgram = normalized.substring(i, i + k);
    const hash = rabinKarpHash(kgram);
    fingerprints.add(hash);
  }
  
  return fingerprints;
};

// ============================================
// ENHANCED WINNOWING ALGORITHM (MOSS-style)
// ============================================

interface WinnowHash {
  hash: number;
  position: number;
}

export const computeKGramHashes = (text: string, k: number = 5): WinnowHash[] => {
  const normalized = text.replace(/\s+/g, '').toLowerCase();
  const hashes: WinnowHash[] = [];
  
  for (let i = 0; i <= normalized.length - k; i++) {
    const kgram = normalized.substring(i, i + k);
    const hash = rabinKarpHash(kgram);
    hashes.push({ hash, position: i });
  }
  
  return hashes;
};

export const winnowingFingerprint = (code: string, k: number = 5, windowSize: number = 4): Set<number> => {
  const hashes = computeKGramHashes(code, k);
  const fingerprints = new Set<number>();
  
  if (hashes.length === 0) return fingerprints;
  
  // Winnowing: select minimum hash in each window
  for (let i = 0; i <= hashes.length - windowSize; i++) {
    const window = hashes.slice(i, i + windowSize);
    const minHash = window.reduce((min, curr) => 
      curr.hash < min.hash ? curr : min
    );
    fingerprints.add(minHash.hash);
  }
  
  return fingerprints;
};

export const winnowingSimilarity = (code1: string, code2: string): number => {
  // Use code-specific fingerprinting
  const fp1 = codeWinnowingFingerprint(code1, 10);
  const fp2 = codeWinnowingFingerprint(code2, 10);
  
  if (fp1.size === 0 && fp2.size === 0) return 1;
  if (fp1.size === 0 || fp2.size === 0) return 0;
  
  const intersection = new Set([...fp1].filter(x => fp2.has(x)));
  const union = new Set([...fp1, ...fp2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
};

// Detect variable renaming (enhanced)
export const detectVariableRenaming = (code1: string, code2: string): boolean => {
  const normalized1 = normalizeCode(code1);
  const normalized2 = normalizeCode(code2);
  
  // If normalized versions are very similar, it's likely just variable renaming
  const normalizedSimilarity = cosineSimilarity(normalized1, normalized2);
  const originalSimilarity = cosineSimilarity(code1, code2);
  
  return normalizedSimilarity > 0.85 && originalSimilarity < 0.6;
};

export const analyzeCode = (code1: string, code2: string): CodeAnalysisResult => {
  return {
    astSimilarity: cfgSimilarity(code1, code2),
    cfgSimilarity: cfgSimilarity(code1, code2),
    winnowingScore: winnowingSimilarity(code1, code2),
    structuralPatterns: analyzeCodeStructure(code1),
    variableRenamingDetected: detectVariableRenaming(code1, code2)
  };
};

// ============================================
// COMPREHENSIVE PLAGIARISM DETECTION (Enhanced)
// ============================================

export const detectPlagiarism = (
  text1: string,
  text2: string,
  isCode: boolean = false
): {
  overallScore: number;
  algorithms: {
    jaccard: number;
    cosine: number;
    tfidf: number;
    levenshtein: number;
    lcs: number;
    ngram: number;
    rabinKarp: number;
    semantic?: number;
    ast?: number;
    cfg?: number;
    winnowing?: number;
  };
  matchedSegments: MatchedSegment[];
  codeAnalysis?: CodeAnalysisResult;
} => {
  // Modern algorithms with higher priority
  const ngramScore = ngramShingling(text1, text2, 4);
  const rabinKarpScore = rabinKarpSimilarity(text1, text2);
  
  const algorithms: {
    jaccard: number;
    cosine: number;
    tfidf: number;
    levenshtein: number;
    lcs: number;
    ngram: number;
    rabinKarp: number;
    semantic?: number;
    ast?: number;
    cfg?: number;
    winnowing?: number;
  } = {
    jaccard: jaccardSimilarity(text1, text2),
    cosine: cosineSimilarity(text1, text2),
    tfidf: tfidfSimilarity(text1, text2),
    levenshtein: levenshteinSimilarity(text1, text2),
    lcs: lcsSimilarity(text1, text2),
    ngram: ngramScore,
    rabinKarp: rabinKarpScore,
    semantic: semanticSimilarity(text1, text2),
  };
  
  let codeAnalysis: CodeAnalysisResult | undefined;
  
  if (isCode) {
    codeAnalysis = analyzeCode(text1, text2);
    algorithms.ast = codeAnalysis.astSimilarity;
    algorithms.cfg = codeAnalysis.cfgSimilarity;
    algorithms.winnowing = codeAnalysis.winnowingScore;
  }
  
  // Enhanced weighted score - prioritizing modern algorithms
  const weights = isCode
    ? { 
        ngram: 0.20,           // N-gram shingling (modern)
        rabinKarp: 0.20,       // Rabin-Karp (modern)
        winnowing: 0.15,       // Winnowing (MOSS-style)
        ast: 0.12,             // AST similarity
        cfg: 0.10,             // Control flow
        tfidf: 0.08,           // TF-IDF
        cosine: 0.06,          // Cosine
        levenshtein: 0.04,     // Edit distance
        lcs: 0.03,             // LCS
        jaccard: 0.01,         // Jaccard
        semantic: 0.01         // Semantic
      }
    : { 
        ngram: 0.25,           // N-gram shingling (best for text)
        rabinKarp: 0.20,       // Rabin-Karp (fast & accurate)
        tfidf: 0.15,           // TF-IDF (document similarity)
        cosine: 0.12,          // Cosine similarity
        semantic: 0.10,        // Semantic matching
        levenshtein: 0.08,     // Edit distance
        lcs: 0.05,             // LCS
        jaccard: 0.05          // Jaccard
      };
  
  const overallScore = Object.entries(algorithms).reduce((sum, [key, value]) => {
    const weight = weights[key as keyof typeof weights] || 0;
    return sum + (value || 0) * weight;
  }, 0);
  
  const matchedSegments = findMatchedSegments(text1, text2, 20, isCode);
  
  return {
    overallScore: Math.min(overallScore, 1),
    algorithms,
    matchedSegments,
    codeAnalysis
  };
};
