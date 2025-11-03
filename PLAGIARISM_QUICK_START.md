# Plagiarism Detection System - Quick Start Guide

## 🚀 Getting Started in 3 Minutes

### Step 1: Access the System
1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:8080/plagiarism`
3. You'll see the role selection screen

### Step 2: Choose Your Role

#### Option A: Teacher Mode
1. Click **"Continue as Teacher"**
2. You'll be logged in as: **Dr. Sarah Johnson**

#### Option B: Student Mode
1. Click **"Continue as Student"**
2. You'll be logged in as: **Alex Thompson**

---

## 👨‍🏫 Teacher Quick Start

### Create Your First Assignment
1. Click **"Create Assignment"** button
2. Fill in the form:
   ```
   Title: "My First Assignment"
   Description: "Test assignment for plagiarism detection"
   Type: Text/Essay
   Max Score: 100
   Due Date: [Select a future date]
   Instructions: "Write about your favorite topic"
   ```
3. Click **"Create Assignment"**

### View Submissions
1. Click on your assignment card
2. Switch to **"Submissions"** tab
3. View all student submissions

### Run Plagiarism Analysis
1. Go to **"Plagiarism Analysis"** tab
2. Click **"Run Analysis"** (needs at least 2 submissions)
3. Wait 1-2 seconds for analysis to complete
4. View results:
   - Overall statistics
   - Flagged matches (red badges)
   - Individual similarity scores

### View Detailed Comparison
1. Click **"Details"** on any match
2. See side-by-side comparison
3. Highlighted segments show matched text
4. View all algorithm scores

### Download Report
1. Click **"Download Report"** button
2. PDF will be generated and downloaded
3. Contains full analysis with statistics

---

## 👨‍🎓 Student Quick Start

### View Available Assignments
1. Dashboard shows three categories:
   - **Pending**: Not yet submitted
   - **Submitted**: Already submitted
   - **Overdue**: Past deadline

### Submit an Assignment

#### For Text/Code Assignments:
1. Click **"View Assignment"** on any card
2. Read the instructions
3. Type your answer in the text area
4. Click **"Submit Assignment"**
5. ✅ Submission confirmed!

#### For PDF/Image Assignments:
1. Click **"View Assignment"** on any card
2. Read the instructions
3. Click the **upload area** or drag and drop files
4. Upload your PDF or image files (max 5MB each)
5. Optionally add notes in the text area
6. Click **"Submit Assignment"**
7. ✅ Submission confirmed!

### Update Your Submission
1. Click on a submitted assignment
2. Edit your answer
3. Click **"Update Submission"**
4. Can update until the deadline

---

## 🧪 Testing the System

### Quick Test Scenario

#### As Teacher:
1. Create a text assignment
2. Switch to student mode (refresh and select Student)

#### As Student:
3. Submit to the assignment with text: "The quick brown fox jumps over the lazy dog"
4. Switch back to teacher mode

#### As Teacher (Again):
5. Create another student submission manually or switch roles again
6. Submit similar text: "The quick brown fox leaps over the lazy dog"
7. Go back to teacher mode
8. Run plagiarism analysis
9. See high similarity score (80%+)

---

## 📊 Understanding Results

### Similarity Scores
- **0-39%**: ✅ Low risk (Green)
- **40-59%**: ⚠️ Medium risk (Yellow)
- **60-100%**: 🚨 High risk (Red - Flagged)

### Algorithm Breakdown
Each match shows scores from:
- **Jaccard**: Word set overlap
- **Cosine**: Vector similarity
- **TF-IDF**: Term importance
- **Levenshtein**: Edit distance
- **LCS**: Common sequences
- **Semantic**: Meaning similarity

For code assignments, also includes:
- **AST**: Structure analysis
- **CFG**: Logic flow
- **Winnowing**: Code fingerprints

---

## 🎯 Sample Assignments Included

The system comes with 2 pre-loaded assignments:

### 1. Introduction to Data Structures (Text)
- Type: Text/Essay
- Max Score: 100
- Instructions: Write about data structures

### 2. Implement Binary Search (Code)
- Type: Code
- Language: JavaScript
- Max Score: 100
- Instructions: Implement binary search algorithm

---

## 🔄 Switching Roles

To switch between teacher and student:
1. Navigate back to `/plagiarism`
2. The system will show role selection
3. Choose your new role

Or manually:
```javascript
// In browser console
localStorage.removeItem('plagiarism_current_user');
localStorage.removeItem('plagiarism_user_role');
// Then refresh the page
```

---

## 💡 Pro Tips

### For Teachers
- ✅ Wait for all submissions before running analysis
- ✅ Check multiple algorithm scores, not just overall
- ✅ Review flagged matches manually
- ✅ Download reports for documentation
- ✅ Set clear deadlines

### For Students
- ✅ Submit early to allow time for updates
- ✅ Write original content
- ✅ Review instructions carefully
- ✅ Keep a backup of your work
- ✅ Check submission status

---

## 🐛 Troubleshooting

### "No assignments available"
- Switch to teacher mode and create an assignment first

### "Need at least 2 submissions"
- Get at least 2 students to submit
- Or create test submissions by switching roles

### Analysis not working
- Check browser console for errors
- Ensure submissions have content
- Try refreshing the page

### Can't switch roles
- Clear plagiarism-related localStorage
- Refresh the page

---

## 📱 Mobile Access

The system is fully responsive:
- ✅ Works on phones and tablets
- ✅ Touch-friendly interface
- ✅ Adaptive layouts
- ✅ Scrollable content areas

---

## 🎓 Learning Resources

### Understanding Algorithms
- **Jaccard**: Measures word overlap (set intersection/union)
- **Cosine**: Compares document vectors (angle between)
- **TF-IDF**: Weighs important terms (frequency × rarity)
- **Levenshtein**: Counts character edits needed
- **LCS**: Finds longest matching sequence

### Code Detection
- **AST**: Analyzes syntax tree structure
- **CFG**: Maps program control flow
- **Winnowing**: Creates code fingerprints

---

## 🚀 Next Steps

1. ✅ Create your first assignment
2. ✅ Test with sample submissions
3. ✅ Run plagiarism analysis
4. ✅ Explore detailed comparisons
5. ✅ Download a PDF report
6. ✅ Try code assignments
7. ✅ Experiment with different text similarities

---

## 📞 Need Help?

- 📖 Read: `PLAGIARISM_SYSTEM.md` for full documentation
- 🔍 Check: Browser console for error messages
- 💬 Review: Assignment instructions carefully
- 🎯 Test: With sample data first

---

**Happy Testing! 🎉**

The plagiarism detection system is ready to use. Start by creating an assignment and exploring the features!
