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
  
  allTokens.forEach(token => {
    const tfidfScores = tokenizedDocs.map((doc, docIndex) => {
      const tf = doc.filter(t => t === token).length / doc.length;
      const docsWithToken = tokenizedDocs.filter(d => d.includes(token)).length;
      const idf = Math.log(documents.length / (docsWithToken || 1));
      return tf * idf;
    });
    tfidfMap.set(token, tfidfScores);
  });
  
  return tfidfMap;
};

export const tfidfSimilarity = (text1: string, text2: string): number => {
  const tfidfMap = calculateTFIDF([text1, text2]);
  const allTokens = [...tfidfMap.keys()];
  
  const vector1 = allTokens.map(token => tfidfMap.get(token)![0]);
  const vector2 = allTokens.map(token => tfidfMap.get(token)![1]);
  
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
  
  return magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2);
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
// MATCHED SEGMENTS DETECTION
// ============================================

export const findMatchedSegments = (text1: string, text2: string, minLength: number = 20): MatchedSegment[] => {
  const segments: MatchedSegment[] = [];
  const words1 = tokenize(text1);
  const words2 = tokenize(text2);
  
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
      
      if (matchLength >= 3) { // At least 3 consecutive words
        const matchedText1 = words1.slice(i, i + matchLength).join(' ');
        const matchedText2 = words2.slice(j, j + matchLength).join(' ');
        
        if (matchedText1.length >= minLength) {
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
  
  return segments;
};

// ============================================
// CODE-SPECIFIC ANALYSIS
// ============================================

// AST-like structure analysis (simplified)
export const analyzeCodeStructure = (code: string): string[] => {
  const patterns: string[] = [];
  
  // Detect function definitions
  const functionPattern = /function\s+\w+\s*\([^)]*\)|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g;
  const functions = code.match(functionPattern) || [];
  patterns.push(...functions.map(f => f.replace(/\w+/g, 'VAR')));
  
  // Detect loops
  const loopPattern = /for\s*\([^)]*\)|while\s*\([^)]*\)/g;
  const loops = code.match(loopPattern) || [];
  patterns.push(...loops.map(l => l.replace(/\w+/g, 'VAR')));
  
  // Detect conditionals
  const ifPattern = /if\s*\([^)]*\)/g;
  const conditionals = code.match(ifPattern) || [];
  patterns.push(...conditionals.map(c => c.replace(/\w+/g, 'VAR')));
  
  return patterns;
};

// Control Flow Graph similarity (simplified)
export const cfgSimilarity = (code1: string, code2: string): number => {
  const structure1 = analyzeCodeStructure(code1);
  const structure2 = analyzeCodeStructure(code2);
  
  const commonStructures = structure1.filter(s => structure2.includes(s));
  const totalStructures = new Set([...structure1, ...structure2]).size;
  
  return totalStructures === 0 ? 0 : commonStructures.length / totalStructures;
};

// Winnowing fingerprinting for code plagiarism
export const winnowingFingerprint = (code: string, k: number = 5): Set<string> => {
  const normalized = code.replace(/\s+/g, '').toLowerCase();
  const fingerprints = new Set<string>();
  
  for (let i = 0; i <= normalized.length - k; i++) {
    const kgram = normalized.substring(i, i + k);
    fingerprints.add(kgram);
  }
  
  return fingerprints;
};

export const winnowingSimilarity = (code1: string, code2: string): number => {
  const fp1 = winnowingFingerprint(code1);
  const fp2 = winnowingFingerprint(code2);
  
  const intersection = new Set([...fp1].filter(x => fp2.has(x)));
  const union = new Set([...fp1, ...fp2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
};

// Detect variable renaming
export const detectVariableRenaming = (code1: string, code2: string): boolean => {
  const structure1 = analyzeCodeStructure(code1);
  const structure2 = analyzeCodeStructure(code2);
  
  // If structures are very similar but original code is different, likely renamed
  const structuralSimilarity = cfgSimilarity(code1, code2);
  const textSimilarity = cosineSimilarity(code1, code2);
  
  return structuralSimilarity > 0.8 && textSimilarity < 0.5;
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
// COMPREHENSIVE PLAGIARISM DETECTION
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
    semantic?: number;
    ast?: number;
    cfg?: number;
    winnowing?: number;
  };
  matchedSegments: MatchedSegment[];
  codeAnalysis?: CodeAnalysisResult;
} => {
  const algorithms: {
    jaccard: number;
    cosine: number;
    tfidf: number;
    levenshtein: number;
    lcs: number;
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
    semantic: semanticSimilarity(text1, text2),
  };
  
  let codeAnalysis: CodeAnalysisResult | undefined;
  
  if (isCode) {
    codeAnalysis = analyzeCode(text1, text2);
    algorithms.ast = codeAnalysis.astSimilarity;
    algorithms.cfg = codeAnalysis.cfgSimilarity;
    algorithms.winnowing = codeAnalysis.winnowingScore;
  }
  
  // Calculate weighted overall score
  const weights = isCode
    ? { jaccard: 0.1, cosine: 0.1, tfidf: 0.1, levenshtein: 0.1, lcs: 0.1, semantic: 0.1, ast: 0.15, cfg: 0.15, winnowing: 0.1 }
    : { jaccard: 0.15, cosine: 0.2, tfidf: 0.2, levenshtein: 0.15, lcs: 0.15, semantic: 0.15 };
  
  const overallScore = Object.entries(algorithms).reduce((sum, [key, value]) => {
    const weight = weights[key as keyof typeof weights] || 0;
    return sum + (value || 0) * weight;
  }, 0);
  
  const matchedSegments = findMatchedSegments(text1, text2);
  
  return {
    overallScore: Math.min(overallScore, 1),
    algorithms,
    matchedSegments,
    codeAnalysis
  };
};
