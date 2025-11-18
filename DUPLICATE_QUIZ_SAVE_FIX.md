# Duplicate Quiz Save Fix

## Problem
When completing a quiz, the questions attempted and correct answers were incrementing by large incorrect numbers (2x, 3x, or more).

## Root Cause
**Two different systems were saving the same quiz to Firebase:**

1. **QuizContext.tsx** - Called `saveQuizAttempt()` when `submitQuiz()` was invoked
2. **GateQuiz.tsx** - Had a useEffect that called `saveQuizResult()` when quiz completed

This resulted in duplicate Firebase writes, causing counts to multiply:
- Total quizzes: +2 instead of +1
- Questions attempted: +20 instead of +10 (for a 10-question quiz)
- Correct answers: +14 instead of +7 (if 7 were correct)

Additionally, the useEffect in GateQuiz was triggered multiple times because it had dependencies (`saveQuizResult`, `toast`) that change on every render.

## Solution

### 1. Added useRef Guard to QuizContext (Primary Fix)
**File: `src/contexts/QuizContext.tsx`**

Added a `useRef` guard to prevent duplicate Firebase saves:

```typescript
// Added useRef import
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

// Added guard ref in QuizProvider
const hasProcessedQuizCompletion = useRef(false);

// Reset guard when new quiz starts
const startQuizWithQuestions = async (...) => {
  hasProcessedQuizCompletion.current = false; // Reset for new quiz
  // ... rest of code
};

// Check guard in submitQuiz before saving
const submitQuiz = async () => {
  // ... existing code
  
  // GUARD: Only process once
  if (user && quizStartTime && !hasProcessedQuizCompletion.current) {
    hasProcessedQuizCompletion.current = true; // Set immediately
    
    // ... Firebase save operations
    await saveQuizAttempt(user.id, {...});
  }
};
```

**Key Features:**
- Guard set **immediately** before async operations to prevent race conditions
- Guard **reset on new quiz start** to allow next quiz to be saved
- Guard **reset on error** to allow retry if save fails
- Console log: "Quiz saved to Firebase successfully" when save completes

### 2. Removed Duplicate Save from GateQuiz.tsx
**File: `src/pages/GateQuiz.tsx`**

Removed the duplicate `saveQuizResult()` call from the useEffect:

```typescript
// BEFORE: Had duplicate Firebase save
if (user) {
  const result = await saveQuizResult({...}); // DUPLICATE!
}

// AFTER: Just a comment
// Note: Firebase save is handled by QuizContext to prevent duplication
// across all quiz pages (GateQuiz, JeeQuiz, etc.)
```

Also removed `saveQuizResult` from the `useFirebaseQuiz` destructuring, keeping only `getRecommendedDifficulty` which is still needed.

### 3. Benefit for All Quiz Pages
Since all quiz pages use `QuizContext`, this fix applies to:
- ✅ GateQuiz
- ✅ JeeQuiz
- ✅ NeetQuiz
- ✅ CatQuiz
- ✅ UpscQuiz

All quiz pages now save exactly **once** through the centralized QuizContext logic.

## How It Works Now

### Quiz Completion Flow:
1. User clicks "Submit Quiz" → calls `submitQuiz()` from QuizContext
2. QuizContext checks guard: `hasProcessedQuizCompletion.current === false`
3. If false, set to true and save to Firebase once
4. If true, skip (prevents duplicate if called again)

### Next Quiz:
1. User starts new quiz → calls `startQuizWithQuestions()`
2. Guard reset: `hasProcessedQuizCompletion.current = false`
3. Ready to save the next quiz completion

## Testing

To verify the fix works:

1. **Start a fresh quiz** with exactly 10 questions
2. **Answer 7 correctly** (3 incorrect)
3. **Submit the quiz**
4. **Check Progress page** - should see:
   - Total Quizzes: +1 (not +2 or more)
   - Questions Attempted: +10 (not +20, +30)
   - Correct Answers: +7 (not +14, +21)
   - Accuracy: Recalculated correctly

5. **Check browser console** - should see:
   - "Quiz saved to Firebase successfully" (only once)
   - NO "Quiz already processed" messages (guard worked on first try)

## Related Fixes

### Previous Fix: Quiz Count Guard in GateQuiz
We previously added a `hasProcessedQuiz` ref in GateQuiz.tsx to prevent that specific useEffect from running multiple times. While this helped with the immediate duplication in GateQuiz, it didn't solve the **dual save system** problem (QuizContext + GateQuiz both saving).

The current fix:
- ✅ Centralizes all quiz saves in QuizContext
- ✅ Uses a single guard for all quiz pages
- ✅ Eliminates the dual save system entirely
- ✅ Simpler, more maintainable architecture

## Files Modified

1. **src/contexts/QuizContext.tsx**
   - Added `useRef` import
   - Added `hasProcessedQuizCompletion` ref
   - Added guard check in `submitQuiz()`
   - Added guard reset in `startQuizWithQuestions()`
   - Added console.log for successful saves
   - Added error handling that resets guard on failure

2. **src/pages/GateQuiz.tsx**
   - Removed duplicate `saveQuizResult()` call
   - Removed `saveQuizResult` from useFirebaseQuiz destructuring
   - Added comment explaining centralized save in QuizContext

## Impact

### Before Fix:
- 1 quiz → +2 total quizzes
- 10 questions → +20 questions attempted
- 7 correct → +14 correct answers
- Accuracy calculation wrong due to multiplied numbers

### After Fix:
- 1 quiz → +1 total quiz ✅
- 10 questions → +10 questions attempted ✅
- 7 correct → +7 correct answers ✅
- Accuracy calculation correct ✅

## Architecture Improvement

**Old Architecture (Problematic):**
```
submitQuiz() → QuizContext saves to Firebase
              ↓
          quizState.isCompleted = true
              ↓
          GateQuiz useEffect detects completion
              ↓
          GateQuiz saves to Firebase AGAIN ❌
```

**New Architecture (Fixed):**
```
submitQuiz() → QuizContext saves to Firebase (with guard)
              ↓
          quizState.isCompleted = true
              ↓
          GateQuiz useEffect detects completion
              ↓
          GateQuiz does NOT save (centralized in QuizContext) ✅
```

## Conclusion

The duplicate save issue was caused by having two different code paths saving the same quiz:
1. QuizContext's `submitQuiz()`
2. GateQuiz's useEffect

By centralizing all quiz saves in QuizContext with a `useRef` guard, we ensure:
- ✅ Only one Firebase save per quiz
- ✅ Works for all quiz pages (not just GateQuiz)
- ✅ Prevents race conditions
- ✅ Handles errors gracefully
- ✅ Simpler, more maintainable code

**Date Fixed:** November 19, 2024
