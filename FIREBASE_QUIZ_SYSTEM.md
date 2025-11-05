# Firebase Quiz System Documentation

## Overview

This document describes the comprehensive Firebase-based quiz tracking system that stores user performance, categorizes students, and adapts difficulty based on their results.

## Features

### 1. **Initial Test Assessment**
- When a student takes a test for the first time in any subject, they are prompted to take an **Initial Assessment Test**
- This test contains 12 questions with mixed difficulty (Easy, Medium, Hard)
- Based on performance, students are categorized into:
  - **Good** (75%+ accuracy): Advanced learners
  - **Average** (50-74% accuracy): Intermediate learners
  - **Bad/Needs Improvement** (<50% accuracy): Beginners

### 2. **Adaptive Difficulty System**
After the initial test, subsequent quizzes are tailored based on:
- **Student Category**: Good, Average, or Bad
- **Recent Performance**: Last 5 quiz attempts
- **Subject-specific Performance**: Each subject has its own category

#### Difficulty Distribution by Category:

**Good Students:**
- Easy: 10%
- Medium: 30%
- Hard: 60%

**Average Students:**
- Easy: 30%
- Medium: 50%
- Hard: 20%

**Bad/Needs Improvement:**
- Easy: 60%
- Medium: 30%
- Hard: 10%

### 3. **Dynamic Rating System**
- Each student has an overall rating and subject-specific ratings
- Initial ratings based on category:
  - Good: 1500
  - Average: 1000
  - Bad: 600

#### Rating Changes:
- **Excellent Performance (90%+)**: +30 to +45 points (difficulty-based)
- **Good Performance (80-89%)**: +24 to +36 points
- **Average Performance (70-79%)**: +20 to +30 points
- **Below Average (60-69%)**: +10 to +15 points
- **Poor Performance (40-59%)**: -10 to -20 points
- **Very Poor (<40%)**: -20 to -30 points

### 4. **Comprehensive Data Storage**

#### User Profile (Firestore: `users` collection)
```typescript
{
  userId: string,
  email: string,
  name: string,
  totalQuizzes: number,
  totalQuestionsAttempted: number,
  totalCorrectAnswers: number,
  overallAccuracy: number,
  currentCategory: "good" | "average" | "bad",
  currentRating: number,
  peakRating: number,
  currentStreak: number,
  longestStreak: number,
  totalBadges: number,
  subjectPerformance: {
    [subject: string]: {
      category: "good" | "average" | "bad",
      rating: number,
      quizzesTaken: number,
      accuracy: number,
      lastAttempted: string,
      totalQuestions: number,
      correctAnswers: number
    }
  },
  hasCompletedInitialTest: boolean,
  initialTestDate?: string,
  initialTestScore?: number,
  initialCategory?: "good" | "average" | "bad"
}
```

#### Quiz Attempts (Firestore: `quizAttempts` collection)
```typescript
{
  userId: string,
  examType: string, // 'gate', 'jee', 'cat', etc.
  subject: string,
  quizType: "topic" | "subject" | "full",
  topic?: string,
  score: number,
  totalQuestions: number,
  accuracy: number,
  difficulty: "easy" | "medium" | "hard" | "mixed",
  timeTaken: number, // in seconds
  answers: Array<{
    questionId: number,
    selectedAnswer: number | null,
    correctAnswer: number,
    isCorrect: boolean,
    timeTaken: number,
    difficulty: string
  }>,
  timestamp: Timestamp,
  ratingChange: number,
  categoryAtTime: "good" | "average" | "bad"
}
```

## Implementation Guide

### 1. Setup Firebase

The Firebase configuration is already set up in `src/firebase.js`:
```javascript
import { getFirestore } from "firebase/firestore";
export const db = getFirestore(app);
```

### 2. Using the Firebase Quiz Hook

```typescript
import { useFirebaseQuiz } from "@/hooks/useFirebaseQuiz";

const MyComponent = () => {
  const {
    userProfile,           // Current user's profile
    loading,               // Loading state
    quizHistory,          // Recent quiz attempts
    checkNeedsInitialTest, // Check if initial test needed
    getRecommendedDifficulty, // Get adaptive difficulty
    saveQuizResult,       // Save quiz to Firebase
    getSubjectCategory,   // Get category for subject
    getSubjectRating,     // Get rating for subject
    refreshProfile        // Refresh data from Firebase
  } = useFirebaseQuiz();
  
  // Your component logic
};
```

### 3. Quiz Flow

#### Step 1: Check for Initial Test
```typescript
const needsTest = await checkNeedsInitialTest('algorithms');
if (needsTest) {
  // Show initial test prompt
  // User takes mixed difficulty test
}
```

#### Step 2: Get Recommended Difficulty
```typescript
const difficulty = await getRecommendedDifficulty('algorithms');
// Returns: { easy: 0.3, medium: 0.5, hard: 0.2 }
```

#### Step 3: Take Quiz
User completes the quiz with adaptive questions.

#### Step 4: Save Results
```typescript
const result = await saveQuizResult({
  examType: 'gate',
  subject: 'algorithms',
  quizType: 'subject',
  score: 8,
  totalQuestions: 12,
  difficulty: 'medium',
  timeTaken: 720, // 12 minutes
  answers: [...] // Detailed answer data
});

// Result contains:
// - attemptId: string
// - category: "good" | "average" | "bad"
// - ratingChange: number
// - newRating: number
```

### 4. Displaying User Stats

The QuizStart component automatically displays:
- Current category with color-coded badge
- Current rating
- Streak count (synced with Firebase)
- Total badges earned

For authenticated users, it shows Firebase data. For non-authenticated users, it falls back to localStorage.

## UI Components

### Initial Test Prompt
When a user needs an initial test, a prominent card is displayed:
- Explains the purpose of the initial test
- Shows what to expect (12 mixed difficulty questions)
- Explains the categorization system
- Provides a clear CTA button

### Recommended Difficulty Display
After completing the initial test, users see:
- Their assigned category
- Personalized difficulty distribution
- Visual breakdown (Easy/Medium/Hard percentages)

## Benefits

1. **Personalized Learning**: Each student gets questions matched to their skill level
2. **Progress Tracking**: Complete history of all quiz attempts
3. **Motivation**: Clear progression through categories and ratings
4. **Data-Driven**: Decisions based on actual performance data
5. **Subject-Specific**: Different skill levels for different subjects
6. **Cloud Sync**: Data accessible across devices

## Firestore Security Rules

Add these rules to your Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own quiz attempts
    match /quizAttempts/{attemptId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Migration from localStorage

The system maintains backward compatibility:
- Existing localStorage data continues to work
- Firebase data takes precedence when available
- Gradual migration as users take new quizzes

## Future Enhancements

1. **Leaderboards**: Compare ratings with other students
2. **Analytics Dashboard**: Detailed performance insights
3. **Weak Topic Identification**: AI-powered recommendations
4. **Study Plans**: Personalized study schedules
5. **Peer Comparison**: Anonymous performance benchmarking
6. **Achievement System**: Unlock rewards based on milestones

## Troubleshooting

### Quiz not saving to Firebase
- Check if user is authenticated
- Verify Firebase configuration
- Check browser console for errors
- Ensure Firestore rules are correctly set

### Category not updating
- Verify at least one quiz has been completed
- Check if initial test was completed
- Refresh the profile using `refreshProfile()`

### Difficulty not adapting
- Ensure user has completed initial test
- Check if recent performance data exists
- Verify category is correctly assigned

## API Reference

See `src/lib/firebaseUserService.ts` for complete API documentation.

## Support

For issues or questions, contact the development team or check the project repository.
