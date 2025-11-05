# Firebase Setup Guide

## Quick Start

Follow these steps to enable the Firebase quiz system in your application.

## Step 1: Install Firebase Dependencies

The Firebase SDK should already be installed. If not, run:

```bash
npm install firebase
```

## Step 2: Configure Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `minor-a7beb`
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Quiz attempts - users can only access their own attempts
    match /quizAttempts/{attemptId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Optional: Leaderboard (read-only for all authenticated users)
    match /leaderboard/{entry} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can write
    }
  }
}
```

5. Click **Publish**

## Step 3: Create Firestore Indexes (Optional but Recommended)

For better query performance, create these indexes:

1. Go to **Firestore Database** → **Indexes**
2. Click **Create Index**

### Index 1: Quiz Attempts by User and Timestamp
- Collection ID: `quizAttempts`
- Fields to index:
  - `userId` (Ascending)
  - `timestamp` (Descending)
- Query scope: Collection

### Index 2: Quiz Attempts by User, Subject, and Timestamp
- Collection ID: `quizAttempts`
- Fields to index:
  - `userId` (Ascending)
  - `subject` (Ascending)
  - `timestamp` (Descending)
- Query scope: Collection

## Step 4: Test the System

### Test 1: User Registration
1. Create a new account or login
2. Check Firebase Console → Authentication
3. Verify user appears in the list

### Test 2: Initial Test Flow
1. Navigate to GATE Quiz section
2. Select a subject you haven't tested before
3. You should see the **Initial Assessment Required** card
4. Click "Take Initial Assessment Test"
5. Complete the 12-question test
6. Check Firebase Console → Firestore Database → `users` collection
7. Verify your user document was created with initial data

### Test 3: Quiz Attempt Storage
1. Take any quiz
2. Complete and submit it
3. Check Firebase Console → Firestore Database → `quizAttempts` collection
4. Verify the quiz attempt was saved with all details

### Test 4: Adaptive Difficulty
1. After completing initial test, start a new quiz
2. You should see the **Personalized Difficulty Mix** card
3. Verify the difficulty percentages match your category:
   - Good: 10% Easy, 30% Medium, 60% Hard
   - Average: 30% Easy, 50% Medium, 20% Hard
   - Bad: 60% Easy, 30% Medium, 10% Hard

### Test 5: Category Updates
1. Take multiple quizzes with varying performance
2. Check your user profile in Firestore
3. Verify `currentCategory` updates based on performance
4. Verify `currentRating` changes appropriately

## Step 5: Monitor Usage

### Check Firestore Usage
1. Go to Firebase Console → Firestore Database → Usage
2. Monitor:
   - Document reads
   - Document writes
   - Storage size

### Check Authentication
1. Go to Firebase Console → Authentication → Users
2. Verify users are being created correctly

## Troubleshooting

### Issue: "Permission denied" errors
**Solution**: 
- Verify Firestore security rules are published
- Ensure user is authenticated before accessing Firestore
- Check that userId matches authenticated user's UID

### Issue: Quiz not saving to Firebase
**Solution**:
- Check browser console for errors
- Verify Firebase configuration in `src/firebase.js`
- Ensure user is logged in
- Check network tab for failed requests

### Issue: Initial test not showing
**Solution**:
- Clear browser cache and localStorage
- Verify user is authenticated
- Check if `hasCompletedInitialTest` is false in user profile
- Ensure subject hasn't been attempted before

### Issue: Category not updating
**Solution**:
- Complete at least one quiz after initial test
- Check Firestore rules allow updates
- Verify `updateUserProfileAfterQuiz` is being called
- Check browser console for errors

### Issue: Recommended difficulty not displaying
**Solution**:
- Ensure initial test is completed
- Verify user profile exists in Firestore
- Check that `getRecommendedDifficulty` returns valid data
- Ensure user is authenticated

## Data Verification

### Verify User Profile Structure
Go to Firestore → `users` → [userId] and check for:
```json
{
  "userId": "...",
  "email": "...",
  "name": "...",
  "totalQuizzes": 0,
  "currentCategory": "average",
  "currentRating": 1000,
  "hasCompletedInitialTest": false,
  "subjectPerformance": {}
}
```

### Verify Quiz Attempt Structure
Go to Firestore → `quizAttempts` → [attemptId] and check for:
```json
{
  "userId": "...",
  "examType": "gate",
  "subject": "algorithms",
  "score": 8,
  "totalQuestions": 12,
  "accuracy": 66.67,
  "difficulty": "medium",
  "categoryAtTime": "average",
  "ratingChange": 15,
  "timestamp": "...",
  "answers": [...]
}
```

## Performance Optimization

### Enable Persistence (Optional)
Add to `src/firebase.js`:
```javascript
import { enableIndexedDbPersistence } from "firebase/firestore";

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.log('Multiple tabs open');
  } else if (err.code == 'unimplemented') {
    console.log('Browser does not support persistence');
  }
});
```

### Batch Writes (For Future Enhancement)
For multiple updates, use batch writes to reduce costs:
```javascript
import { writeBatch } from "firebase/firestore";

const batch = writeBatch(db);
// Add multiple operations
await batch.commit();
```

## Cost Estimation

### Free Tier Limits (Spark Plan)
- **Stored data**: 1 GiB
- **Document reads**: 50,000/day
- **Document writes**: 20,000/day
- **Document deletes**: 20,000/day

### Estimated Usage per User per Day
- Initial test: ~5 writes (profile + attempt)
- Regular quiz: ~2 writes (profile update + attempt)
- Profile reads: ~3 reads per session
- Quiz history: ~1 read per view

**For 100 active users/day**: ~700 writes, ~300 reads (well within free tier)

## Security Best Practices

1. ✅ Never expose Firebase config in public repos (already in .gitignore)
2. ✅ Use security rules to restrict access
3. ✅ Validate data on client and server
4. ✅ Use authentication for all Firestore operations
5. ✅ Monitor usage regularly
6. ✅ Set up billing alerts

## Next Steps

1. ✅ Complete Firebase setup
2. ✅ Test all features
3. ✅ Monitor initial usage
4. [ ] Add error tracking (Sentry/Firebase Crashlytics)
5. [ ] Implement analytics
6. [ ] Add backup strategy
7. [ ] Plan for scaling

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase Console](https://console.firebase.google.com/)

## Contact

For issues or questions about the Firebase implementation, refer to:
- `FIREBASE_QUIZ_SYSTEM.md` - Complete system documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- Project repository issues section
